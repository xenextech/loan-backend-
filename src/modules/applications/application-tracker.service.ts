import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RepaymentFrequency } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuditAction,
  ApplicationStage,
  BankAccountOpeningStatus,
  UserRole,
} from '../../common/enums';
import { DashboardRepaymentService } from '../dashboard/repayment/dashboard-repayment.service';
import { resolveEffectiveLoanTerms } from '../../common/utils/loan-principal.util';
import {
  ApplicationTrackerResponseDto,
  RepaymentTrackerDto,
  TrackerOverallStatus,
  TrackerStageDto,
  TrackerStageKey,
  TrackerStageStatus,
} from './dto/application-tracker.dto';

// Audit actions the tracker reads to attribute "who completed this stage".
// Bounded, single-application lookup — no pagination/N+1 risk.
const TRACKER_AUDIT_ACTIONS: AuditAction[] = [
  AuditAction.APPLICATION_UPDATED,
  AuditAction.APPLICATION_SUPPORTED,
  AuditAction.APPLICATION_CHECKED,
  AuditAction.APPLICATION_APPROVED,
  AuditAction.APPLICATION_REJECTED,
  AuditAction.APPLICATION_SENT_BACK,
  AuditAction.LOAN_SERVICING_CONFIGURED,
  AuditAction.DISBURSEMENT_CONFIRMED,
];

type TrackerAuditLog = {
  action: AuditAction;
  payload: unknown;
  createdAt: Date;
  user: { id: string; email: string; role: UserRole } | null;
};

type TrackerApplication = {
  id: string;
  applicationNumber: string | null;
  status: string;
  stage: ApplicationStage | null;
  submittedAt: Date | null;
  supporterDate: Date | null;
  checkerDate: Date | null;
  approverDate: Date | null;
  rejectionReason: string | null;
  rejectedAt: Date | null;
  sentBackReason: string | null;
  sentBackAt: Date | null;
  sentBackToStage: ApplicationStage | null;
  creditLimit: unknown;
  interestRate: unknown;
  period: number | null;
  periodUnit: 'YEAR' | 'MONTH' | null;
  user: { email: string } | null;
  parentVerification: { submittedAt: Date | null } | null;
  collegeVerification: {
    submittedAt: Date | null;
    isApplicationVerified: boolean;
  } | null;
  bankAccountOpening: {
    status: BankAccountOpeningStatus;
    completedAt: Date | null;
  } | null;
  loanInformation: { loanAmount: unknown } | null;
  loanAccount: {
    configuredAt: Date | null;
    finalPrincipalAmount: unknown;
    finalInterestRate: unknown;
    finalTenureMonths: number | null;
    gracePeriodMonths: number | null;
    repaymentFrequency: RepaymentFrequency;
    interestFrequency: RepaymentFrequency | null;
  } | null;
  disbursement: {
    totalDisbursedAmount: unknown;
    updatedAt: Date;
  } | null;
  auditLogs: TrackerAuditLog[];
};

interface StageResolution {
  completed: boolean;
  completedAt: Date | null;
  completedBy: string | null;
}

interface StageDefinition {
  key: TrackerStageKey;
  label: string;
  role: UserRole;
  resolve: (app: TrackerApplication) => StageResolution;
}

// Maps SendBackApplicationDto.toStage to the tracker stage the application
// re-enters at — mirrors DashboardApprovalService's ALLOWED_FROM_STAGE table:
// support() accepts SENT_BACK from a stage stamped INITIATED, check() from
// SUPPORTED, approve() from CHECKING, so "sent back to X" means "X's
// successor stage is the next actor".
const RE_ENTRY_STAGE_FOR_TO_STAGE: Partial<
  Record<ApplicationStage, TrackerStageKey>
> = {
  [ApplicationStage.INITIATED]: TrackerStageKey.SUPPORTER,
  [ApplicationStage.SUPPORTED]: TrackerStageKey.CREDIT_MANAGER_REVIEW,
  [ApplicationStage.CHECKING]: TrackerStageKey.APPROVER,
};

function latestByAction(logs: TrackerAuditLog[], action: AuditAction) {
  for (let i = logs.length - 1; i >= 0; i--) {
    if (logs[i].action === action) return logs[i];
  }
  return null;
}

function latestInitiatorUpdate(logs: TrackerAuditLog[]) {
  for (let i = logs.length - 1; i >= 0; i--) {
    const log = logs[i];
    if (
      log.action === AuditAction.APPLICATION_UPDATED &&
      typeof log.payload === 'object' &&
      log.payload !== null &&
      (log.payload as Record<string, unknown>).section === 'initiator'
    ) {
      return log;
    }
  }
  return null;
}

