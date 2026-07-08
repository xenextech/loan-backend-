import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { EmiCalculatorService } from '../../utils/emi-calculator.service';
import { NotificationsService } from '../../notifications/notifications.service';
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
import {
  ConfigureLoanServicingDto,
  RecordCollectionActivityDto,
  FlagNeedsReviewDto,
  ResolveReviewDto,
} from '../dto/loan-servicing.dto';
import { EMI_NOTIFICATION_TRIGGERS } from './emi-notification-triggers.constant';

// NRB-aligned aging buckets (days overdue).
const BUCKET_RANGES: Record<OverdueBucket, [number, number]> = {
  '1-30': [1, 30],
  '31-90': [31, 90],
  '91-180': [91, 180],
  '181-365': [181, 365],
  '365+': [366, Infinity],
};

// Repayment frequency → (months per installment period, installments per year).
// MONTHLY is the default and reduces to exactly the pre-frequency-support math.
const FREQUENCY_CONFIG: Record<
  string,
  { periodMonths: number; installmentsPerYear: number }
> = {
  MONTHLY: { periodMonths: 1, installmentsPerYear: 12 },
  QUARTERLY: { periodMonths: 3, installmentsPerYear: 4 },
  YEARLY: { periodMonths: 12, installmentsPerYear: 1 },
};

