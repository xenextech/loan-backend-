import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { EmiCalculatorService } from '../../utils/emi-calculator.service';
import {
  AuditAction,
  AuditCategory,
  NrbLoanClassification,
} from '../../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
  PaginationDto,
} from '../../../common/dto/pagination.dto';
import {
  OverdueQueryDto,
  MarkEmiPaidDto,
  OverdueBucket,
} from '../dto/repayment.dto';
import { EMI_NOTIFICATION_TRIGGERS } from './emi-notification-triggers.constant';

// NRB-aligned aging buckets (days overdue).
const BUCKET_RANGES: Record<OverdueBucket, [number, number]> = {
  '1-30': [1, 30],
  '31-90': [31, 90],
  '91-180': [91, 180],
  '181-365': [181, 365],
  '365+': [366, Infinity],
};

@Injectable()
export class DashboardRepaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly emiCalculator: EmiCalculatorService,
  ) {}

  async generateSchedule(userId: string, applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { loanInformation: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    const loanAmount = Number(
      application.creditLimit ?? application.loanInformation?.loanAmount ?? 0,
    );
    const interestRate = Number(application.interestRate ?? 0);
    const tenureMonths =
      application.periodUnit === 'YEAR'
        ? (application.period ?? 0) * 12
        : (application.period ?? 0);

    if (loanAmount <= 0 || interestRate <= 0 || tenureMonths <= 0) {
      throw new BadRequestException(
        'Application is missing loan amount, interest rate, or period required to generate an EMI schedule',
      );
    }

    const { monthlyEmi } = this.emiCalculator.calculate({
      loanAmount,
      interestRate,
      tenureMonths,
    });

    const monthlyRate = interestRate / 12 / 100;
    let outstanding = loanAmount;
    const entries: {
      applicationId: string;
      installmentNumber: number;
      dueDate: Date;
      emiAmount: number;
      principalComponent: number;
      interestComponent: number;
      outstandingPrincipal: number;
    }[] = [];

    const startDate = new Date();
    for (let i = 1; i <= tenureMonths; i++) {
      const interestComponent =
        Math.round(outstanding * monthlyRate * 100) / 100;
      let principalComponent =
        Math.round((monthlyEmi - interestComponent) * 100) / 100;
      if (i === tenureMonths) principalComponent = outstanding;
      outstanding = Math.round((outstanding - principalComponent) * 100) / 100;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      entries.push({
        applicationId,
        installmentNumber: i,
        dueDate,
        emiAmount: monthlyEmi,
        principalComponent,
        interestComponent,
        outstandingPrincipal: Math.max(outstanding, 0),
      });
    }

    // Idempotent: replace any previously generated schedule for this application.
    await this.prisma.emiScheduleEntry.deleteMany({ where: { applicationId } });
    await this.prisma.emiScheduleEntry.createMany({ data: entries });

    await this.audit.log(
      userId,
      AuditAction.EMI_SCHEDULE_GENERATED,
      { installments: tenureMonths, monthlyEmi },
      applicationId,
      AuditCategory.REPAYMENT,
    );

    return this.prisma.emiScheduleEntry.findMany({
      where: { applicationId },
      orderBy: { installmentNumber: 'asc' },
    });
  }

  async getSchedule(applicationId: string, query: PaginationDto) {
    const { take, skip } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.emiScheduleEntry.findMany({
        where: { applicationId },
        take,
        skip,
        orderBy: { installmentNumber: 'asc' },
      }),
      this.prisma.emiScheduleEntry.count({ where: { applicationId } }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async getOverdue(query: OverdueQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const now = new Date();

    const where: {
      status: 'OVERDUE';
      dueDate?: { gte?: Date; lte?: Date };
    } = { status: 'OVERDUE' };

    if (query.bucket) {
      const [min, max] = BUCKET_RANGES[query.bucket];
      const maxDate = new Date(now.getTime() - min * 24 * 60 * 60 * 1000);
      const minDate =
        max === Infinity
          ? undefined
          : new Date(now.getTime() - max * 24 * 60 * 60 * 1000);
      where.dueDate = {
        lte: maxDate,
        ...(minDate ? { gte: minDate } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.emiScheduleEntry.findMany({
        where,
        take,
        skip,
        orderBy: { dueDate: 'asc' },
        include: {
          application: {
            select: { id: true, applicationNumber: true, fullName: true },
          },
        },
      }),
      this.prisma.emiScheduleEntry.count({ where }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async getOverview() {
    const now = new Date();
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const day180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const day365 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const [
      dueToday,
      overdue1to30,
      overdue31to90,
      overdue91to180,
      overdue181to365,
      overdue365Plus,
      paidCount,
      totalDueCount,
    ] = await Promise.all([
      this.prisma.emiScheduleEntry.aggregate({
        _sum: { emiAmount: true },
        _count: true,
        where: {
          status: 'UPCOMING',
          dueDate: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),
      this.prisma.emiScheduleEntry.aggregate({
        _sum: { emiAmount: true },
        _count: true,
        where: { status: 'OVERDUE', dueDate: { gte: day30, lt: now } },
      }),
      this.prisma.emiScheduleEntry.aggregate({
        _sum: { emiAmount: true },
        _count: true,
        where: { status: 'OVERDUE', dueDate: { gte: day90, lt: day30 } },
      }),
      this.prisma.emiScheduleEntry.aggregate({
        _sum: { emiAmount: true },
        _count: true,
        where: { status: 'OVERDUE', dueDate: { gte: day180, lt: day90 } },
      }),
      this.prisma.emiScheduleEntry.aggregate({
        _sum: { emiAmount: true },
        _count: true,
        where: { status: 'OVERDUE', dueDate: { gte: day365, lt: day180 } },
      }),
      this.prisma.emiScheduleEntry.aggregate({
        _sum: { emiAmount: true },
        _count: true,
        where: { status: 'OVERDUE', dueDate: { lt: day365 } },
      }),
      this.prisma.emiScheduleEntry.count({
        where: { status: 'PAID', dueDate: { lt: now } },
      }),
      this.prisma.emiScheduleEntry.count({ where: { dueDate: { lt: now } } }),
    ]);

    const collectionEfficiency =
      totalDueCount > 0
        ? Number(((paidCount / totalDueCount) * 100).toFixed(1))
        : null;

    return {
      dueToday: {
        amount: dueToday._sum.emiAmount ?? 0,
        count: dueToday._count,
      },
      overdue1to30: {
        amount: overdue1to30._sum.emiAmount ?? 0,
        count: overdue1to30._count,
      },
      overdue31to90: {
        amount: overdue31to90._sum.emiAmount ?? 0,
        count: overdue31to90._count,
      },
      overdue91to180: {
        amount: overdue91to180._sum.emiAmount ?? 0,
        count: overdue91to180._count,
      },
      overdue181to365: {
        amount: overdue181to365._sum.emiAmount ?? 0,
        count: overdue181to365._count,
      },
      overdue365Plus: {
        amount: overdue365Plus._sum.emiAmount ?? 0,
        count: overdue365Plus._count,
      },
      collectionEfficiency,
    };
  }

  async markPaid(userId: string, entryId: string, dto: MarkEmiPaidDto) {
    const entry = await this.prisma.emiScheduleEntry.findUnique({
      where: { id: entryId },
    });
    if (!entry) throw new NotFoundException('EMI schedule entry not found');

    const fullyPaid = dto.paidAmount >= Number(entry.emiAmount);

    const updated = await this.prisma.emiScheduleEntry.update({
      where: { id: entryId },
      data: {
        paidAmount: dto.paidAmount,
        paidDate: new Date(dto.paidDate),
        status: fullyPaid ? 'PAID' : 'PARTIAL',
      },
    });

    await this.audit.log(
      userId,
      AuditAction.EMI_PAYMENT_RECORDED,
      { entryId, paidAmount: dto.paidAmount },
      entry.applicationId,
      AuditCategory.REPAYMENT,
    );

    if (fullyPaid) {
      const remaining = await this.prisma.emiScheduleEntry.count({
        where: { applicationId: entry.applicationId, status: { not: 'PAID' } },
      });
      if (remaining === 0) {
        const loanAccount = await this.prisma.loanAccount.updateMany({
          where: { applicationId: entry.applicationId, status: 'ACTIVE' },
          data: { status: 'CLEARED' },
        });
        if (loanAccount.count > 0) {
          await this.audit.log(
            userId,
            AuditAction.LOAN_CLEARED,
            { applicationId: entry.applicationId },
            entry.applicationId,
            AuditCategory.REPAYMENT,
          );
        }
      }
    }

    return updated;
  }

  getNotificationTriggers() {
    return EMI_NOTIFICATION_TRIGGERS;
  }

  // Bulk-transitions due entries to OVERDUE. Called by the daily cron job
  // (not exposed as a dashboard endpoint) — attributed to a system userId
  // since there's no requesting staff member for a scheduled job.
  async markOverdueEntries(userId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const dueEntries = await this.prisma.emiScheduleEntry.findMany({
      where: {
        status: { in: ['UPCOMING', 'PARTIAL'] },
        dueDate: { lt: startOfToday },
      },
      include: {
        application: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
    if (dueEntries.length === 0) return [];

    await this.prisma.emiScheduleEntry.updateMany({
      where: { id: { in: dueEntries.map((e) => e.id) } },
      data: { status: 'OVERDUE' },
    });

    await this.audit.log(
      userId,
      AuditAction.EMI_MARKED_OVERDUE,
      { count: dueEntries.length, entryIds: dueEntries.map((e) => e.id) },
      undefined,
      AuditCategory.REPAYMENT,
    );

    return dueEntries;
  }

  // Entries whose dueDate is exactly `offsetDays` away from today (negative
  // = still upcoming, positive = already overdue by that many days) —
  // used by the cron job to fire the right reminder for each trigger.
  // dueDate = today - offsetDays, e.g. offsetDays -7 ("7 days" pre-due
  // reminder) means today is 7 days *before* the due date, so
  // dueDate = today + 7.
  async getEntriesDueForReminder(offsetDays: number) {
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() - offsetDays);
    const nextDay = new Date(target);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.emiScheduleEntry.findMany({
      where: {
        status: offsetDays > 0 ? 'OVERDUE' : 'UPCOMING',
        dueDate: { gte: target, lt: nextDay },
      },
      include: {
        application: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  // Business rule: penal interest = contract interest rate + 2%, simple daily
  // interest on the overdue EMI amount, accrued once per day for every entry
  // currently OVERDUE. Called by the daily cron, attributed to the system user.
  async accruePenalInterest(userId: string) {
    const PENAL_MARKUP_PERCENT = 2;

    const overdueEntries = await this.prisma.emiScheduleEntry.findMany({
      where: { status: 'OVERDUE' },
      include: { application: { select: { interestRate: true } } },
    });
    if (overdueEntries.length === 0) return 0;

    await this.prisma.$transaction(
      overdueEntries.map((entry) => {
        const contractRate = Number(entry.application.interestRate ?? 0);
        const penalRate = contractRate + PENAL_MARKUP_PERCENT;
        const dailyPenalInterest =
          (Number(entry.emiAmount) * penalRate) / 100 / 365;
        const newAccrued =
          Math.round(
            (Number(entry.penalInterestAccrued) + dailyPenalInterest) * 100,
          ) / 100;

        return this.prisma.emiScheduleEntry.update({
          where: { id: entry.id },
          data: { penalInterestAccrued: newAccrued },
        });
      }),
    );

    await this.audit.log(
      userId,
      AuditAction.PENAL_INTEREST_ACCRUED,
      { count: overdueEntries.length },
      undefined,
      AuditCategory.REPAYMENT,
    );

    return overdueEntries.length;
  }

  // Business rule: reclassify each loan (not each installment) by its oldest
  // unpaid installment's days-overdue — PASS (<90d) -> SUBSTANDARD (90-179d)
  // -> DOUBTFUL (180-364d) -> LOSS (365d+). Loans with no overdue installments
  // are reset back to PASS. Called by the daily cron. Label only for now — does
  // not gate disbursement, reporting, or any other behavior.
  async reclassifyLoans(userId: string) {
    const now = new Date();

    const overdueByApplication = await this.prisma.emiScheduleEntry.groupBy({
      by: ['applicationId'],
      where: { status: 'OVERDUE' },
      _min: { dueDate: true },
    });

    const classify = (daysOverdue: number): NrbLoanClassification => {
      if (daysOverdue >= 365) return 'LOSS';
      if (daysOverdue >= 180) return 'DOUBTFUL';
      if (daysOverdue >= 90) return 'SUBSTANDARD';
      return 'PASS';
    };

    const reclassified = overdueByApplication.map((row) => {
      const oldestDueDate = row._min.dueDate!;
      const daysOverdue = Math.floor(
        (now.getTime() - oldestDueDate.getTime()) / (24 * 60 * 60 * 1000),
      );
      return {
        applicationId: row.applicationId,
        classification: classify(daysOverdue),
      };
    });

    const stillOverdueIds = reclassified.map((r) => r.applicationId);

    await this.prisma.$transaction([
      // Loans that no longer have any overdue installment go back to PASS.
      this.prisma.loanApplication.updateMany({
        where: {
          nrbClassification: { not: 'PASS' },
          id: { notIn: stillOverdueIds },
        },
        data: { nrbClassification: 'PASS', nrbClassifiedAt: now },
      }),
      ...reclassified.map((r) =>
        this.prisma.loanApplication.update({
          where: { id: r.applicationId },
          data: { nrbClassification: r.classification, nrbClassifiedAt: now },
        }),
      ),
    ]);

    await this.audit.log(
      userId,
      AuditAction.LOAN_RECLASSIFIED,
      { count: reclassified.length },
      undefined,
      AuditCategory.REPAYMENT,
    );

    return reclassified.length;
  }
}
