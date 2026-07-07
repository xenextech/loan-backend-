import { NotFoundException } from '@nestjs/common';
import { DashboardApprovalService } from './dashboard-approval.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreditScoreService } from '../../creditScore/credit-score.service';

describe('DashboardApprovalService', () => {
  let findUniqueMock: jest.Mock;
  let auditFindManyMock: jest.Mock;
  let auditCountMock: jest.Mock;
  let calculateByApplicationIdMock: jest.Mock;
  let service: DashboardApprovalService;

  const baseApplication = {
    id: 'app-1',
    applicationNumber: 'Unnati-2026-00001',
    status: 'SUBMITTED',
    dsgir: 30,
    loanToValueRatio: 55,
    identityType: 'CITIZENSHIP',
    identityNumber: '123-456',
    citizenshipNumber: '123-456',
    riskGrade: 'A2',
    securityDetails: 'Land at Ward 3',
    isBlacklisted: false,
    personalGuarantee: { ciclStatus: true, ciclRemarks: 'Clear' },
    insurance: { id: 'ins-1' },
  };

  beforeEach(() => {
    findUniqueMock = jest.fn().mockResolvedValue(baseApplication);
    auditFindManyMock = jest.fn().mockResolvedValue([]);
    auditCountMock = jest.fn().mockResolvedValue(0);
    calculateByApplicationIdMock = jest
      .fn()
      .mockResolvedValue({ overall: { score: 80 } });

    const prisma = {
      loanApplication: { findUnique: findUniqueMock },
      auditLog: { findMany: auditFindManyMock, count: auditCountMock },
    } as unknown as PrismaService;

    const creditScore = {
      calculateByApplicationId: calculateByApplicationIdMock,
    } as unknown as CreditScoreService;

    service = new DashboardApprovalService(prisma, creditScore);
  });

  describe('getSummary', () => {
    it('maps application + personalGuarantee + insurance into a flat summary', async () => {
      const summary = await service.getSummary('app-1');
      expect(summary).toEqual({
        applicationId: 'app-1',
        applicationNumber: 'Unnati-2026-00001',
        status: 'SUBMITTED',
        dsgir: 30,
        loanToValueRatio: 55,
        ciclStatus: true,
        ciclRemarks: 'Clear',
        identityType: 'CITIZENSHIP',
        identityNumber: '123-456',
        citizenshipNumber: '123-456',
        riskGrade: 'A2',
        collateralText: 'Land at Ward 3',
        insuranceAttached: true,
      });
    });

    it('reports insuranceAttached: false and null CICL fields when relations are absent', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        personalGuarantee: null,
        insurance: null,
      });
      const summary = await service.getSummary('app-1');
      expect(summary.insuranceAttached).toBe(false);
      expect(summary.ciclStatus).toBeNull();
      expect(summary.ciclRemarks).toBeNull();
    });

    it('throws NotFoundException when the application does not exist', async () => {
      findUniqueMock.mockResolvedValueOnce(null);
      await expect(service.getSummary('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCreditScore', () => {
    it('verifies the application exists then delegates to CreditScoreService', async () => {
      const result = await service.getCreditScore('app-1');
      expect(findUniqueMock).toHaveBeenCalled();
      expect(calculateByApplicationIdMock).toHaveBeenCalledWith('app-1');
      expect(result).toEqual({ overall: { score: 80 } });
    });

    it('throws NotFoundException before calling CreditScoreService when missing', async () => {
      findUniqueMock.mockResolvedValueOnce(null);
      await expect(service.getCreditScore('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(calculateByApplicationIdMock).not.toHaveBeenCalled();
    });
  });

  describe('getNrbChecklist', () => {
    it('marks DSGIR/LTV/CICL/blacklist/insurance as tracked with derived booleans', async () => {
      const checklist = await service.getNrbChecklist('app-1');
      const byLabel = Object.fromEntries(
        checklist.items.map((i) => [i.label, i]),
      );

      expect(byLabel['DSGIR within NRB limit']).toEqual({
        label: 'DSGIR within NRB limit',
        tracked: true,
        value: true, // 30 <= 50
      });
      expect(byLabel['LTV within NRB cap']).toEqual({
        label: 'LTV within NRB cap',
        tracked: true,
        value: true, // 55 <= 60
      });
      expect(byLabel['CICL checked — no adverse'].value).toBe(true);
      expect(byLabel['Not blacklisted'].value).toBe(true);
      expect(byLabel['Insurance attached'].value).toBe(true);
    });

    it('marks PEP screening and NRB Rokka checks as untracked (no persisted field)', async () => {
      const checklist = await service.getNrbChecklist('app-1');
      const byLabel = Object.fromEntries(
        checklist.items.map((i) => [i.label, i]),
      );
      expect(byLabel['PEP screening']).toEqual({
        label: 'PEP screening',
        tracked: false,
        value: null,
      });
      expect(byLabel['NRB Rokka restriction check'].tracked).toBe(false);
    });

    it('marks DSGIR/LTV untracked with null value when not set on the application', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        dsgir: null,
        loanToValueRatio: null,
        isBlacklisted: null,
      });
      const checklist = await service.getNrbChecklist('app-1');
      const byLabel = Object.fromEntries(
        checklist.items.map((i) => [i.label, i]),
      );
      expect(byLabel['DSGIR within NRB limit']).toEqual({
        label: 'DSGIR within NRB limit',
        tracked: false,
        value: null,
      });
      expect(byLabel['Not blacklisted']).toEqual({
        label: 'Not blacklisted',
        tracked: false,
        value: null,
      });
    });
  });

  describe('getActivity', () => {
    it('paginates audit log entries scoped to the application', async () => {
      auditCountMock.mockResolvedValueOnce(3);
      const result = await service.getActivity('app-1', { page: 1, limit: 20 });

      expect(auditFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: { applicationId: 'app-1' } }),
      );
      expect(result.meta.total).toBe(3);
    });

    it('throws NotFoundException for a missing application before querying audit logs', async () => {
      findUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.getActivity('missing', { page: 1, limit: 20 }),
      ).rejects.toThrow(NotFoundException);
      expect(auditFindManyMock).not.toHaveBeenCalled();
    });
  });
});