@Injectable()
export class DashboardRepaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly emiCalculator: EmiCalculatorService,
    private readonly notifications: NotificationsService,
  ) {}

  // Reads the loan's servicing configuration (if the Credit Manager has set
  // one via configureServicing()) and falls back to the originally approved
  // application fields otherwise — so applications with no servicing config
  // yet generate exactly the same schedule as before this feature existed.
  async generateSchedule(userId: string, applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { loanInformation: true, disbursement: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { applicationId },
    });

    // Principal is the actual approved *disbursement* amount, not the
    // originally approved credit limit — the two can differ once tranches
    // are confirmed. Falls back to the approved credit limit only when
    // nothing has been disbursed yet.
    const loanAmount = Number(
      application.disbursement?.totalDisbursedAmount ??
        application.creditLimit ??
        application.loanInformation?.loanAmount ??
        0,
    );
    const interestRate = Number(
      loanAccount?.finalInterestRate ?? application.interestRate ?? 0,
    );
    const tenureMonths =
      loanAccount?.finalTenureMonths ??
      (application.periodUnit === 'YEAR'
        ? (application.period ?? 0) * 12
        : (application.period ?? 0));
    const gracePeriodMonths = loanAccount?.gracePeriodMonths ?? 0;
    const frequency = loanAccount?.repaymentFrequency ?? 'MONTHLY';
    const { periodMonths, installmentsPerYear } = FREQUENCY_CONFIG[frequency];

    if (loanAmount <= 0 || interestRate <= 0 || tenureMonths <= 0) {
      throw new BadRequestException(
        'Application is missing loan amount, interest rate, or period required to generate an EMI schedule',
      );
    }
    if (tenureMonths % periodMonths !== 0) {
      throw new BadRequestException(
        `Tenure (${tenureMonths} months) must be a multiple of ${periodMonths} for ${frequency.toLowerCase()} repayment`,
      );
    }

    const numberOfInstallments = tenureMonths / periodMonths;
    const { monthlyEmi: installmentAmount } = this.emiCalculator.calculate({
      loanAmount,
      interestRate,
      tenureMonths,
      installmentsPerYear,
    });

    const periodicRate = interestRate / installmentsPerYear / 100;
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

    const startDate = loanAccount?.emiStartDate ?? new Date();
    for (let i = 1; i <= numberOfInstallments; i++) {
      const interestComponent =
        Math.round(outstanding * periodicRate * 100) / 100;
      let principalComponent =
        Math.round((installmentAmount - interestComponent) * 100) / 100;
      if (i === numberOfInstallments) principalComponent = outstanding;
      outstanding = Math.round((outstanding - principalComponent) * 100) / 100;

      // gracePeriodMonths only delays when the schedule starts — it does not
      // change the amortization math, so a grace period never accrues
      // interest on its own.
      const dueDate = new Date(startDate);
      dueDate.setMonth(
        dueDate.getMonth() + gracePeriodMonths + i * periodMonths,
      );

      entries.push({
        applicationId,
        installmentNumber: i,
        dueDate,
        emiAmount: installmentAmount,
        principalComponent,
        interestComponent,
        outstandingPrincipal: Math.max(outstanding, 0),
      });
    }

    // Idempotent: replace any previously generated schedule for this application.
    await this.prisma.emiScheduleEntry.deleteMany({ where: { applicationId } });
    await this.prisma.emiScheduleEntry.createMany({ data: entries });

    if (loanAccount) {
      await this.prisma.loanAccount.update({
        where: { applicationId },
        data: { firstDueDate: entries[0]?.dueDate },
      });
    }

    await this.audit.log(
      userId,
      AuditAction.EMI_SCHEDULE_GENERATED,
      { installments: numberOfInstallments, installmentAmount, frequency },
      applicationId,
      AuditCategory.REPAYMENT,
    );

    return this.prisma.emiScheduleEntry.findMany({
      where: { applicationId },
      orderBy: { installmentNumber: 'asc' },
    });
  }

  // ── Loan Servicing: Stage 1 — Configuration ────────────────────────────────
  // Approved principal is never touched here (see ConfigureLoanServicingDto) —
  // only rate/tenure/grace-period/start-date. Regenerates the schedule via the
  // same generateSchedule() every other caller uses, so there is exactly one
  // amortization code path.
  async configureServicing(
    userId: string,
    applicationId: string,
    dto: ConfigureLoanServicingDto,
  ) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { applicationId },
    });
    if (!loanAccount) {
      throw new NotFoundException(
        'This application has no loan account yet — it must be approved before loan servicing can be configured',
      );
    }
    if (loanAccount.status === 'CLEARED') {
      throw new BadRequestException(
        'This loan is already cleared and cannot be reconfigured',
      );
    }

    await this.prisma.loanAccount.update({
      where: { applicationId },
      data: {
        finalInterestRate: dto.finalInterestRate,
        finalTenureMonths: dto.finalTenureMonths,
        repaymentFrequency: dto.repaymentFrequency,
        gracePeriodMonths: dto.gracePeriodMonths,
        emiStartDate: dto.emiStartDate ? new Date(dto.emiStartDate) : undefined,
        configuredByUserId: userId,
        configuredAt: new Date(),
      },
    });

    const schedule = await this.generateSchedule(userId, applicationId);
    const installmentAmount = Number(schedule[0]?.emiAmount ?? 0);
    const totalRepayable = schedule.reduce(
      (sum, e) => sum + Number(e.emiAmount),
      0,
    );

    await this.audit.log(
      userId,
      AuditAction.LOAN_SERVICING_CONFIGURED,
      {
        finalInterestRate: dto.finalInterestRate,
        finalTenureMonths: dto.finalTenureMonths,
        repaymentFrequency: dto.repaymentFrequency,
        gracePeriodMonths: dto.gracePeriodMonths,
        emiStartDate: dto.emiStartDate,
      },
      applicationId,
      AuditCategory.REPAYMENT,
    );

    const [updatedLoanAccount, applicationWithDisbursement] =
      await Promise.all([
        this.prisma.loanAccount.findUnique({ where: { applicationId } }),
        this.prisma.loanApplication.findUnique({
          where: { id: applicationId },
          include: { disbursement: true },
        }),
      ]);
    const disbursementAmount = Number(
      applicationWithDisbursement?.disbursement?.totalDisbursedAmount ??
        applicationWithDisbursement?.creditLimit ??
        0,
    );

    return {
      ...updatedLoanAccount,
      installmentAmount,
      totalRepayable,
      numberOfInstallments: schedule.length,
      disbursementAmount,
    };
  }

  // ── Loan Servicing: Stage 2 — Notify Student & Parent ──────────────────────
  async notifyBorrower(userId: string, applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { parentVerification: true, disbursement: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { applicationId },
    });
    if (!loanAccount || !loanAccount.configuredAt) {
      throw new BadRequestException(
        'Configure loan servicing before notifying the borrower',
      );
    }

    const scheduleEntries = await this.prisma.emiScheduleEntry.findMany({
      where: { applicationId },
      orderBy: { installmentNumber: 'asc' },
    });
    if (scheduleEntries.length === 0) {
      throw new BadRequestException(
        'No EMI schedule found for this application',
      );
    }

    const totalRepayable = scheduleEntries.reduce(
      (sum, e) => sum + Number(e.emiAmount),
      0,
    );

    const result = await this.notifications.notifyLoanFinalized({
      userId: application.userId,
      applicationId,
      fullName: application.fullName,
      email: application.email,
      phoneNumber: application.phoneNumber,
      parentPhone:
        application.parentVerification?.phone ??
        application.parentVerification?.contact ??
        null,
      approvedAmount: Number(application.creditLimit ?? 0),
      disbursementAmount: Number(
        application.disbursement?.totalDisbursedAmount ??
          application.creditLimit ??
          0,
      ),
      interestRate: Number(
        loanAccount.finalInterestRate ?? application.interestRate ?? 0,
      ),
      emiAmount: Number(scheduleEntries[0].emiAmount),
      tenureMonths: loanAccount.finalTenureMonths ?? scheduleEntries.length,
      repaymentFrequency: loanAccount.repaymentFrequency,
      gracePeriodMonths: loanAccount.gracePeriodMonths,
      firstDueDate: scheduleEntries[0].dueDate,
      totalRepayable,
    });

    await this.prisma.loanAccount.update({
      where: { applicationId },
      data: { borrowerNotifiedAt: new Date() },
    });

    await this.audit.log(
      userId,
      AuditAction.LOAN_SERVICING_NOTIFIED,
      result,
      applicationId,
      AuditCategory.REPAYMENT,
    );

    return result;
  }

  // ── Loan Servicing: Stage 4 — Collection & Follow-up ───────────────────────
  async recordCollectionActivity(
    userId: string,
    applicationId: string,
    dto: RecordCollectionActivityDto,
  ) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      select: { id: true },
    });
    if (!application) throw new NotFoundException('Application not found');

    const activity = await this.prisma.collectionActivity.create({
      data: {
        applicationId,
        createdByUserId: userId,
        activityType: dto.activityType,
        notes: dto.notes,
        contactedPerson: dto.contactedPerson,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.COLLECTION_ACTIVITY_RECORDED,
      { activityId: activity.id, activityType: dto.activityType },
      applicationId,
      AuditCategory.REPAYMENT,
    );

    return activity;
  }

  async listCollectionActivity(applicationId: string, query: PaginationDto) {
    const { take, skip } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.collectionActivity.findMany({
        where: { applicationId },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.collectionActivity.count({ where: { applicationId } }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  // ── Loan Servicing: Stage 6 — Needs Review ─────────────────────────────────
  // Manually raised only — no automatic threshold (e.g. "N missed
  // installments") was specified, so none is guessed here.
  async flagNeedsReview(
    userId: string,
    applicationId: string,
    dto: FlagNeedsReviewDto,
  ) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { applicationId },
    });
    if (!loanAccount) throw new NotFoundException('Loan account not found');
    if (loanAccount.status === 'CLEARED') {
      throw new BadRequestException('This loan is already cleared');
    }

    const updated = await this.prisma.loanAccount.update({
      where: { applicationId },
      data: {
        status: 'NEEDS_REVIEW',
        reviewReason: dto.reason,
        reviewRequestedByUserId: userId,
        reviewRequestedAt: new Date(),
        reviewResolvedByUserId: null,
        reviewResolvedAt: null,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.LOAN_NEEDS_REVIEW,
      { reason: dto.reason },
      applicationId,
      AuditCategory.REPAYMENT,
    );

    return updated;
  }

  async resolveReview(
    userId: string,
    applicationId: string,
    dto: ResolveReviewDto,
  ) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { applicationId },
    });
    if (!loanAccount) throw new NotFoundException('Loan account not found');
    if (loanAccount.status !== 'NEEDS_REVIEW') {
      throw new BadRequestException('This loan is not currently under review');
    }

    const updated = await this.prisma.loanAccount.update({
      where: { applicationId },
      data: {
        status: 'ACTIVE',
        reviewResolvedByUserId: userId,
        reviewResolvedAt: new Date(),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.LOAN_REVIEW_RESOLVED,
      { resolutionNotes: dto.resolutionNotes },
      applicationId,
      AuditCategory.REPAYMENT,
    );

    return updated;
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
          data: { status: 'CLEARED', clearedAt: new Date() },
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
            userId: true,
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
