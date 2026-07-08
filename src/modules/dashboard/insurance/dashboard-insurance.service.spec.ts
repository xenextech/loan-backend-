import { NotFoundException } from '@nestjs/common';
import { DashboardInsuranceService } from './dashboard-insurance.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, AuditCategory } from '../../../common/enums';

interface PolicyCreateCallArgs {
  data: {
    applicationId: string;
    applicantName?: string;
    policyNumber: string;
    addedByUserId: string;
  };
}

describe('DashboardInsuranceService', () => {
  const NOW = new Date('2026-07-04T00:00:00.000Z');

  let policyFindManyMock: jest.Mock;
  let policyCountMock: jest.Mock;
  let policyAggregateMock: jest.Mock;
  let policyFindUniqueMock: jest.Mock;
  let policyCreateMock: jest.Mock<unknown, [PolicyCreateCallArgs]>;
  let loanApplicationFindUniqueMock: jest.Mock;
  let loanApplicationAggregateMock: jest.Mock;
  let auditLogMock: jest.Mock;
  let service: DashboardInsuranceService;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);

    policyFindManyMock = jest.fn().mockResolvedValue([]);
    policyCountMock = jest.fn().mockResolvedValue(0);
    policyAggregateMock = jest
      .fn()
      .mockResolvedValue({ _sum: { sumInsured: 0 } });
    policyFindUniqueMock = jest.fn().mockResolvedValue(null);
    policyCreateMock = jest.fn<unknown, [PolicyCreateCallArgs]>();
    loanApplicationFindUniqueMock = jest
      .fn()
      .mockResolvedValue({ id: 'app-1' });
    loanApplicationAggregateMock = jest
      .fn()
      .mockResolvedValue({ _sum: { creditLimit: 0 } });
    auditLogMock = jest.fn().mockResolvedValue(undefined);

    const prisma = {
      insurancePolicy: {
        findMany: policyFindManyMock,
        count: policyCountMock,
        aggregate: policyAggregateMock,
        findUnique: policyFindUniqueMock,
        create: policyCreateMock,
      },
      loanApplication: {
        findUnique: loanApplicationFindUniqueMock,
        aggregate: loanApplicationAggregateMock,
      },
    } as unknown as PrismaService;

    const audit = { log: auditLogMock } as unknown as AuditService;

    service = new DashboardInsuranceService(prisma, audit);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getStats', () => {
    it('computes sumInsuredToLoanRatio as a percentage of total credit limit', async () => {
      policyAggregateMock.mockResolvedValueOnce({
        _sum: { sumInsured: 500000 },
      });
      loanApplicationAggregateMock.mockResolvedValueOnce({
        _sum: { creditLimit: 1000000 },
      });

      const stats = await service.getStats();
      expect(stats.sumInsuredToLoanRatio).toBe(50);
    });

    it('returns null ratio when there are no loans with a credit limit yet', async () => {
      const stats = await service.getStats();
      expect(stats.sumInsuredToLoanRatio).toBeNull();
    });
  });

  describe('list — computed policy status', () => {
    it('marks a policy as EXPIRED when the expiry date is in the past', async () => {
      policyFindManyMock.mockResolvedValueOnce([
        { id: 'p1', expiryDate: new Date('2026-06-01') },
      ]);
      const result = await service.list({ page: 1, limit: 20 });
      expect(result.data[0].status).toBe('EXPIRED');
    });

    it('marks a policy as EXPIRING_SOON within the 30-day window', async () => {
      policyFindManyMock.mockResolvedValueOnce([
        { id: 'p1', expiryDate: new Date('2026-07-20') }, // 16 days out
      ]);
      const result = await service.list({ page: 1, limit: 20 });
      expect(result.data[0].status).toBe('EXPIRING_SOON');
    });

    it('marks a policy as ACTIVE when expiry is safely beyond 30 days', async () => {
      policyFindManyMock.mockResolvedValueOnce([
        { id: 'p1', expiryDate: new Date('2027-01-01') },
      ]);
      const result = await service.list({ page: 1, limit: 20 });
      expect(result.data[0].status).toBe('ACTIVE');
    });

    it('filters by applicationId when provided', async () => {
      await service.list({ page: 1, limit: 20, applicationId: 'app-1' });
      expect(policyFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: { applicationId: 'app-1' } }),
      );
    });
  });

  describe('getOne', () => {
    it('throws NotFoundException for an unknown policy', async () => {
      await expect(service.getOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the policy with a computed status', async () => {
      policyFindUniqueMock.mockResolvedValueOnce({
        id: 'p1',
        expiryDate: new Date('2027-01-01'),
      });
      const result = await service.getOne('p1');
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('create', () => {
    it('throws NotFoundException when the application does not exist', async () => {
      loanApplicationFindUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.create('user-1', {
          applicationId: 'missing',
          applicantName: 'Jane Student',
          policyNumber: 'POL-1',
          insurer: 'IME',
          sumInsured: 100000,
          expiryDate: '2027-01-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(policyCreateMock).not.toHaveBeenCalled();
    });

    it('creates the policy — including applicantName — and logs an audit entry', async () => {
      policyCreateMock.mockResolvedValueOnce({
        id: 'p1',
        policyNumber: 'POL-1',
        expiryDate: new Date('2027-01-01'),
      });

      const result = await service.create('user-1', {
        applicationId: 'app-1',
        applicantName: 'Jane Student',
        policyNumber: 'POL-1',
        insurer: 'IME',
        sumInsured: 100000,
        expiryDate: '2027-01-01T00:00:00.000Z',
      });

      const createArgs = policyCreateMock.mock.calls[0][0];
      expect(createArgs.data).toEqual(
        expect.objectContaining({
          applicationId: 'app-1',
          applicantName: 'Jane Student',
          policyNumber: 'POL-1',
          addedByUserId: 'user-1',
        }),
      );
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.INSURANCE_POLICY_ADDED,
        { policyNumber: 'POL-1' },
        'app-1',
        AuditCategory.SYSTEM,
      );
      expect(result.status).toBe('ACTIVE');
    });
  });
});
