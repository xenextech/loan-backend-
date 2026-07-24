import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DashboardApprovalService } from './dashboard-approval.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreditScoreService } from '../../creditScore/credit-score.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';

describe('DashboardApprovalService', () => {
  let findUniqueMock: jest.Mock;
  let auditFindManyMock: jest.Mock;
  let auditCountMock: jest.Mock;
  let loanApplicationUpdateMock: jest.Mock;
  let userFindUniqueMock: jest.Mock;
  let calculateByApplicationIdMock: jest.Mock;
  let auditLogMock: jest.Mock;
  let notifyApplicationRejectedMock: jest.Mock;
  let service: DashboardApprovalService;

  const baseApplication = {
    id: 'app-1',
    applicationNumber: 'Unnati-2026-00001',
    status: 'SUBMITTED',
    stage: 'SENT_BACK',
    dsgir: 30,
    loanToValueRatio: 55,
    identityType: 'CITIZENSHIP',
    identityNumber: '123-456',
    citizenshipNumber: '123-456',
    riskGrade: 'A2',
    securityDetails: 'Land at Ward 3',
    isBlacklisted: false,
    sentBackByApprover: false,
    personalGuarantee: { ciclStatus: true, ciclRemarks: 'Clear' },
    insurance: { id: 'ins-1' },
  };

  beforeEach(() => {
    findUniqueMock = jest.fn().mockResolvedValue(baseApplication);
    auditFindManyMock = jest.fn().mockResolvedValue([]);
    auditCountMock = jest.fn().mockResolvedValue(0);
    loanApplicationUpdateMock = jest.fn().mockImplementation(({ data }) => ({
      ...baseApplication,
      ...data,
    }));
    userFindUniqueMock = jest.fn().mockResolvedValue({
      id: 'user-1',
      fullName: 'Test User',
      email: 'test@unnati.com',
      role: 'SUPPORTER',
    });
    calculateByApplicationIdMock = jest
      .fn()
      .mockResolvedValue({ overall: { score: 80 } });
    auditLogMock = jest.fn().mockResolvedValue(undefined);
    notifyApplicationRejectedMock = jest.fn().mockResolvedValue(undefined);

    const prisma = {
      loanApplication: {
        findUnique: findUniqueMock,
        update: loanApplicationUpdateMock,
      },
      auditLog: { findMany: auditFindManyMock, count: auditCountMock },
      user: { findUnique: userFindUniqueMock },
    } as unknown as PrismaService;

    const creditScore = {
      calculateByApplicationId: calculateByApplicationIdMock,
    } as unknown as CreditScoreService;

    const audit = { log: auditLogMock } as unknown as AuditService;
    const notifications = {
      notifyApplicationRejected: notifyApplicationRejectedMock,
    } as unknown as NotificationsService;
    const config = {} as unknown as ConfigService;

    service = new DashboardApprovalService(
      prisma,
      creditScore,
      audit,
      notifications,
      config,
    );
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
        approvals: {
          initiator: null,
          supporter: null,
          checker: null,
          approver: null,
          creditManager: null,
        },
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

    it('returns approver id/name/approvedAt per completed stage, and mirrors checker onto creditManager', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        supporterUserId: 'user-supporter',
        supporterName: 'Jane Smith',
        supporterDate: new Date('2026-01-02'),
        checkerUserId: 'user-checker',
        checkerName: 'Alex Rai',
        checkerDate: new Date('2026-01-03'),
      });
      const summary = await service.getSummary('app-1');

      expect(summary.approvals.initiator).toBeNull();
      expect(summary.approvals.supporter).toEqual({
        id: 'user-supporter',
        name: 'Jane Smith',
        approvedAt: new Date('2026-01-02'),
      });
      expect(summary.approvals.checker).toEqual({
        id: 'user-checker',
        name: 'Alex Rai',
        approvedAt: new Date('2026-01-03'),
      });
      expect(summary.approvals.creditManager).toEqual(
        summary.approvals.checker,
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

  describe('sendBack', () => {
    it('sets sentBackByApprover true only when the acting user is APPROVER', async () => {
      userFindUniqueMock.mockResolvedValueOnce({
        id: 'user-approver',
        fullName: 'Approver One',
        email: 'approver@unnati.com',
        role: 'APPROVER',
      });
      await service.sendBack('user-approver', 'app-1', {
        reason: 'Missing collateral doc',
        toStage: 'SUPPORTED',
      });
      const { data } = loanApplicationUpdateMock.mock.calls[0][0];
      expect(data.sentBackByApprover).toBe(true);
      expect(data.sentBackToStage).toBe('SUPPORTED');
    });

    it('sets sentBackByApprover false when a non-Approver role sends it back', async () => {
      // beforeEach's default actor role is SUPPORTER
      await service.sendBack('user-1', 'app-1', { reason: 'Needs rework' });
      const { data } = loanApplicationUpdateMock.mock.calls[0][0];
      expect(data.sentBackByApprover).toBe(false);
    });
  });

  describe('resubmit', () => {
    it('rejects when the application was not sent back to the Initiator', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        stage: 'SENT_BACK',
        sentBackToStage: 'CHECKING',
      });
      await expect(service.resubmit('user-1', 'app-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(loanApplicationUpdateMock).not.toHaveBeenCalled();
    });

    it('advances to SUPPORTED when no Approver shortcut is active', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        stage: 'SENT_BACK',
        sentBackToStage: 'INITIATED',
        sentBackByApprover: false,
      });
      await service.resubmit('user-1', 'app-1');
      const { data } = loanApplicationUpdateMock.mock.calls[0][0];
      expect(data.stage).toBe('SUPPORTED');
      expect(data.sentBackByApprover).toBeUndefined();
    });

    it('skips straight to CHECKING and consumes the shortcut when the Approver sent it back', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        stage: 'SENT_BACK',
        sentBackToStage: 'INITIATED',
        sentBackByApprover: true,
      });
      await service.resubmit('user-1', 'app-1');
      const { data } = loanApplicationUpdateMock.mock.calls[0][0];
      expect(data.stage).toBe('CHECKING');
      expect(data.sentBackByApprover).toBe(false);
    });
  });

  describe('support', () => {
    it('advances to SUPPORTED normally when no Approver shortcut is active', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        sentBackByApprover: false,
      });
      await service.support('user-1', 'app-1');
      const { data } = loanApplicationUpdateMock.mock.calls[0][0];
      expect(data.stage).toBe('SUPPORTED');
      expect(data.sentBackByApprover).toBeUndefined();
    });

    it('skips straight to CHECKING and consumes the shortcut when the Approver sent it back', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        sentBackByApprover: true,
      });
      await service.support('user-1', 'app-1');
      const { data } = loanApplicationUpdateMock.mock.calls[0][0];
      expect(data.stage).toBe('CHECKING');
      expect(data.sentBackByApprover).toBe(false);
    });
  });

  describe('check', () => {
    it('consumes the shortcut flag when the Approver sent it back, still landing on CHECKING', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        stage: 'SUPPORTED',
        sentBackByApprover: true,
      });
      await service.check('user-1', 'app-1');
      const { data } = loanApplicationUpdateMock.mock.calls[0][0];
      expect(data.stage).toBe('CHECKING');
      expect(data.sentBackByApprover).toBe(false);
    });

    it('does not touch sentBackByApprover when no shortcut is active', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...baseApplication,
        stage: 'SUPPORTED',
        sentBackByApprover: false,
      });
      await service.check('user-1', 'app-1');
      const { data } = loanApplicationUpdateMock.mock.calls[0][0];
      expect(data.stage).toBe('CHECKING');
      expect(data.sentBackByApprover).toBeUndefined();
    });
  });
});
