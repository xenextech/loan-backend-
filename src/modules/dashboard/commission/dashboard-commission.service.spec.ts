import { NotFoundException } from '@nestjs/common';
import { DashboardCommissionService } from './dashboard-commission.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  AuditAction,
  AuditCategory,
  CommissionEntryStatus,
  CommissionPartnerType,
  CommissionRateType,
  NRB_DIGITAL_LENDING_CAP,
} from '../../../common/enums';

interface EntryUpdateCallArgs {
  data: { status?: CommissionEntryStatus; paidAt?: Date };
}

describe('DashboardCommissionService', () => {
  let entryFindManyMock: jest.Mock;
  let entryCountMock: jest.Mock;
  let entryCreateMock: jest.Mock;
  let entryUpdateMock: jest.Mock<unknown, [EntryUpdateCallArgs]>;
  let entryFindUniqueMock: jest.Mock;
  let partnerFindManyMock: jest.Mock;
  let partnerCountMock: jest.Mock;
  let partnerCreateMock: jest.Mock;
  let partnerUpdateMock: jest.Mock;
  let partnerFindUniqueMock: jest.Mock;
  let loanApplicationFindManyMock: jest.Mock;
  let loanApplicationCountMock: jest.Mock;
  let auditLogMock: jest.Mock;
  let service: DashboardCommissionService;

  beforeEach(() => {
    entryFindManyMock = jest.fn().mockResolvedValue([]);
    entryCountMock = jest.fn().mockResolvedValue(0);
    entryCreateMock = jest.fn();
    entryUpdateMock = jest.fn<unknown, [EntryUpdateCallArgs]>();
    entryFindUniqueMock = jest.fn().mockResolvedValue(null);
    partnerFindManyMock = jest.fn().mockResolvedValue([]);
    partnerCountMock = jest.fn().mockResolvedValue(0);
    partnerCreateMock = jest.fn();
    partnerUpdateMock = jest.fn();
    partnerFindUniqueMock = jest.fn().mockResolvedValue({ id: 'partner-1' });
    loanApplicationFindManyMock = jest.fn().mockResolvedValue([]);
    loanApplicationCountMock = jest.fn().mockResolvedValue(0);
    auditLogMock = jest.fn().mockResolvedValue(undefined);

    const prisma = {
      commissionEntry: {
        findMany: entryFindManyMock,
        count: entryCountMock,
        create: entryCreateMock,
        update: entryUpdateMock,
        findUnique: entryFindUniqueMock,
      },
      commissionPartner: {
        findMany: partnerFindManyMock,
        count: partnerCountMock,
        create: partnerCreateMock,
        update: partnerUpdateMock,
        findUnique: partnerFindUniqueMock,
      },
      loanApplication: {
        findMany: loanApplicationFindManyMock,
        count: loanApplicationCountMock,
      },
    } as unknown as PrismaService;

    const audit = { log: auditLogMock } as unknown as AuditService;

    service = new DashboardCommissionService(prisma, audit);
  });

  describe('getSummary', () => {
    it('splits total/bank/college earnings and pending payment for the current year', async () => {
      entryFindManyMock.mockResolvedValueOnce([
        {
          amount: 3200,
          status: 'PAID',
          partner: { partnerType: CommissionPartnerType.BANK },
        },
        {
          amount: 1850,
          status: 'PENDING',
          partner: { partnerType: CommissionPartnerType.BANK },
        },
        {
          amount: 2328,
          status: 'INVOICE_DUE',
          partner: { partnerType: CommissionPartnerType.COLLEGE },
        },
      ]);

      const summary = await service.getSummary();
      expect(summary).toEqual({
        totalEarned: 7378,
        fromBanks: 5050,
        fromColleges: 2328,
        pendingPayment: 4178,
      });
    });
  });

  describe('getByBank / getByCollege', () => {
    it('counts distinct loans and sums earnings per bank partner', async () => {
      partnerFindManyMock.mockResolvedValueOnce([
        {
          id: 'p1',
          name: 'Best Finance Co. (BFCL)',
          rateType: CommissionRateType.PERCENTAGE,
          rateValue: 0.1,
          mouReference: 'MOU-1',
          isActive: true,
          entries: [
            { amount: 1000, applicationId: 'app-1' },
            { amount: 2000, applicationId: 'app-1' }, // same loan, two entries
            { amount: 500, applicationId: 'app-2' },
          ],
        },
      ]);
      partnerCountMock.mockResolvedValueOnce(1);

      const result = await service.getByBank({ page: 1, limit: 20 });
      expect(partnerFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { partnerType: CommissionPartnerType.BANK },
        }),
      );
      expect(result.data[0]).toEqual(
        expect.objectContaining({ loans: 2, totalEarned: 3500 }),
      );
    });

    it('scopes getByCollege to college-type partners', async () => {
      await service.getByCollege({ page: 1, limit: 20 });
      expect(partnerFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { partnerType: CommissionPartnerType.COLLEGE },
        }),
      );
    });
  });

  describe('getNrbCapCompliance', () => {
    it('computes utilization percent and compliance against the NRB cap', async () => {
      loanApplicationFindManyMock.mockResolvedValueOnce([
        {
          id: 'app-1',
          applicationNumber: 'GenZ-2026-00001',
          fullName: 'Birgunj Traders',
          creditLimit: NRB_DIGITAL_LENDING_CAP * 1.2,
        },
      ]);
      loanApplicationCountMock.mockResolvedValueOnce(1);

      const result = await service.getNrbCapCompliance({ page: 1, limit: 20 });
      expect(result.data[0]).toEqual({
        applicationId: 'app-1',
        refNo: 'GenZ-2026-00001',
        borrower: 'Birgunj Traders',
        creditLimit: NRB_DIGITAL_LENDING_CAP * 1.2,
        nrbCapAmount: NRB_DIGITAL_LENDING_CAP,
        utilizationPercent: 120,
        compliant: false,
      });
    });

    it('marks a borrower within the cap as compliant', async () => {
      loanApplicationFindManyMock.mockResolvedValueOnce([
        {
          id: 'app-2',
          applicationNumber: 'GenZ-2026-00002',
          fullName: 'Sunita Shrestha',
          creditLimit: NRB_DIGITAL_LENDING_CAP * 0.5,
        },
      ]);
      const result = await service.getNrbCapCompliance({ page: 1, limit: 20 });
      expect(result.data[0].compliant).toBe(true);
    });
  });

  describe('partner CRUD', () => {
    it('creates a partner and logs the action', async () => {
      partnerCreateMock.mockResolvedValueOnce({ id: 'p1' });
      const dto = {
        partnerType: CommissionPartnerType.BANK,
        name: 'NIC Asia Bank',
        rateType: CommissionRateType.FLAT,
        rateValue: 1500,
      };
      await service.createPartner('user-1', dto);

      expect(partnerCreateMock).toHaveBeenCalledWith({ data: dto });
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.COMMISSION_PARTNER_UPDATED,
        { partnerId: 'p1', action: 'created' },
        undefined,
        AuditCategory.COMMISSION,
      );
    });

    it('throws NotFoundException updating a partner that does not exist', async () => {
      partnerFindUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.updatePartner('user-1', 'missing', { isActive: false }),
      ).rejects.toThrow(NotFoundException);
      expect(partnerUpdateMock).not.toHaveBeenCalled();
    });
  });

  describe('commission entries', () => {
    it('throws NotFoundException creating an entry for an unknown partner', async () => {
      partnerFindUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.createEntry('user-1', {
          partnerId: 'missing',
          amount: 100,
          month: '2026-06-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(NotFoundException);
      expect(entryCreateMock).not.toHaveBeenCalled();
    });

    it('creates an entry and logs COMMISSION_ENTRY_CREATED', async () => {
      entryCreateMock.mockResolvedValueOnce({ id: 'entry-1' });
      await service.createEntry('user-1', {
        applicationId: 'app-1',
        partnerId: 'partner-1',
        amount: 710,
        month: '2026-06-01T00:00:00.000Z',
      });

      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.COMMISSION_ENTRY_CREATED,
        { entryId: 'entry-1', amount: 710 },
        'app-1',
        AuditCategory.COMMISSION,
      );
    });

    it('filters entries by partnerId and status', async () => {
      await service.listEntries({
        page: 1,
        limit: 20,
        partnerId: 'partner-1',
        status: CommissionEntryStatus.PAID,
      });
      expect(entryFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { partnerId: 'partner-1', status: 'PAID' },
        }),
      );
    });

    it('throws NotFoundException updating an entry that does not exist', async () => {
      entryFindUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.updateEntry('user-1', 'missing', {
          status: CommissionEntryStatus.PAID,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('stamps paidAt and logs COMMISSION_ENTRY_PAID only when marked PAID', async () => {
      entryFindUniqueMock.mockResolvedValueOnce({
        id: 'entry-1',
        applicationId: 'app-1',
        paidAt: null,
      });
      entryUpdateMock.mockResolvedValueOnce({ id: 'entry-1', status: 'PAID' });

      await service.updateEntry('user-1', 'entry-1', {
        status: CommissionEntryStatus.PAID,
      });

      const { data } = entryUpdateMock.mock.calls[0][0];
      expect(data.paidAt).toBeInstanceOf(Date);
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.COMMISSION_ENTRY_PAID,
        { entryId: 'entry-1' },
        'app-1',
        AuditCategory.COMMISSION,
      );
    });

    it('does not log COMMISSION_ENTRY_PAID for a non-PAID status update', async () => {
      entryFindUniqueMock.mockResolvedValueOnce({
        id: 'entry-1',
        applicationId: 'app-1',
        paidAt: null,
      });
      entryUpdateMock.mockResolvedValueOnce({
        id: 'entry-1',
        status: 'INVOICE_DUE',
      });

      await service.updateEntry('user-1', 'entry-1', {
        status: CommissionEntryStatus.INVOICE_DUE,
      });

      expect(auditLogMock).not.toHaveBeenCalledWith(
        'user-1',
        AuditAction.COMMISSION_ENTRY_PAID,
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });
  });
});
