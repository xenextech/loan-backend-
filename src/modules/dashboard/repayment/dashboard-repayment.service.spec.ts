import { DashboardRepaymentService } from './dashboard-repayment.service';
import { EmiCalculatorService } from '../../utils/emi-calculator.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CollectionActivityType } from '@prisma/client';
import { AuditAction, AuditCategory } from '../../../common/enums';
import { EMI_NOTIFICATION_TRIGGERS } from './emi-notification-triggers.constant';

interface ScheduleEntryRow {
  installmentNumber: number;
  outstandingPrincipal: number;
  principalComponent: number;
}

interface FindManyCallArgs {
  where: {
    status?: string;
    applicationId?: string;
    dueDate?: { gte?: Date; lte?: Date };
  };
}

interface EntryUpdateCallArgs {
  data: { status: string; paidAmount: number; paidDate: Date };
}

interface AppUpdateManyCallArgs {
  where: { nrbClassification?: { not: string }; id?: { notIn: string[] } };
  data: { nrbClassification: string; nrbClassifiedAt: Date };
}

interface AppUpdateCallArgs {
  where: { id: string };
  data: { nrbClassification: string; nrbClassifiedAt: Date };
}

describe('DashboardRepaymentService', () => {
  const applicationId = 'app-1';
  const application = {
    id: applicationId,
    creditLimit: 500000,
    interestRate: 12,
    period: 12,
    periodUnit: 'MONTH',
    loanInformation: null,
  };

  let createdEntries: ScheduleEntryRow[] = [];
  let findUniqueMock: jest.Mock;
  let findManyMock: jest.Mock<unknown, [FindManyCallArgs]>;
  let countMock: jest.Mock;
  let aggregateMock: jest.Mock;
  let entryFindUniqueMock: jest.Mock;
  let entryUpdateMock: jest.Mock<unknown, [EntryUpdateCallArgs]>;
  let auditLogMock: jest.Mock;
  let groupByMock: jest.Mock;
  let appUpdateManyMock: jest.Mock<unknown, [AppUpdateManyCallArgs]>;
  let appUpdateMock: jest.Mock<unknown, [AppUpdateCallArgs]>;
  let loanAccountFindUniqueMock: jest.Mock;
  let loanAccountUpdateMock: jest.Mock;
  let loanAccountUpdateManyMock: jest.Mock;
  let collectionActivityCreateMock: jest.Mock;
  let collectionActivityFindManyMock: jest.Mock;
  let collectionActivityCountMock: jest.Mock;
  let notifyLoanFinalizedMock: jest.Mock;
  let service: DashboardRepaymentService;

  function buildService() {
    createdEntries = [];
    findUniqueMock = jest.fn().mockResolvedValue(application);
    findManyMock = jest.fn<unknown, [FindManyCallArgs]>().mockResolvedValue([]);
    countMock = jest.fn().mockResolvedValue(0);
    aggregateMock = jest
      .fn()
      .mockResolvedValue({ _sum: { emiAmount: 0 }, _count: 0 });
    entryFindUniqueMock = jest.fn().mockResolvedValue(null);
    entryUpdateMock = jest.fn<unknown, [EntryUpdateCallArgs]>();
    auditLogMock = jest.fn().mockResolvedValue(undefined);
    groupByMock = jest.fn().mockResolvedValue([]);
    appUpdateManyMock = jest
      .fn<unknown, [AppUpdateManyCallArgs]>()
      .mockResolvedValue({ count: 0 });
    appUpdateMock = jest.fn<unknown, [AppUpdateCallArgs]>();
    loanAccountFindUniqueMock = jest.fn().mockResolvedValue(null);
    loanAccountUpdateMock = jest.fn();
    loanAccountUpdateManyMock = jest.fn().mockResolvedValue({ count: 0 });
    collectionActivityCreateMock = jest.fn();
    collectionActivityFindManyMock = jest.fn().mockResolvedValue([]);
    collectionActivityCountMock = jest.fn().mockResolvedValue(0);
    notifyLoanFinalizedMock = jest.fn().mockResolvedValue({
      studentNotified: true,
      parentNotified: false,
      parentChannel: null,
    });

    const prisma = {
      loanApplication: {
        findUnique: findUniqueMock,
        updateMany: appUpdateManyMock,
        update: appUpdateMock,
      },
      loanAccount: {
        findUnique: loanAccountFindUniqueMock,
        update: loanAccountUpdateMock,
        updateMany: loanAccountUpdateManyMock,
      },
      collectionActivity: {
        create: collectionActivityCreateMock,
        findMany: collectionActivityFindManyMock,
        count: collectionActivityCountMock,
      },
      emiScheduleEntry: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest
          .fn()
          .mockImplementation(({ data }: { data: ScheduleEntryRow[] }) => {
            createdEntries = data;
            return Promise.resolve({ count: data.length });
          }),
        findMany: findManyMock,
        count: countMock,
        aggregate: aggregateMock,
        findUnique: entryFindUniqueMock,
        update: entryUpdateMock,
        groupBy: groupByMock,
      },
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
    } as unknown as PrismaService;

    const audit = { log: auditLogMock } as unknown as AuditService;
    const emiCalculator = new EmiCalculatorService();
    const notifications = {
      notifyLoanFinalized: notifyLoanFinalizedMock,
    } as unknown as NotificationsService;

    return new DashboardRepaymentService(
      prisma,
      audit,
      emiCalculator,
      notifications,
    );
  }

  beforeEach(() => {
    service = buildService();
    // findMany used for the generated-schedule read-back in generateSchedule tests
    findManyMock.mockImplementation(() =>
      Promise.resolve(
        [...createdEntries].sort(
          (a, b) => a.installmentNumber - b.installmentNumber,
        ),
      ),
    );
  });

  describe('generateSchedule', () => {
    it('generates one entry per month of the tenure', async () => {
      const schedule = await service.generateSchedule('user-1', applicationId);
      expect(schedule).toHaveLength(12);
    });

    it('fully amortizes the loan — final installment zeroes the outstanding balance', async () => {
      const schedule = await service.generateSchedule('user-1', applicationId);
      const last = schedule[schedule.length - 1];
      expect(Number(last.outstandingPrincipal)).toBe(0);
    });

    it('sums principal components back to the original loan amount', async () => {
      const schedule = await service.generateSchedule('user-1', applicationId);
      const totalPrincipal = schedule.reduce(
        (sum, e) => sum + Number(e.principalComponent),
        0,
      );
      expect(totalPrincipal).toBeCloseTo(500000, 0);
    });

    it('is idempotent — regenerating replaces rather than duplicates the schedule', async () => {
      await service.generateSchedule('user-1', applicationId);
      const schedule = await service.generateSchedule('user-1', applicationId);
      expect(schedule).toHaveLength(12);
    });

    it('throws when the application is missing loan terms', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...application,
        interestRate: null,
      });
      await expect(
        service.generateSchedule('user-1', applicationId),
      ).rejects.toThrow();
    });

    it('throws NotFoundException when the application does not exist', async () => {
      findUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.generateSchedule('user-1', 'missing'),
      ).rejects.toThrow();
    });
  });

  describe('getSchedule', () => {
    it('paginates schedule entries ordered by installment number', async () => {
      countMock.mockResolvedValueOnce(24);
      const result = await service.getSchedule(applicationId, {
        page: 1,
        limit: 12,
      });
      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { applicationId },
          orderBy: { installmentNumber: 'asc' },
        }),
      );
      expect(result.meta.total).toBe(24);
    });
  });

  describe('getOverdue', () => {
    it('queries only OVERDUE entries when no bucket is given', async () => {
      await service.getOverdue({ page: 1, limit: 20 });
      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'OVERDUE' } }),
      );
    });

    it('narrows to a 1-30 day overdue window', async () => {
      await service.getOverdue({ page: 1, limit: 20, bucket: '1-30' });
      const { where } = findManyMock.mock.calls[0][0];
      expect(where.status).toBe('OVERDUE');
      expect(where.dueDate.gte).toBeInstanceOf(Date);
      expect(where.dueDate.lte).toBeInstanceOf(Date);
      expect(where.dueDate.gte.getTime()).toBeLessThan(
        where.dueDate.lte.getTime(),
      );
    });

    it('leaves the lower bound open-ended for the 365+ bucket', async () => {
      await service.getOverdue({ page: 1, limit: 20, bucket: '365+' });
      const { where } = findManyMock.mock.calls[0][0];
      expect(where.dueDate.gte).toBeUndefined();
      expect(where.dueDate.lte).toBeInstanceOf(Date);
    });

    it('bounds the 91-180 day bucket on both ends', async () => {
      await service.getOverdue({ page: 1, limit: 20, bucket: '91-180' });
      const { where } = findManyMock.mock.calls[0][0];
      expect(where.dueDate.gte).toBeInstanceOf(Date);
      expect(where.dueDate.lte).toBeInstanceOf(Date);
      expect(where.dueDate.gte.getTime()).toBeLessThan(
        where.dueDate.lte.getTime(),
      );
    });
  });

  describe('getOverview', () => {
    it('computes collection efficiency as paid / total-due percentage', async () => {
      aggregateMock.mockResolvedValue({ _sum: { emiAmount: 0 }, _count: 0 });
      countMock
        .mockResolvedValueOnce(8) // paidCount
        .mockResolvedValueOnce(10); // totalDueCount

      const overview = await service.getOverview();
      expect(overview.collectionEfficiency).toBe(80);
    });

    it('returns null collection efficiency when nothing has been due yet', async () => {
      countMock.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      const overview = await service.getOverview();
      expect(overview.collectionEfficiency).toBeNull();
    });

    it('surfaces due-today and overdue-bucket amounts from the aggregates', async () => {
      aggregateMock
        .mockResolvedValueOnce({ _sum: { emiAmount: 32000 }, _count: 42 }) // dueToday
        .mockResolvedValueOnce({ _sum: { emiAmount: 18000 }, _count: 18 }) // overdue1to30
        .mockResolvedValueOnce({ _sum: { emiAmount: 7400 }, _count: 6 }); // overdue31to90

      const overview = await service.getOverview();
      expect(overview.dueToday).toEqual({ amount: 32000, count: 42 });
      expect(overview.overdue1to30).toEqual({ amount: 18000, count: 18 });
      expect(overview.overdue31to90).toEqual({ amount: 7400, count: 6 });
    });

    it('surfaces the extended 91-180/181-365/365+ NRB aging buckets', async () => {
      aggregateMock
        .mockResolvedValueOnce({ _sum: { emiAmount: 0 }, _count: 0 }) // dueToday
        .mockResolvedValueOnce({ _sum: { emiAmount: 0 }, _count: 0 }) // overdue1to30
        .mockResolvedValueOnce({ _sum: { emiAmount: 0 }, _count: 0 }) // overdue31to90
        .mockResolvedValueOnce({ _sum: { emiAmount: 5000 }, _count: 2 }) // overdue91to180
        .mockResolvedValueOnce({ _sum: { emiAmount: 9000 }, _count: 3 }) // overdue181to365
        .mockResolvedValueOnce({ _sum: { emiAmount: 15000 }, _count: 1 }); // overdue365Plus

      const overview = await service.getOverview();
      expect(overview.overdue91to180).toEqual({ amount: 5000, count: 2 });
      expect(overview.overdue181to365).toEqual({ amount: 9000, count: 3 });
      expect(overview.overdue365Plus).toEqual({ amount: 15000, count: 1 });
    });
  });

  describe('accruePenalInterest', () => {
    it('accrues one day of (contract rate + 2%) simple interest on the overdue EMI amount', async () => {
      findManyMock.mockResolvedValueOnce([
        {
          id: 'entry-1',
          emiAmount: 10000,
          penalInterestAccrued: 0,
          application: { interestRate: 12 },
        },
      ] as never);

      await service.accruePenalInterest('system-user');

      // (12% + 2%) / 365 * 10000 ≈ 3.84
      expect(entryUpdateMock).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: { penalInterestAccrued: 3.84 },
      });
      expect(auditLogMock).toHaveBeenCalledWith(
        'system-user',
        AuditAction.PENAL_INTEREST_ACCRUED,
        { count: 1 },
        undefined,
        AuditCategory.REPAYMENT,
      );
    });

    it('does nothing when there are no overdue entries', async () => {
      findManyMock.mockResolvedValueOnce([]);
      const count = await service.accruePenalInterest('system-user');
      expect(count).toBe(0);
      expect(entryUpdateMock).not.toHaveBeenCalled();
      expect(auditLogMock).not.toHaveBeenCalled();
    });
  });

  describe('reclassifyLoans', () => {
    it('classifies a loan as SUBSTANDARD at 90+ days overdue', async () => {
      const oldestDueDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
      groupByMock.mockResolvedValueOnce([
        { applicationId: 'app-1', _min: { dueDate: oldestDueDate } },
      ]);

      await service.reclassifyLoans('system-user');

      expect(appUpdateMock).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: {
          nrbClassification: 'SUBSTANDARD',
          nrbClassifiedAt: expect.any(Date) as Date,
        },
      });
    });

    it('resets loans with no remaining overdue entries back to PASS', async () => {
      groupByMock.mockResolvedValueOnce([]);

      await service.reclassifyLoans('system-user');

      expect(appUpdateManyMock).toHaveBeenCalledWith({
        where: { nrbClassification: { not: 'PASS' }, id: { notIn: [] } },
        data: {
          nrbClassification: 'PASS',
          nrbClassifiedAt: expect.any(Date) as Date,
        },
      });
    });
  });

  describe('markPaid', () => {
    it('marks the entry PAID when the paid amount covers the full EMI', async () => {
      entryFindUniqueMock.mockResolvedValueOnce({
        id: 'entry-1',
        applicationId,
        emiAmount: 10439,
      });

      await service.markPaid('user-1', 'entry-1', {
        paidAmount: 10439,
        paidDate: '2026-07-25T00:00:00.000Z',
      });

      expect(entryUpdateMock).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
        data: {
          paidAmount: 10439,
          paidDate: new Date('2026-07-25T00:00:00.000Z'),
          status: 'PAID',
        },
      });
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.EMI_PAYMENT_RECORDED,
        { entryId: 'entry-1', paidAmount: 10439 },
        applicationId,
        AuditCategory.REPAYMENT,
      );
    });

    it('marks the entry PARTIAL when the paid amount is less than the full EMI', async () => {
      entryFindUniqueMock.mockResolvedValueOnce({
        id: 'entry-1',
        applicationId,
        emiAmount: 10439,
      });

      await service.markPaid('user-1', 'entry-1', {
        paidAmount: 5000,
        paidDate: '2026-07-25T00:00:00.000Z',
      });

      const { data } = entryUpdateMock.mock.calls[0][0];
      expect(data.status).toBe('PARTIAL');
    });

    it('throws NotFoundException for an unknown schedule entry', async () => {
      await expect(
        service.markPaid('user-1', 'missing', {
          paidAmount: 100,
          paidDate: '2026-07-25T00:00:00.000Z',
        }),
      ).rejects.toThrow();
      expect(entryUpdateMock).not.toHaveBeenCalled();
    });
  });

  describe('getNotificationTriggers', () => {
    it('returns the static trigger schedule unmodified', () => {
      expect(service.getNotificationTriggers()).toBe(EMI_NOTIFICATION_TRIGGERS);
    });
  });

  describe('configureServicing', () => {
    it('throws NotFoundException when the application has no loan account', async () => {
      loanAccountFindUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.configureServicing('cm-1', applicationId, {}),
      ).rejects.toThrow();
    });

    it('throws when the loan is already cleared', async () => {
      loanAccountFindUniqueMock.mockResolvedValueOnce({
        applicationId,
        status: 'CLEARED',
      });
      await expect(
        service.configureServicing('cm-1', applicationId, {}),
      ).rejects.toThrow();
    });

    it('updates the loan account config and regenerates the schedule', async () => {
      loanAccountFindUniqueMock
        .mockResolvedValueOnce({ applicationId, status: 'ACTIVE' }) // pre-check
        .mockResolvedValueOnce({ applicationId, status: 'ACTIVE' }) // read inside generateSchedule
        .mockResolvedValueOnce({
          applicationId,
          status: 'ACTIVE',
          finalInterestRate: 11,
          finalTenureMonths: 24,
          gracePeriodMonths: 2,
        }); // final read-back

      await service.configureServicing('cm-1', applicationId, {
        finalInterestRate: 11,
        finalTenureMonths: 24,
        gracePeriodMonths: 2,
      });

      expect(loanAccountUpdateMock).toHaveBeenCalledWith({
        where: { applicationId },
        data: {
          finalInterestRate: 11,
          finalTenureMonths: 24,
          gracePeriodMonths: 2,
          emiStartDate: undefined,
          configuredByUserId: 'cm-1',
          configuredAt: expect.any(Date) as Date,
        },
      });
      expect(auditLogMock).toHaveBeenCalledWith(
        'cm-1',
        AuditAction.LOAN_SERVICING_CONFIGURED,
        expect.objectContaining({
          finalInterestRate: 11,
          finalTenureMonths: 24,
        }),
        applicationId,
        AuditCategory.REPAYMENT,
      );
    });
  });

  describe('notifyBorrower', () => {
    it('throws when loan servicing has not been configured yet', async () => {
      loanAccountFindUniqueMock.mockResolvedValueOnce({
        applicationId,
        configuredAt: null,
      });
      await expect(
        service.notifyBorrower('cm-1', applicationId),
      ).rejects.toThrow();
    });

    it('throws when no EMI schedule exists', async () => {
      loanAccountFindUniqueMock.mockResolvedValueOnce({
        applicationId,
        configuredAt: new Date(),
      });
      findManyMock.mockResolvedValueOnce([]);
      await expect(
        service.notifyBorrower('cm-1', applicationId),
      ).rejects.toThrow();
    });

    it('composes borrower notification data and marks borrowerNotifiedAt', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...application,
        userId: 'student-1',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '9800000000',
        parentVerification: { phone: '9811111111', contact: null },
      });
      loanAccountFindUniqueMock.mockResolvedValueOnce({
        applicationId,
        configuredAt: new Date(),
        finalInterestRate: 11,
        finalTenureMonths: 24,
        gracePeriodMonths: 1,
      });
      findManyMock.mockResolvedValueOnce([
        {
          installmentNumber: 1,
          emiAmount: 5000,
          dueDate: new Date('2026-08-01'),
        },
        {
          installmentNumber: 2,
          emiAmount: 5000,
          dueDate: new Date('2026-09-01'),
        },
      ]);

      const result = await service.notifyBorrower('cm-1', applicationId);

      expect(notifyLoanFinalizedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'student-1',
          applicationId,
          fullName: 'Jane Doe',
          emiAmount: 5000,
          tenureMonths: 24,
          gracePeriodMonths: 1,
          totalRepayable: 10000,
          parentPhone: '9811111111',
        }),
      );
      expect(loanAccountUpdateMock).toHaveBeenCalledWith({
        where: { applicationId },
        data: { borrowerNotifiedAt: expect.any(Date) as Date },
      });
      expect(result).toEqual({
        studentNotified: true,
        parentNotified: false,
        parentChannel: null,
      });
    });
  });

  describe('collection activity', () => {
    it('records a collection activity against the application', async () => {
      findUniqueMock.mockResolvedValueOnce({ id: applicationId });
      collectionActivityCreateMock.mockResolvedValueOnce({
        id: 'activity-1',
        applicationId,
        activityType: CollectionActivityType.CALL,
      });

      await service.recordCollectionActivity('cm-1', applicationId, {
        activityType: CollectionActivityType.CALL,
        notes: 'Called borrower',
      });

      expect(collectionActivityCreateMock).toHaveBeenCalledWith({
        data: {
          applicationId,
          createdByUserId: 'cm-1',
          activityType: CollectionActivityType.CALL,
          notes: 'Called borrower',
          contactedPerson: undefined,
        },
      });
      expect(auditLogMock).toHaveBeenCalledWith(
        'cm-1',
        AuditAction.COLLECTION_ACTIVITY_RECORDED,
        { activityId: 'activity-1', activityType: 'CALL' },
        applicationId,
        AuditCategory.REPAYMENT,
      );
    });

    it('throws NotFoundException when the application does not exist', async () => {
      findUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.recordCollectionActivity('cm-1', 'missing', {
          activityType: CollectionActivityType.CALL,
          notes: 'x',
        }),
      ).rejects.toThrow();
    });

    it('paginates collection activity for an application', async () => {
      collectionActivityCountMock.mockResolvedValueOnce(5);
      const result = await service.listCollectionActivity(applicationId, {
        page: 1,
        limit: 20,
      });
      expect(collectionActivityFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: { applicationId } }),
      );
      expect(result.meta.total).toBe(5);
    });
  });

  describe('needs review', () => {
    it('flags a loan for review with a mandatory reason', async () => {
      loanAccountFindUniqueMock.mockResolvedValueOnce({
        applicationId,
        status: 'ACTIVE',
      });
      loanAccountUpdateMock.mockResolvedValueOnce({
        applicationId,
        status: 'NEEDS_REVIEW',
      });

      await service.flagNeedsReview('cm-1', applicationId, {
        reason: 'Repeated missed installments',
      });

      expect(loanAccountUpdateMock).toHaveBeenCalledWith({
        where: { applicationId },
        data: {
          status: 'NEEDS_REVIEW',
          reviewReason: 'Repeated missed installments',
          reviewRequestedByUserId: 'cm-1',
          reviewRequestedAt: expect.any(Date) as Date,
          reviewResolvedByUserId: null,
          reviewResolvedAt: null,
        },
      });
      expect(auditLogMock).toHaveBeenCalledWith(
        'cm-1',
        AuditAction.LOAN_NEEDS_REVIEW,
        { reason: 'Repeated missed installments' },
        applicationId,
        AuditCategory.REPAYMENT,
      );
    });

    it('throws when the loan is already cleared', async () => {
      loanAccountFindUniqueMock.mockResolvedValueOnce({
        applicationId,
        status: 'CLEARED',
      });
      await expect(
        service.flagNeedsReview('cm-1', applicationId, { reason: 'x' }),
      ).rejects.toThrow();
    });

    it('resolves a loan back to ACTIVE from NEEDS_REVIEW', async () => {
      loanAccountFindUniqueMock.mockResolvedValueOnce({
        applicationId,
        status: 'NEEDS_REVIEW',
      });
      loanAccountUpdateMock.mockResolvedValueOnce({
        applicationId,
        status: 'ACTIVE',
      });

      await service.resolveReview('cm-1', applicationId, {
        resolutionNotes: 'Arrears cleared',
      });

      expect(loanAccountUpdateMock).toHaveBeenCalledWith({
        where: { applicationId },
        data: {
          status: 'ACTIVE',
          reviewResolvedByUserId: 'cm-1',
          reviewResolvedAt: expect.any(Date) as Date,
        },
      });
    });

    it('throws when the loan is not currently under review', async () => {
      loanAccountFindUniqueMock.mockResolvedValueOnce({
        applicationId,
        status: 'ACTIVE',
      });
      await expect(
        service.resolveReview('cm-1', applicationId, {}),
      ).rejects.toThrow();
    });
  });
});
