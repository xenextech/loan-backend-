import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApplicationTrackerService } from './application-tracker.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardRepaymentService } from '../dashboard/repayment/dashboard-repayment.service';
import { AuditAction, ApplicationStage, UserRole } from '../../common/enums';
import {
  TrackerOverallStatus,
  TrackerStageKey,
  TrackerStageStatus,
} from './dto/application-tracker.dto';

describe('ApplicationTrackerService', () => {
  let findUniqueMock: jest.Mock;
  let getRepaymentStatusMock: jest.Mock;
  let getScheduleMock: jest.Mock;
  let service: ApplicationTrackerService;

  // Matches ApplicationTrackerService's `select` shape exactly — a draft,
  // not-yet-submitted application owned by 'user-1'.
  const baseApplication = {
    id: 'app-1',
    applicationNumber: 'Unnati-2026-00001',
    status: 'DRAFT',
    stage: null as ApplicationStage | null,
    userId: 'user-1',
    submittedAt: null as Date | null,
    supporterDate: null as Date | null,
    checkerDate: null as Date | null,
    approverDate: null as Date | null,
    rejectionReason: null as string | null,
    rejectedAt: null as Date | null,
    sentBackReason: null as string | null,
    sentBackAt: null as Date | null,
    sentBackToStage: null as ApplicationStage | null,
    creditLimit: null as number | null,
    interestRate: null as number | null,
    period: null as number | null,
    periodUnit: null as 'YEAR' | 'MONTH' | null,
    user: { email: 'student@unnati.com' },
    parentVerification: null as { submittedAt: Date | null } | null,
    collegeVerification: null as {
      submittedAt: Date | null;
      isApplicationVerified: boolean;
    } | null,
    loanInformation: null as { loanAmount: number | null } | null,
    loanAccount: null as {
      configuredAt: Date | null;
      finalPrincipalAmount?: number | null;
      finalInterestRate?: number | null;
      finalTenureMonths?: number | null;
      gracePeriodMonths?: number | null;
      repaymentFrequency?: string;
      interestFrequency?: string | null;
    } | null,
    disbursement: null as {
      totalDisbursedAmount: number | null;
      updatedAt: Date;
    } | null,
    auditLogs: [] as unknown[],
  };

  const d = (s: string) => new Date(s);
  const auditLog = (
    action: AuditAction,
    createdAt: Date,
    email: string,
    payload?: Record<string, unknown>,
  ) => ({
    action,
    createdAt,
    payload: payload ?? null,
    user: { id: 'u', email, role: UserRole.ADMIN },
  });

  beforeEach(() => {
    findUniqueMock = jest.fn();
    const prisma = {
      loanApplication: { findUnique: findUniqueMock },
    } as unknown as PrismaService;

    getRepaymentStatusMock = jest.fn().mockResolvedValue({
      repaymentStatus: 'ON_TRACK',
      totalInstallments: 12,
      paidInstallments: 3,
      totalPaid: 30000,
      totalRepayable: 120000,
      outstandingBalance: 90000,
    });
    getScheduleMock = jest.fn().mockResolvedValue({
      data: [
        {
          installmentNumber: 4,
          dueDate: new Date('2026-07-01'),
          emiAmount: 10000,
          principalComponent: 9000,
          interestComponent: 1000,
          outstandingPrincipal: 90000,
          status: 'UPCOMING',
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 1000,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
    const dashboardRepaymentService = {
      getRepaymentStatus: getRepaymentStatusMock,
      getSchedule: getScheduleMock,
    } as unknown as DashboardRepaymentService;

    service = new ApplicationTrackerService(prisma, dashboardRepaymentService);
  });

  function stageStatus(
    timeline: { key: TrackerStageKey; status: TrackerStageStatus }[],
    key: TrackerStageKey,
  ) {
    return timeline.find((t) => t.key === key)?.status;
  }

  it('throws NotFoundException when the application does not exist', async () => {
    findUniqueMock.mockResolvedValue(null);
    await expect(
      service.getTracker('missing', 'user-1', UserRole.STUDENT),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when a non-owning, non-admin student requests it', async () => {
    findUniqueMock.mockResolvedValue(baseApplication);
    await expect(
      service.getTracker('app-1', 'someone-else', UserRole.STUDENT),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows ADMIN to view any application regardless of ownership', async () => {
    findUniqueMock.mockResolvedValue(baseApplication);
    const result = await service.getTracker(
      'app-1',
      'someone-else',
      UserRole.ADMIN,
    );
    expect(result.applicationId).toBe('app-1');
  });

  it('a fresh draft application sits at Student Submitted, IN_PROGRESS, 0%', async () => {
    findUniqueMock.mockResolvedValue(baseApplication);
    const result = await service.getTracker(
      'app-1',
      'user-1',
      UserRole.STUDENT,
    );

    expect(result.currentStatus).toBe(TrackerOverallStatus.DRAFT);
    expect(result.currentStageKey).toBe(TrackerStageKey.STUDENT);
    expect(result.completedStages).toBe(0);
    expect(result.progressPercentage).toBe(0);
    expect(stageStatus(result.timeline, TrackerStageKey.STUDENT)).toBe(
      TrackerStageStatus.IN_PROGRESS,
    );
    expect(stageStatus(result.timeline, TrackerStageKey.PARENT)).toBe(
      TrackerStageStatus.PENDING,
    );
    // No LoanAccount yet, so the repayment section stays null — and the
    // repayment service is never even called for a draft application.
    expect(result.repayment).toBeNull();
    expect(getRepaymentStatusMock).not.toHaveBeenCalled();
  });

  it('progresses through Parent/College/Initiator once submitted, and awaits the Supporter next', async () => {
    findUniqueMock.mockResolvedValue({
      ...baseApplication,
      status: 'SUBMITTED',
      submittedAt: d('2026-07-01T10:00:00Z'),
      parentVerification: { submittedAt: d('2026-07-02T09:00:00Z') },
      collegeVerification: {
        submittedAt: d('2026-07-03T09:00:00Z'),
        isApplicationVerified: true,
      },
      auditLogs: [
        auditLog(
          AuditAction.APPLICATION_UPDATED,
          d('2026-07-04T09:00:00Z'),
          'initiator@unnati.com',
          {
            section: 'initiator',
          },
        ),
      ],
    });

    const result = await service.getTracker(
      'app-1',
      'user-1',
      UserRole.STUDENT,
    );

    expect(result.completedStages).toBe(4);
    expect(result.currentStageKey).toBe(TrackerStageKey.SUPPORTER);
    expect(result.currentOwnerRole).toBe(UserRole.SUPPORTER);
    expect(stageStatus(result.timeline, TrackerStageKey.INITIATOR)).toBe(
      TrackerStageStatus.COMPLETED,
    );
    expect(stageStatus(result.timeline, TrackerStageKey.SUPPORTER)).toBe(
      TrackerStageStatus.IN_PROGRESS,
    );
    expect(result.progressPercentage).toBe(Math.round((4 / 9) * 100));
  });

  it('marks every stage COMPLETED and progress 100% once disbursed', async () => {
    findUniqueMock.mockResolvedValue({
      ...baseApplication,
      status: 'SUBMITTED',
      stage: ApplicationStage.APPROVED,
      submittedAt: d('2026-06-01T00:00:00Z'),
      supporterDate: d('2026-06-02T00:00:00Z'),
      checkerDate: d('2026-06-03T00:00:00Z'),
      approverDate: d('2026-06-04T00:00:00Z'),
      parentVerification: { submittedAt: d('2026-06-01T01:00:00Z') },
      collegeVerification: {
        submittedAt: d('2026-06-01T02:00:00Z'),
        isApplicationVerified: true,
      },
      creditLimit: 500000,
      interestRate: 12,
      loanAccount: {
        configuredAt: d('2026-06-05T00:00:00Z'),
        finalPrincipalAmount: null,
        finalInterestRate: null,
        finalTenureMonths: 12,
        gracePeriodMonths: 0,
        repaymentFrequency: 'MONTHLY',
        interestFrequency: null,
      },
      disbursement: {
        totalDisbursedAmount: 500000,
        updatedAt: d('2026-06-06T00:00:00Z'),
      },
      auditLogs: [
        auditLog(
          AuditAction.APPLICATION_UPDATED,
          d('2026-06-01T03:00:00Z'),
          'initiator@unnati.com',
          {
            section: 'initiator',
          },
        ),
      ],
    });

    const result = await service.getTracker(
      'app-1',
      'user-1',
      UserRole.STUDENT,
    );

    expect(result.currentStatus).toBe(TrackerOverallStatus.COMPLETED);
    expect(result.completedStages).toBe(9);
    expect(result.progressPercentage).toBe(100);
    expect(result.currentStageKey).toBeNull();

    // Repayment section — reused from DashboardRepaymentService, not
    // recomputed here.
    expect(getRepaymentStatusMock).toHaveBeenCalledWith('app-1');
    expect(getScheduleMock).toHaveBeenCalledWith('app-1', {
      page: 1,
      limit: 1000,
    });
    expect(result.repayment).toEqual({
      loanSummary: {
        approvedAmount: 500000,
        finalDisbursementAmount: 500000,
        interestRate: 12,
        interestFrequency: 'MONTHLY',
        repaymentFrequency: 'MONTHLY',
        tenureMonths: 12,
        gracePeriodMonths: 0,
        totalRepayable: 120000,
      },
      nextPayment: {
        dueDate: d('2026-07-01'),
        amount: 10000,
        daysRemaining: expect.any(Number) as number,
        status: 'ON_TRACK',
      },
      schedule: [
        {
          installmentNumber: 4,
          dueDate: d('2026-07-01'),
          emiAmount: 10000,
          principalComponent: 9000,
          interestComponent: 1000,
          outstandingBalance: 90000,
          status: 'UPCOMING',
        },
      ],
      progress: {
        totalInstallments: 12,
        paidInstallments: 3,
        remainingInstallments: 9,
        outstandingBalance: 90000,
        totalPaid: 30000,
        totalRemaining: 90000,
      },
    });
  });

  it('rejection at the Approver stage marks it REJECTED with the reason, halts everything after', async () => {
    findUniqueMock.mockResolvedValue({
      ...baseApplication,
      status: 'SUBMITTED',
      stage: ApplicationStage.REJECTED,
      submittedAt: d('2026-06-01T00:00:00Z'),
      supporterDate: d('2026-06-02T00:00:00Z'),
      checkerDate: d('2026-06-03T00:00:00Z'),
      approverDate: null,
      rejectionReason: 'CICL bureau hit — adverse entry',
      rejectedAt: d('2026-06-04T00:00:00Z'),
      parentVerification: { submittedAt: d('2026-06-01T01:00:00Z') },
      collegeVerification: {
        submittedAt: d('2026-06-01T02:00:00Z'),
        isApplicationVerified: true,
      },
      auditLogs: [
        auditLog(
          AuditAction.APPLICATION_UPDATED,
          d('2026-06-01T03:00:00Z'),
          'initiator@unnati.com',
          {
            section: 'initiator',
          },
        ),
        auditLog(
          AuditAction.APPLICATION_REJECTED,
          d('2026-06-04T00:00:00Z'),
          'approver@unnati.com',
        ),
      ],
    });

    const result = await service.getTracker(
      'app-1',
      'user-1',
      UserRole.STUDENT,
    );

    expect(result.currentStatus).toBe(TrackerOverallStatus.REJECTED);
    expect(result.currentStageKey).toBe(TrackerStageKey.APPROVER);
    const approverStage = result.timeline.find(
      (t) => t.key === TrackerStageKey.APPROVER,
    );
    expect(approverStage?.status).toBe(TrackerStageStatus.REJECTED);
    expect(approverStage?.reason).toBe('CICL bureau hit — adverse entry');
    expect(approverStage?.completedBy).toBe('approver@unnati.com');
    expect(
      stageStatus(result.timeline, TrackerStageKey.CREDIT_MANAGER_SETUP),
    ).toBe(TrackerStageStatus.PENDING);
    // Prior sign-offs remain visible even though the app is now dead.
    expect(stageStatus(result.timeline, TrackerStageKey.SUPPORTER)).toBe(
      TrackerStageStatus.COMPLETED,
    );
    expect(
      stageStatus(result.timeline, TrackerStageKey.CREDIT_MANAGER_REVIEW),
    ).toBe(TrackerStageStatus.COMPLETED);
  });

  it('send-back to INITIATED resets Supporter/Credit-Manager/Approver even though their dates are still set', async () => {
    findUniqueMock.mockResolvedValue({
      ...baseApplication,
      status: 'SUBMITTED',
      stage: ApplicationStage.SENT_BACK,
      submittedAt: d('2026-06-01T00:00:00Z'),
      supporterDate: d('2026-06-02T00:00:00Z'),
      checkerDate: d('2026-06-03T00:00:00Z'),
      approverDate: null,
      sentBackReason: 'Missing updated bank statement',
      sentBackAt: d('2026-06-04T00:00:00Z'),
      sentBackToStage: ApplicationStage.INITIATED,
      parentVerification: { submittedAt: d('2026-06-01T01:00:00Z') },
      collegeVerification: {
        submittedAt: d('2026-06-01T02:00:00Z'),
        isApplicationVerified: true,
      },
      auditLogs: [
        auditLog(
          AuditAction.APPLICATION_UPDATED,
          d('2026-06-01T03:00:00Z'),
          'initiator@unnati.com',
          {
            section: 'initiator',
          },
        ),
        auditLog(
          AuditAction.APPLICATION_SENT_BACK,
          d('2026-06-04T00:00:00Z'),
          'checker@unnati.com',
        ),
      ],
    });

    const result = await service.getTracker(
      'app-1',
      'user-1',
      UserRole.STUDENT,
    );

    expect(result.currentStatus).toBe(TrackerOverallStatus.SENT_BACK);
    expect(result.currentStageKey).toBe(TrackerStageKey.SUPPORTER);
    expect(result.currentOwnerRole).toBe(UserRole.SUPPORTER);

    const supporterStage = result.timeline.find(
      (t) => t.key === TrackerStageKey.SUPPORTER,
    );
    expect(supporterStage?.status).toBe(TrackerStageStatus.SENT_BACK);
    expect(supporterStage?.reason).toBe('Missing updated bank statement');
    expect(supporterStage?.completedBy).toBe('checker@unnati.com');

    // Credit Manager Review had a checkerDate from the previous cycle, but
    // since we've been rewound to before the Supporter, it must be redone.
    expect(
      stageStatus(result.timeline, TrackerStageKey.CREDIT_MANAGER_REVIEW),
    ).toBe(TrackerStageStatus.PENDING);
    expect(stageStatus(result.timeline, TrackerStageKey.APPROVER)).toBe(
      TrackerStageStatus.PENDING,
    );
  });
});