// Single source of truth for the tracker's stages — each entry only needs to
// know its own display metadata and how to resolve itself from the fetched
// application. Adding a future workflow stage (e.g. a new verification step)
// means appending one descriptor here; nothing else in the service changes.
const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    key: TrackerStageKey.STUDENT,
    label: 'Student Submitted',
    role: UserRole.STUDENT,
    resolve: (app) => ({
      completed: !!app.submittedAt,
      completedAt: app.submittedAt,
      completedBy: app.submittedAt ? (app.user?.email ?? 'Student') : null,
    }),
  },
  {
    key: TrackerStageKey.PARENT,
    label: 'Parent Verification',
    role: UserRole.PARENT,
    resolve: (app) => ({
      completed: !!app.parentVerification?.submittedAt,
      completedAt: app.parentVerification?.submittedAt ?? null,
      completedBy: app.parentVerification?.submittedAt ? 'Parent' : null,
    }),
  },
  {
    key: TrackerStageKey.COLLEGE,
    label: 'College Verification',
    role: UserRole.COLLEGE,
    resolve: (app) => ({
      completed: !!app.collegeVerification?.submittedAt,
      completedAt: app.collegeVerification?.submittedAt ?? null,
      completedBy: app.collegeVerification?.submittedAt ? 'College' : null,
    }),
  },
  {
    key: TrackerStageKey.BANK_ACCOUNT,
    label: 'Bank Account Opening',
    role: UserRole.STUDENT,
    resolve: (app) => ({
      completed:
        app.bankAccountOpening?.status === BankAccountOpeningStatus.COMPLETED,
      completedAt: app.bankAccountOpening?.completedAt ?? null,
      completedBy:
        app.bankAccountOpening?.status === BankAccountOpeningStatus.COMPLETED
          ? (app.user?.email ?? 'Student')
          : null,
    }),
  },
  {
    key: TrackerStageKey.INITIATOR,
    label: 'Initiator Review',
    role: UserRole.INITIATOR,
    resolve: (app) => {
      const log = latestInitiatorUpdate(app.auditLogs);
      return {
        completed: !!log,
        completedAt: log?.createdAt ?? null,
        completedBy: log ? (log.user?.email ?? 'Initiator') : null,
      };
    },
  },
  {
    key: TrackerStageKey.SUPPORTER,
    label: 'Supporter Verification',
    role: UserRole.SUPPORTER,
    resolve: (app) => ({
      completed: !!app.supporterDate,
      completedAt: app.supporterDate,
      completedBy: app.supporterDate
        ? (latestByAction(app.auditLogs, AuditAction.APPLICATION_SUPPORTED)
            ?.user?.email ?? 'Supporter')
        : null,
    }),
  },
  {
    key: TrackerStageKey.CREDIT_MANAGER_REVIEW,
    label: 'Credit Manager Review',
    role: UserRole.CREDIT_MANAGER,
    resolve: (app) => ({
      completed: !!app.checkerDate,
      completedAt: app.checkerDate,
      completedBy: app.checkerDate
        ? (latestByAction(app.auditLogs, AuditAction.APPLICATION_CHECKED)?.user
            ?.email ?? 'Credit Manager')
        : null,
    }),
  },
  {
    key: TrackerStageKey.APPROVER,
    label: 'Approver Decision',
    role: UserRole.APPROVER,
    resolve: (app) => ({
      completed: !!app.approverDate,
      completedAt: app.approverDate,
      completedBy: app.approverDate
        ? (latestByAction(app.auditLogs, AuditAction.APPLICATION_APPROVED)?.user
            ?.email ?? 'Approver')
        : null,
    }),
  },
  {
    key: TrackerStageKey.CREDIT_MANAGER_SETUP,
    label: 'Credit Manager — Loan Setup',
    role: UserRole.CREDIT_MANAGER,
    resolve: (app) => ({
      completed: !!app.loanAccount?.configuredAt,
      completedAt: app.loanAccount?.configuredAt ?? null,
      completedBy: app.loanAccount?.configuredAt
        ? (latestByAction(app.auditLogs, AuditAction.LOAN_SERVICING_CONFIGURED)
            ?.user?.email ?? 'Credit Manager')
        : null,
    }),
  },
  {
    key: TrackerStageKey.DISBURSEMENT,
    label: 'Loan Disbursement',
    role: UserRole.CREDIT_MANAGER,
    resolve: (app) => {
      const disbursed =
        !!app.disbursement &&
        Number(app.disbursement.totalDisbursedAmount ?? 0) > 0;
      return {
        completed: disbursed,
        completedAt: disbursed ? (app.disbursement?.updatedAt ?? null) : null,
        completedBy: disbursed
          ? (latestByAction(app.auditLogs, AuditAction.DISBURSEMENT_CONFIRMED)
              ?.user?.email ?? 'Credit Manager')
          : null,
      };
    },
  },
];

