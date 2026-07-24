import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DashboardDisbursementService } from './dashboard-disbursement.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  AuditAction,
  AuditCategory,
  DisbursementConditionStatus,
} from '../../../common/enums';

interface UpdateConditionCallArgs {
  data: {
    status: DisbursementConditionStatus;
    completedAt: Date | null;
    completedByUserId: string | null;
  };
}

interface TrancheCreateCallArgs {
  data: {
    disbursementId: string;
    trancheNumber: number;
    amount: number;
    accountCredited: string;
    status: string;
    disbursedAt: Date;
  };
}

describe('DashboardDisbursementService', () => {
  let loanApplicationFindManyMock: jest.Mock;
  let loanApplicationCountMock: jest.Mock;
  let loanApplicationFindUniqueMock: jest.Mock;
  let conditionFindManyMock: jest.Mock;
  let conditionCreateMock: jest.Mock;
  let conditionFindUniqueMock: jest.Mock;
  let conditionUpdateMock: jest.Mock<unknown, [UpdateConditionCallArgs]>;
  let disbursementUpsertMock: jest.Mock;
  let trancheCreateMock: jest.Mock<unknown, [TrancheCreateCallArgs]>;
  let trancheFindManyMock: jest.Mock;
  let trancheCountMock: jest.Mock;
  let generatedAgreementFindFirstMock: jest.Mock;
  let auditLogMock: jest.Mock;
  let service: DashboardDisbursementService;

  beforeEach(() => {
    loanApplicationFindManyMock = jest.fn().mockResolvedValue([]);
    loanApplicationCountMock = jest.fn().mockResolvedValue(0);
    loanApplicationFindUniqueMock = jest.fn().mockResolvedValue({
      id: 'app-1',
      parentVerification: { bankAccountNumber: '1234567890' },
    });
    conditionFindManyMock = jest.fn().mockResolvedValue([]);
    conditionCreateMock = jest.fn();
    conditionFindUniqueMock = jest.fn().mockResolvedValue(null);
    conditionUpdateMock = jest.fn<unknown, [UpdateConditionCallArgs]>();
    disbursementUpsertMock = jest.fn();
    trancheCreateMock = jest.fn<unknown, [TrancheCreateCallArgs]>();
    trancheFindManyMock = jest.fn().mockResolvedValue([]);
    trancheCountMock = jest.fn().mockResolvedValue(0);
    generatedAgreementFindFirstMock = jest
      .fn()
      .mockResolvedValue({ id: 'agr-1', status: 'SIGNED' });
    auditLogMock = jest.fn().mockResolvedValue(undefined);

    const prisma = {
      loanApplication: {
        findMany: loanApplicationFindManyMock,
        count: loanApplicationCountMock,
        findUnique: loanApplicationFindUniqueMock,
      },
      disbursementCondition: {
        findMany: conditionFindManyMock,
        create: conditionCreateMock,
        findUnique: conditionFindUniqueMock,
        update: conditionUpdateMock,
      },
      disbursement: { upsert: disbursementUpsertMock },
      disbursementTranche: {
        create: trancheCreateMock,
        findMany: trancheFindManyMock,
        count: trancheCountMock,
      },
      generatedAgreement: { findFirst: generatedAgreementFindFirstMock },
    } as unknown as PrismaService;

    const audit = { log: auditLogMock } as unknown as AuditService;

    service = new DashboardDisbursementService(prisma, audit);
  });

  describe('getPending', () => {
    it('computes conditionsDone/conditionsTotal and defaults status to PENDING', async () => {
      loanApplicationFindManyMock.mockResolvedValueOnce([
        {
          id: 'app-1',
          applicationNumber: 'Unnati-2026-00001',
          fullName: 'Sharada Sah Godh',
          creditLimit: 710000,
          disbursementConditions: [{ status: 'DONE' }, { status: 'PENDING' }],
          disbursement: null,
          parentVerification: null,
          generatedAgreements: [],
        },
      ]);

      const result = await service.getPending({ page: 1, limit: 20 });
      expect(result.data[0]).toEqual({
        applicationId: 'app-1',
        refNo: 'Unnati-2026-00001',
        borrower: 'Sharada Sah Godh',
        amount: 710000,
        conditionsDone: 1,
        conditionsTotal: 2,
        status: 'PENDING',
        bankAccountReady: false,
        legalDocumentReady: false,
      });
    });

    it('surfaces the real disbursement status when one already exists', async () => {
      loanApplicationFindManyMock.mockResolvedValueOnce([
        {
          id: 'app-2',
          applicationNumber: 'Unnati-2026-00002',
          fullName: 'Sunita Shrestha',
          creditLimit: 450000,
          disbursementConditions: [],
          disbursement: { status: 'PARTIAL' },
          parentVerification: { bankAccountNumber: '999' },
          generatedAgreements: [{ id: 'agr-1' }],
        },
      ]);
      const result = await service.getPending({ page: 1, limit: 20 });
      expect(result.data[0].status).toBe('PARTIAL');
      expect(result.data[0].bankAccountReady).toBe(true);
      expect(result.data[0].legalDocumentReady).toBe(true);
    });
  });

  describe('getConditions', () => {
    it('throws NotFoundException for a missing application', async () => {
      loanApplicationFindUniqueMock.mockResolvedValueOnce(null);
      await expect(service.getConditions('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addCondition', () => {
    it('creates the condition and logs it under the DISBURSEMENT category', async () => {
      conditionCreateMock.mockResolvedValueOnce({ id: 'cond-1' });
      await service.addCondition('user-1', 'app-1', { label: 'Deed executed' });

      expect(conditionCreateMock).toHaveBeenCalledWith({
        data: { applicationId: 'app-1', label: 'Deed executed' },
      });
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.DISBURSEMENT_CONDITION_UPDATED,
        { conditionId: 'cond-1', action: 'created', label: 'Deed executed' },
        'app-1',
        AuditCategory.DISBURSEMENT,
      );
    });

    it('rejects when no signed Loan Agreement legal document exists', async () => {
      generatedAgreementFindFirstMock.mockResolvedValueOnce(null);
      await expect(
        service.addCondition('user-1', 'app-1', { label: 'Deed executed' }),
      ).rejects.toThrow(BadRequestException);
      expect(conditionCreateMock).not.toHaveBeenCalled();
    });
  });

  describe('updateCondition', () => {
    it('throws NotFoundException when the condition belongs to a different application', async () => {
      conditionFindUniqueMock.mockResolvedValueOnce({
        id: 'cond-1',
        applicationId: 'other-app',
      });
      await expect(
        service.updateCondition('user-1', 'app-1', 'cond-1', {
          status: DisbursementConditionStatus.DONE,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('stamps completedAt/completedByUserId when marked DONE', async () => {
      conditionFindUniqueMock.mockResolvedValueOnce({
        id: 'cond-1',
        applicationId: 'app-1',
      });
      await service.updateCondition('user-1', 'app-1', 'cond-1', {
        status: DisbursementConditionStatus.DONE,
      });

      const { data } = conditionUpdateMock.mock.calls[0][0];
      expect(data.status).toBe(DisbursementConditionStatus.DONE);
      expect(data.completedByUserId).toBe('user-1');
      expect(data.completedAt).toBeInstanceOf(Date);
    });

    it('clears completedAt/completedByUserId for a non-DONE status', async () => {
      conditionFindUniqueMock.mockResolvedValueOnce({
        id: 'cond-1',
        applicationId: 'app-1',
      });
      await service.updateCondition('user-1', 'app-1', 'cond-1', {
        status: DisbursementConditionStatus.PENDING,
      });

      const { data } = conditionUpdateMock.mock.calls[0][0];
      expect(data.completedAt).toBeNull();
      expect(data.completedByUserId).toBeNull();
    });

    it('rejects when no signed Loan Agreement legal document exists', async () => {
      conditionFindUniqueMock.mockResolvedValueOnce({
        id: 'cond-1',
        applicationId: 'app-1',
      });
      generatedAgreementFindFirstMock.mockResolvedValueOnce(null);
      await expect(
        service.updateCondition('user-1', 'app-1', 'cond-1', {
          status: DisbursementConditionStatus.DONE,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(conditionUpdateMock).not.toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    it('upserts the disbursement, creates a tranche, and logs both audit events', async () => {
      disbursementUpsertMock.mockResolvedValueOnce({ id: 'disb-1' });
      trancheCreateMock.mockResolvedValueOnce({ id: 'tranche-1' });

      const result = await service.confirm('user-1', 'app-1', {
        trancheNumber: 1,
        amount: 710000,
        accountCredited: 'College A/C',
      });

      expect(disbursementUpsertMock).toHaveBeenCalledWith({
        where: { applicationId: 'app-1' },
        create: {
          applicationId: 'app-1',
          status: 'PARTIAL',
          initiatedByUserId: 'user-1',
          totalDisbursedAmount: 710000,
        },
        update: {
          status: 'PARTIAL',
          totalDisbursedAmount: { increment: 710000 },
        },
      });
      const trancheCallArgs = trancheCreateMock.mock.calls[0][0];
      expect(trancheCallArgs.data).toMatchObject({
        disbursementId: 'disb-1',
        trancheNumber: 1,
        amount: 710000,
        accountCredited: 'College A/C',
        status: 'CREDITED',
      });
      expect(trancheCallArgs.data.disbursedAt).toBeInstanceOf(Date);
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.DISBURSEMENT_TRANCHE_CREATED,
        { trancheId: 'tranche-1', amount: 710000 },
        'app-1',
        AuditCategory.DISBURSEMENT,
      );
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.DISBURSEMENT_CONFIRMED,
        { disbursementId: 'disb-1', trancheNumber: 1 },
        'app-1',
        AuditCategory.DISBURSEMENT,
      );
      expect(result).toEqual({
        disbursement: { id: 'disb-1' },
        tranche: { id: 'tranche-1' },
      });
    });

    it('throws NotFoundException before touching disbursement records for a missing application', async () => {
      loanApplicationFindUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.confirm('user-1', 'missing', { trancheNumber: 1, amount: 100 }),
      ).rejects.toThrow(NotFoundException);
      expect(disbursementUpsertMock).not.toHaveBeenCalled();
    });

    it('rejects disbursement when no signed Loan Agreement legal document exists', async () => {
      generatedAgreementFindFirstMock.mockResolvedValueOnce(null);
      await expect(
        service.confirm('user-1', 'app-1', {
          trancheNumber: 1,
          amount: 710000,
          accountCredited: 'College A/C',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(disbursementUpsertMock).not.toHaveBeenCalled();
    });

    it('rejects disbursement while any condition is not yet DONE', async () => {
      conditionFindManyMock.mockResolvedValueOnce([
        { id: 'cond-1', status: 'DONE' },
        { id: 'cond-2', status: 'PENDING' },
      ]);
      await expect(
        service.confirm('user-1', 'app-1', {
          trancheNumber: 1,
          amount: 710000,
          accountCredited: 'College A/C',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(disbursementUpsertMock).not.toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('paginates disbursement tranches ordered by most recent', async () => {
      trancheCountMock.mockResolvedValueOnce(15);
      const result = await service.getHistory({ page: 2, limit: 5 });
      expect(trancheFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { disbursedAt: 'desc' },
          take: 5,
          skip: 5,
        }),
      );
      expect(result.meta.total).toBe(15);
    });
  });
});
