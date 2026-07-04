import { DashboardOverviewService } from './dashboard-overview.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CommissionPartnerType } from '../../../common/enums';

describe('DashboardOverviewService', () => {
  let disbursementAggregateMock: jest.Mock;
  let loanApplicationCountMock: jest.Mock;
  let loanApplicationFindManyMock: jest.Mock;
  let emiAggregateMock: jest.Mock;
  let emiFindManyMock: jest.Mock;
  let commissionFindManyMock: jest.Mock;
  let personalGuaranteeFindManyMock: jest.Mock;
  let insurancePolicyFindManyMock: jest.Mock;
  let service: DashboardOverviewService;

  beforeEach(() => {
    disbursementAggregateMock = jest
      .fn()
      .mockResolvedValue({ _sum: { totalDisbursedAmount: 1840000 } });
    // Call order in getOverview(): pendingMyActionCount, initiatedOnly, supported, approved
    loanApplicationCountMock = jest
      .fn()
      .mockResolvedValueOnce(5) // pendingMyActionCount
      .mockResolvedValueOnce(12) // initiatedOnly
      .mockResolvedValueOnce(9) // supported
      .mockResolvedValueOnce(3); // approved
    loanApplicationFindManyMock = jest.fn().mockResolvedValue([]);
    emiAggregateMock = jest
      .fn()
      .mockResolvedValue({ _sum: { emiAmount: 74500 }, _count: 4 });
    emiFindManyMock = jest.fn().mockResolvedValue([]);
    commissionFindManyMock = jest.fn().mockResolvedValue([]);
    personalGuaranteeFindManyMock = jest.fn().mockResolvedValue([]);
    insurancePolicyFindManyMock = jest.fn().mockResolvedValue([]);

    const prisma = {
      disbursement: { aggregate: disbursementAggregateMock },
      loanApplication: {
        count: loanApplicationCountMock,
        findMany: loanApplicationFindManyMock,
      },
      emiScheduleEntry: {
        aggregate: emiAggregateMock,
        findMany: emiFindManyMock,
      },
      commissionEntry: { findMany: commissionFindManyMock },
      personalGuarantee: { findMany: personalGuaranteeFindManyMock },
      insurancePolicy: { findMany: insurancePolicyFindManyMock },
    } as unknown as PrismaService;

    service = new DashboardOverviewService(prisma);
  });

  describe('getOverview', () => {
    it('assembles portfolio total, overdue EMI, pipeline counts, and marks the pipeline as approximate', async () => {
      const overview = await service.getOverview();

      expect(overview.portfolioTotal).toBe(1840000);
      expect(overview.pendingMyActionCount).toBe(5);
      expect(overview.overdueEmi).toEqual({ count: 4, amount: 74500 });
      expect(overview.approvalPipeline).toEqual({
        approximate: true,
        initiated: 12,
        supported: 9,
        approved: 3,
      });
    });

    it('splits commission this month by partner type', async () => {
      commissionFindManyMock.mockResolvedValueOnce([
        { amount: 1000, partner: { partnerType: CommissionPartnerType.BANK } },
        { amount: 500, partner: { partnerType: CommissionPartnerType.BANK } },
        {
          amount: 300,
          partner: { partnerType: CommissionPartnerType.COLLEGE },
        },
      ]);

      const overview = await service.getOverview();
      expect(overview.commissionThisMonth).toEqual({
        total: 1800,
        fromBanks: 1500,
        fromColleges: 300,
      });
    });

    it('defaults portfolio total to 0 when there are no disbursements yet', async () => {
      disbursementAggregateMock.mockResolvedValueOnce({
        _sum: { totalDisbursedAmount: null },
      });
      const overview = await service.getOverview();
      expect(overview.portfolioTotal).toBe(0);
    });

    it('surfaces alerts built from CICL flags, expiring insurance, and overdue EMIs', async () => {
      personalGuaranteeFindManyMock.mockResolvedValueOnce([
        { applicationId: 'app-1' },
      ]);
      insurancePolicyFindManyMock.mockResolvedValueOnce([
        {
          applicationId: 'app-2',
          policyNumber: 'POL-1',
          expiryDate: new Date('2026-07-10'),
        },
      ]);
      emiFindManyMock.mockResolvedValueOnce([
        {
          applicationId: 'app-3',
          dueDate: new Date('2026-06-01'),
          emiAmount: 8200,
        },
      ]);

      const overview = await service.getOverview();
      expect(overview.alerts).toHaveLength(3);
      expect(overview.alerts.map((a: { type: string }) => a.type)).toEqual([
        'CICL_FLAG',
        'INSURANCE_EXPIRING',
        'EMI_OVERDUE',
      ]);
    });
  });

  describe('getCheckerQueue', () => {
    it('queries only SUBMITTED applications awaiting approver sign-off, paginated', async () => {
      loanApplicationCountMock.mockReset().mockResolvedValueOnce(7);
      loanApplicationFindManyMock.mockResolvedValueOnce([{ id: 'app-1' }]);

      const result = await service.getCheckerQueue({ page: 1, limit: 20 });

      expect(loanApplicationFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'SUBMITTED', approverDate: null },
        }),
      );
      expect(result.meta.total).toBe(7);
    });
  });

  describe('getAlerts', () => {
    it('paginates the same alert set built for the overview', async () => {
      personalGuaranteeFindManyMock.mockResolvedValueOnce([
        { applicationId: 'app-1' },
      ]);
      const result = await service.getAlerts({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
