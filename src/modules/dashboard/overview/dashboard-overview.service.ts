import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  paginate,
  buildPaginatedResponse,
  PaginationDto,
} from '../../../common/dto/pagination.dto';
import { CommissionPartnerType } from '../../../common/enums';

@Injectable()
export class DashboardOverviewService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      portfolioTotal,
      pendingMyActionCount,
      overdueEmi,
      commissionEntries,
      initiated,
      supported,
      checking,
      approved,
      alerts,
    ] = await Promise.all([
      this.prisma.disbursement.aggregate({
        _sum: { totalDisbursedAmount: true },
        where: { status: { in: ['PARTIAL', 'COMPLETED'] } },
      }),
      this.prisma.loanApplication.count({
        where: {
          stage: { in: ['INITIATED', 'SUPPORTED', 'CHECKING', 'SENT_BACK'] },
        },
      }),
      this.prisma.emiScheduleEntry.aggregate({
        _sum: { emiAmount: true },
        _count: true,
        where: { status: 'OVERDUE' },
      }),
      this.prisma.commissionEntry.findMany({
        where: { month: { gte: monthStart, lte: monthEnd } },
        include: { partner: { select: { partnerType: true } } },
      }),
      this.prisma.loanApplication.count({ where: { stage: 'INITIATED' } }),
      this.prisma.loanApplication.count({ where: { stage: 'SUPPORTED' } }),
      this.prisma.loanApplication.count({ where: { stage: 'CHECKING' } }),
      this.prisma.loanApplication.count({ where: { stage: 'APPROVED' } }),
      this.buildAlerts(),
    ]);

    const commissionThisMonth = commissionEntries.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const commissionFromBanks = commissionEntries
      .filter((e) => e.partner.partnerType === CommissionPartnerType.BANK)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const commissionFromColleges = commissionEntries
      .filter((e) => e.partner.partnerType === CommissionPartnerType.COLLEGE)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      portfolioTotal: portfolioTotal._sum.totalDisbursedAmount ?? 0,
      pendingMyActionCount,
      overdueEmi: {
        count: overdueEmi._count,
        amount: overdueEmi._sum.emiAmount ?? 0,
      },
      commissionThisMonth: {
        total: commissionThisMonth,
        fromBanks: commissionFromBanks,
        fromColleges: commissionFromColleges,
      },
      approvalPipeline: {
        initiated,
        supported,
        checking,
        approved,
      },
      alerts,
    };
  }

  async getCheckerQueue(query: PaginationDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = { stage: 'SUPPORTED' as const };

    const [data, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where,
        take,
        skip,
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          applicationNumber: true,
          fullName: true,
          branch: true,
          riskGrade: true,
          submittedAt: true,
          loanInformation: { select: { loanAmount: true } },
        },
      }),
      this.prisma.loanApplication.count({ where }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async getAlerts(query: PaginationDto) {
    const alerts = await this.buildAlerts();
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const start = (page - 1) * limit;
    const data = alerts.slice(start, start + limit);
    return buildPaginatedResponse(data, alerts.length, page, limit);
  }

  private async buildAlerts() {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [ciclFlags, expiringPolicies, overdueEmis] = await Promise.all([
      this.prisma.personalGuarantee.findMany({
        where: { ciclStatus: false },
        select: { applicationId: true },
        take: 20,
      }),
      this.prisma.insurancePolicy.findMany({
        where: { expiryDate: { lte: in30Days, gte: now } },
        select: { applicationId: true, policyNumber: true, expiryDate: true },
        take: 20,
      }),
      this.prisma.emiScheduleEntry.findMany({
        where: { status: 'OVERDUE' },
        select: { applicationId: true, dueDate: true, emiAmount: true },
        take: 20,
      }),
    ]);

    return [
      ...ciclFlags.map((f) => ({
        type: 'CICL_FLAG',
        applicationId: f.applicationId,
        message: 'CICL blacklist match — application frozen for review.',
      })),
      ...expiringPolicies.map((p) => ({
        type: 'INSURANCE_EXPIRING',
        applicationId: p.applicationId,
        message: `Insurance policy ${p.policyNumber} expiring ${p.expiryDate.toDateString()}.`,
      })),
      ...overdueEmis.map((e) => ({
        type: 'EMI_OVERDUE',
        applicationId: e.applicationId,
        message: `EMI of ${Number(e.emiAmount)} overdue since ${e.dueDate.toDateString()}.`,
      })),
    ];
  }
}
