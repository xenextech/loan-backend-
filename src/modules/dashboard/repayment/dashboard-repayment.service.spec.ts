import { DashboardRepaymentService } from './dashboard-repayment.service';
import { EmiCalculatorService } from '../../utils/emi-calculator.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
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

    const prisma = {
      loanApplication: { findUnique: findUniqueMock },
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
      },
    } as unknown as PrismaService;

    const audit = { log: auditLogMock } as unknown as AuditService;
    const emiCalculator = new EmiCalculatorService();

    return new DashboardRepaymentService(prisma, audit, emiCalculator);
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

    it('leaves the lower bound open-ended for the 90+ bucket', async () => {
      await service.getOverdue({ page: 1, limit: 20, bucket: '90+' });
      const { where } = findManyMock.mock.calls[0][0];
      expect(where.dueDate.gte).toBeUndefined();
      expect(where.dueDate.lte).toBeInstanceOf(Date);
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
});
