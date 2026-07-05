import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreditScoreService } from '../../creditScore/credit-score.service';
import { UserRole, ApplicationStage } from '../../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
  PaginationDto,
} from '../../../common/dto/pagination.dto';
import { DashboardApplicationsQueryDto } from '../dto/dashboard-applications-query.dto';

// "My queue" depends on which stage each role acts on next.
const MY_QUEUE_STAGE_FOR_ROLE: Partial<Record<UserRole, ApplicationStage>> = {
  [UserRole.SUPPORTER]: ApplicationStage.INITIATED,
  [UserRole.CREDIT_MANAGER]: ApplicationStage.SUPPORTED,
  [UserRole.CHECKER]: ApplicationStage.SUPPORTED,
  [UserRole.APPROVER]: ApplicationStage.CHECKING,
};

@Injectable()
export class DashboardApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditScore: CreditScoreService,
  ) {}

  private buildFilterWhere(
    filter: DashboardApplicationsQueryDto['filter'],
    role?: UserRole,
  ): Prisma.LoanApplicationWhereInput {
    switch (filter) {
      case 'my-queue': {
        const stage = role ? MY_QUEUE_STAGE_FOR_ROLE[role] : undefined;
        return stage ? { stage } : { stage: { in: [] } };
      }
      case 'pending':
        return {
          stage: {
            in: [
              ApplicationStage.INITIATED,
              ApplicationStage.SUPPORTED,
              ApplicationStage.CHECKING,
            ],
          },
        };
      case 'approval':
        return { stage: ApplicationStage.CHECKING };
      case 'disbursement':
        return { stage: ApplicationStage.APPROVED };
      case 'rejected':
        return { stage: ApplicationStage.REJECTED };
      case 'sent-back':
        return { stage: ApplicationStage.SENT_BACK };
      default:
        return { status: 'SUBMITTED' };
    }
  }

  private buildWhere(
    query: DashboardApplicationsQueryDto,
    role?: UserRole,
  ): Prisma.LoanApplicationWhereInput {
    // Stage-based filters intentionally replace (not AND with) the default
    // status: SUBMITTED restriction — stage is the real workflow driver and
    // should surface bank-created applications too, not just student ones.
    const where = this.buildFilterWhere(query.filter, role);

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { applicationNumber: { contains: query.search, mode: 'insensitive' } },
        { citizenshipNumber: { contains: query.search } },
        { phoneNumber: { contains: query.search } },
      ];
    }

    if (query.branch) where.branch = query.branch;

    if (query.dateFrom || query.dateTo) {
      where.submittedAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }

    return where;
  }

  private daysOpen(app: { submittedAt: Date | null; createdAt: Date }) {
    const start = app.submittedAt ?? app.createdAt;
    return Math.floor((Date.now() - start.getTime()) / (24 * 60 * 60 * 1000));
  }

  async list(query: DashboardApplicationsQueryDto, role?: UserRole) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = this.buildWhere(query, role);

    const [data, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where,
        take,
        skip,
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          applicationNumber: true,
          submittedAt: true,
          createdAt: true,
          fullName: true,
          branch: true,
          facility: true,
          riskGrade: true,
          dsgir: true,
          loanToValueRatio: true,
          creditLimit: true,
          status: true,
          stage: true,
        },
      }),
      this.prisma.loanApplication.count({ where }),
    ]);

    const rows = data.map((a) => ({
      id: a.id,
      refNo: a.applicationNumber,
      date: a.submittedAt ?? a.createdAt,
      borrower: a.fullName,
      branch: a.branch,
      type: a.facility,
      amount: a.creditLimit,
      grade: a.riskGrade,
      status: a.status,
      stage: a.stage,
      dsgir: a.dsgir,
      ltv: a.loanToValueRatio,
      daysOpen: this.daysOpen(a),
    }));

    return buildPaginatedResponse(
      rows,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async getOne(id: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        studyInformation: true,
        loanInformation: true,
        personalGuarantee: true,
        insurance: true,
        familyMember: true,
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  // Merges what used to be 3+ separate calls (full record, credit score,
  // audit trail) into one payload for the applicant detail view.
  async getDetail(id: string, activityQuery: PaginationDto) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        studyInformation: true,
        loanInformation: true,
        personalGuarantee: true,
        insurance: true,
        familyMember: true,
        loanAccount: true,
      },
    });
    if (!application) throw new NotFoundException('Application not found');

    const { take, skip } = paginate(activityQuery.page, activityQuery.limit);
    const [creditScore, activityData, activityTotal] = await Promise.all([
      this.creditScore.calculateByApplicationId(id).catch(() => null),
      this.prisma.auditLog.findMany({
        where: { applicationId: id },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where: { applicationId: id } }),
    ]);

    return {
      application,
      loanAccount: application.loanAccount,
      creditScore,
      activity: buildPaginatedResponse(
        activityData,
        activityTotal,
        activityQuery.page ?? 1,
        activityQuery.limit ?? 20,
      ),
    };
  }
}
