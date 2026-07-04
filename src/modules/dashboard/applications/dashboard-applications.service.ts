import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  paginate,
  buildPaginatedResponse,
} from '../../../common/dto/pagination.dto';
import { DashboardApplicationsQueryDto } from '../dto/dashboard-applications-query.dto';

@Injectable()
export class DashboardApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(
    query: DashboardApplicationsQueryDto,
  ): Prisma.LoanApplicationWhereInput {
    const where: Prisma.LoanApplicationWhereInput = {
      status: 'SUBMITTED',
    };

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

  async list(query: DashboardApplicationsQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = this.buildWhere(query);

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
      stage: a.status,
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
}