const SUB_PIPELINE_KEYS = [
  TrackerStageKey.SUPPORTER,
  TrackerStageKey.CREDIT_MANAGER_REVIEW,
  TrackerStageKey.APPROVER,
];

@Injectable()
export class ApplicationTrackerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardRepaymentService: DashboardRepaymentService,
  ) {}

  async getTracker(
    applicationId: string,
    userId: string,
    role: UserRole,
  ): Promise<ApplicationTrackerResponseDto> {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        applicationNumber: true,
        status: true,
        stage: true,
        userId: true,
        submittedAt: true,
        supporterDate: true,
        checkerDate: true,
        approverDate: true,
        rejectionReason: true,
        rejectedAt: true,
        sentBackReason: true,
        sentBackAt: true,
        sentBackToStage: true,
        creditLimit: true,
        interestRate: true,
        period: true,
        periodUnit: true,
        user: { select: { email: true } },
        parentVerification: { select: { submittedAt: true } },
        collegeVerification: {
          select: { submittedAt: true, isApplicationVerified: true },
        },
        bankAccountOpening: {
          select: { status: true, completedAt: true },
        },
        loanInformation: { select: { loanAmount: true, estimatedEmi: true } },
        loanAccount: {
          select: {
            configuredAt: true,
            finalPrincipalAmount: true,
            finalInterestRate: true,
            finalTenureMonths: true,
            gracePeriodMonths: true,
            repaymentFrequency: true,
            interestFrequency: true,
          },
        },
        disbursement: {
          select: { totalDisbursedAmount: true, updatedAt: true },
        },
        auditLogs: {
          where: { action: { in: TRACKER_AUDIT_ACTIONS } },
          orderBy: { createdAt: 'asc' },
          select: {
            action: true,
            payload: true,
            createdAt: true,
            user: { select: { id: true, email: true, role: true } },
          },
        },
      },
    });

    if (!application) throw new NotFoundException('Application not found.');
    if (role !== UserRole.ADMIN && application.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const tracker = this.buildTracker(application);
    const repayment = await this.buildRepaymentSection(application);

    return { ...tracker, repayment };
  }

  private buildTracker(
    app: TrackerApplication,
  ): Omit<ApplicationTrackerResponseDto, 'repayment'> {
    const resolutions = STAGE_DEFINITIONS.map((def) => def.resolve(app));

    // A SENT_BACK application resets the sub-pipeline (Supporter/Credit
    // Manager/Approver) from its re-entry point onward — the sign-off dates
    // from the previous cycle are still in the DB, but they no longer
    // represent completed work for this cycle.
    if (app.stage === ApplicationStage.SENT_BACK) {
      const reEntryKey =
        RE_ENTRY_STAGE_FOR_TO_STAGE[
          app.sentBackToStage ?? ApplicationStage.INITIATED
        ] ?? TrackerStageKey.SUPPORTER;
      const reEntryIdx = STAGE_DEFINITIONS.findIndex(
        (d) => d.key === reEntryKey,
      );
      SUB_PIPELINE_KEYS.forEach((key) => {
        const idx = STAGE_DEFINITIONS.findIndex((d) => d.key === key);
        resolutions[idx].completed = idx < reEntryIdx;
      });
    }

    const firstIncompleteIdx = resolutions.findIndex((r) => !r.completed);

    const timeline: TrackerStageDto[] = STAGE_DEFINITIONS.map((def, idx) => {
      const resolution = resolutions[idx];
      let status: TrackerStageStatus;
      let completedAt = resolution.completedAt;
      let completedBy = resolution.completedBy;
      let reason: string | null = null;

      if (resolution.completed) {
        status = TrackerStageStatus.COMPLETED;
      } else if (
        idx === firstIncompleteIdx &&
        app.stage === ApplicationStage.REJECTED
      ) {
        status = TrackerStageStatus.REJECTED;
        completedAt = app.rejectedAt;
        completedBy =
          latestByAction(app.auditLogs, AuditAction.APPLICATION_REJECTED)?.user
            ?.email ?? 'Staff';
        reason = app.rejectionReason;
      } else if (
        idx === firstIncompleteIdx &&
        app.stage === ApplicationStage.SENT_BACK
      ) {
        status = TrackerStageStatus.SENT_BACK;
        completedAt = app.sentBackAt;
        completedBy =
          latestByAction(app.auditLogs, AuditAction.APPLICATION_SENT_BACK)?.user
            ?.email ?? 'Staff';
        reason = app.sentBackReason;
      } else if (idx === firstIncompleteIdx) {
        status = TrackerStageStatus.IN_PROGRESS;
      } else {
        status = TrackerStageStatus.PENDING;
      }

      return {
        key: def.key,
        label: def.label,
        role: def.role,
        status,
        completedAt,
        completedBy,
        reason,
      };
    });

    const completedStages = resolutions.filter((r) => r.completed).length;
    const totalStages = STAGE_DEFINITIONS.length;
    const current =
      firstIncompleteIdx === -1 ? null : timeline[firstIncompleteIdx];

    let currentStatus: TrackerOverallStatus;
    if (app.stage === ApplicationStage.REJECTED) {
      currentStatus = TrackerOverallStatus.REJECTED;
    } else if (app.stage === ApplicationStage.SENT_BACK) {
      currentStatus = TrackerOverallStatus.SENT_BACK;
    } else if (firstIncompleteIdx === -1) {
      currentStatus = TrackerOverallStatus.COMPLETED;
    } else if (!app.submittedAt) {
      currentStatus = TrackerOverallStatus.DRAFT;
    } else {
      currentStatus = TrackerOverallStatus.IN_PROGRESS;
    }

    return {
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      currentStageKey: current?.key ?? null,
      currentStageLabel: current?.label ?? null,
      currentOwnerRole: current?.role ?? null,
      currentStatus,
      progressPercentage: Math.round((completedStages / totalStages) * 100),
      completedStages,
      totalStages,
      timeline,
    };
  }

  // ── Repayment section ───────────────────────────────────────────────────
  // Populated once the Credit Manager has configured servicing (configureAt
  // set implies the EMI schedule was already generated in the same call —
  // see DashboardRepaymentService.configureServicing()). Deliberately its
  // own method, separate from buildTracker()'s synchronous timeline build,
  // since it needs I/O (DashboardRepaymentService calls) — this is also the
  // template for future tracker sections (disbursement, insurance,
  // documents, ...): one buildXSection(app) method, computed alongside
  // buildTracker() in getTracker()'s Promise.all, merged into the response.
  private async buildRepaymentSection(
    app: TrackerApplication,
  ): Promise<RepaymentTrackerDto | null> {
    if (!app.loanAccount?.configuredAt) return null;

    const [repaymentStatus, scheduleResult] = await Promise.all([
      this.dashboardRepaymentService.getRepaymentStatus(app.id),
      // Internal call, not an HTTP request — the public 100-row browsing
      // cap on PaginationDto.limit doesn't apply here. A generous limit
      // fetches this single loan's complete amortization table in one call
      // (typical tenures are well under 360 installments).
      this.dashboardRepaymentService.getSchedule(app.id, {
        page: 1,
        limit: 1000,
      }),
    ]);

    const entries = scheduleResult.data;
    const nextEntry = entries.find((e) => e.status !== 'PAID') ?? null;
    const daysRemaining = nextEntry
      ? Math.ceil(
          (nextEntry.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
        )
      : null;

    const terms = resolveEffectiveLoanTerms({
      finalPrincipalAmount: app.loanAccount.finalPrincipalAmount,
      totalDisbursedAmount: app.disbursement?.totalDisbursedAmount,
      creditLimit: app.creditLimit,
      loanAmount: app.loanInformation?.loanAmount,
      finalInterestRate: app.loanAccount.finalInterestRate,
      interestRate: app.interestRate,
      finalTenureMonths: app.loanAccount.finalTenureMonths,
      period: app.period,
      periodUnit: app.periodUnit,
      gracePeriodMonths: app.loanAccount.gracePeriodMonths,
      repaymentFrequency: app.loanAccount.repaymentFrequency,
      interestFrequency: app.loanAccount.interestFrequency,
    });

    return {
      loanSummary: {
        approvedAmount: Number(app.creditLimit ?? 0),
        finalDisbursementAmount: terms.principal,
        interestRate: terms.interestRate,
        interestFrequency: terms.interestFrequency,
        repaymentFrequency: terms.repaymentFrequency,
        tenureMonths: terms.tenureMonths,
        gracePeriodMonths: terms.gracePeriodMonths,
        totalRepayable: repaymentStatus.totalRepayable,
      },
      nextPayment: {
        dueDate: nextEntry?.dueDate ?? null,
        amount: nextEntry ? Number(nextEntry.emiAmount) : null,
        daysRemaining,
        status: repaymentStatus.repaymentStatus,
      },
      schedule: entries.map((e) => ({
        installmentNumber: e.installmentNumber,
        dueDate: e.dueDate,
        emiAmount: Number(e.emiAmount),
        principalComponent: Number(e.principalComponent),
        interestComponent: Number(e.interestComponent),
        outstandingBalance: Number(e.outstandingPrincipal),
        status: e.status,
      })),
      progress: {
        totalInstallments: repaymentStatus.totalInstallments,
        paidInstallments: repaymentStatus.paidInstallments,
        remainingInstallments:
          repaymentStatus.totalInstallments - repaymentStatus.paidInstallments,
        outstandingBalance: repaymentStatus.outstandingBalance,
        totalPaid: repaymentStatus.totalPaid,
        totalRemaining: repaymentStatus.outstandingBalance,
      },
    };
  }
}
