import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { CreditScoreService } from '../../creditScore/credit-score.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  AuditAction,
  AuditCategory,
  ApplicationStage,
} from '../../../common/enums';
import { generateLoanAccountNumber } from '../../../common/utils/loan-account-number.util';
import {
  paginate,
  buildPaginatedResponse,
} from '../../../common/dto/pagination.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  RejectApplicationDto,
  SendBackApplicationDto,
  PepScreeningDto,
} from '../dto/approval-transition.dto';

// Valid predecessor stage(s) for each transition — null means "no prior
// stage required" (an application with stage: null can still be supported).
const ALLOWED_FROM_STAGE: Record<
  'support' | 'check' | 'approve',
  (ApplicationStage | null)[]
> = {
  support: [null, ApplicationStage.INITIATED, ApplicationStage.SENT_BACK],
  check: [ApplicationStage.SUPPORTED, ApplicationStage.SENT_BACK],
  approve: [ApplicationStage.CHECKING],
};

@Injectable()
export class DashboardApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditScore: CreditScoreService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  private async getApplicationOrThrow(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { personalGuarantee: true, insurance: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  private assertTransitionAllowed(
    transition: keyof typeof ALLOWED_FROM_STAGE,
    currentStage: ApplicationStage | null,
  ) {
    if (!ALLOWED_FROM_STAGE[transition].includes(currentStage)) {
      throw new BadRequestException(
        `Cannot ${transition} an application at stage "${currentStage ?? 'none'}"`,
      );
    }
  }

  async support(userId: string, applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);
    this.assertTransitionAllowed('support', application.stage);

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        stage: ApplicationStage.SUPPORTED,
        supporterDate: new Date(),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_SUPPORTED,
      { stage: ApplicationStage.SUPPORTED },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async check(userId: string, applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);
    this.assertTransitionAllowed('check', application.stage);

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        stage: ApplicationStage.CHECKING,
        checkerDate: new Date(),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_CHECKED,
      { stage: ApplicationStage.CHECKING },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async approve(userId: string, applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);
    this.assertTransitionAllowed('approve', application.stage);

    const [updated, loanAccount] = await this.prisma.$transaction([
      this.prisma.loanApplication.update({
        where: { id: applicationId },
        data: {
          stage: ApplicationStage.APPROVED,
          approverDate: new Date(),
        },
      }),
      this.prisma.loanAccount.create({
        data: {
          applicationId,
          loanAccountNumber: generateLoanAccountNumber(),
        },
      }),
    ]);

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_APPROVED,
      { stage: ApplicationStage.APPROVED },
      applicationId,
      AuditCategory.APPROVAL,
    );
    await this.audit.log(
      userId,
      AuditAction.LOAN_ACCOUNT_CREATED,
      {
        loanAccountId: loanAccount.id,
        loanAccountNumber: loanAccount.loanAccountNumber,
      },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async reject(
    userId: string,
    applicationId: string,
    dto: RejectApplicationDto,
  ) {
    await this.getApplicationOrThrow(applicationId);

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        stage: ApplicationStage.REJECTED,
        rejectionReason: dto.reason,
        rejectedAt: new Date(),
        rejectedByUserId: userId,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_REJECTED,
      { reason: dto.reason },
      applicationId,
      AuditCategory.APPROVAL,
    );
    await this.notifications.notifyApplicationRejected(applicationId);
    return updated;
  }

  async sendBack(
    userId: string,
    applicationId: string,
    dto: SendBackApplicationDto,
  ) {
    await this.getApplicationOrThrow(applicationId);
    const toStage = dto.toStage ?? ApplicationStage.INITIATED;

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        stage: ApplicationStage.SENT_BACK,
        sentBackReason: dto.reason,
        sentBackAt: new Date(),
        sentBackByUserId: userId,
        sentBackToStage: toStage,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_SENT_BACK,
      { reason: dto.reason, toStage },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async recordPepScreening(
    userId: string,
    applicationId: string,
    dto: PepScreeningDto,
  ) {
    await this.getApplicationOrThrow(applicationId);

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        pepStatus: dto.status,
        pepRemarks: dto.remarks,
        pepCheckedAt: new Date(),
        pepCheckedByUserId: userId,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.PEP_SCREENING_RECORDED,
      { status: dto.status, remarks: dto.remarks },
      applicationId,
      AuditCategory.APPROVAL,
    );
    return updated;
  }

  async getSummary(applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);

    return {
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      status: application.status,
      dsgir: application.dsgir,
      loanToValueRatio: application.loanToValueRatio,
      ciclStatus: application.personalGuarantee?.ciclStatus ?? null,
      ciclRemarks: application.personalGuarantee?.ciclRemarks ?? null,
      identityType: application.identityType,
      identityNumber: application.identityNumber,
      citizenshipNumber: application.citizenshipNumber,
      riskGrade: application.riskGrade,
      collateralText: application.securityDetails,
      insuranceAttached: Boolean(application.insurance),
    };
  }

  async getCreditScore(applicationId: string) {
    await this.getApplicationOrThrow(applicationId);
    return this.creditScore.calculateByApplicationId(applicationId);
  }

  async getNrbChecklist(applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);

    // Derived, best-effort checklist — only items backed by real persisted
    // fields are booleans; everything else is explicitly marked "not tracked"
    // since there's no workflow/compliance-checklist model in this pass.
    return {
      applicationId: application.id,
      items: [
        {
          label: 'DSGIR within NRB limit',
          tracked: application.dsgir !== null,
          value: application.dsgir !== null ? application.dsgir <= 50 : null,
        },
        {
          label: 'LTV within NRB cap',
          tracked: application.loanToValueRatio !== null,
          value:
            application.loanToValueRatio !== null
              ? Number(application.loanToValueRatio) <= 60
              : null,
        },
        {
          label: 'CICL checked — no adverse',
          tracked: application.personalGuarantee?.ciclStatus !== undefined,
          value: application.personalGuarantee?.ciclStatus ?? null,
        },
        {
          label: 'Not blacklisted',
          tracked: application.isBlacklisted !== null,
          value:
            application.isBlacklisted !== null
              ? !application.isBlacklisted
              : null,
        },
        {
          label: 'Insurance attached',
          tracked: true,
          value: Boolean(application.insurance),
        },
        {
          label: 'PEP screening',
          tracked: application.pepStatus !== null,
          value: application.pepStatus !== null ? !application.pepStatus : null,
        },
        {
          label: 'NRB Rokka restriction check',
          tracked: false,
          value: null,
        },
      ],
    };
  }

  async getActivity(applicationId: string, query: PaginationDto) {
    await this.getApplicationOrThrow(applicationId);
    const { take, skip } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { applicationId },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where: { applicationId } }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
