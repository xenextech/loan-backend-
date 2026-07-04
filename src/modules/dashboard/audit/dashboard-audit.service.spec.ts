import { DashboardAuditService } from './dashboard-audit.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, AuditCategory } from '../../../common/enums';

describe('DashboardAuditService', () => {
  let findManyMock: jest.Mock;
  let countMock: jest.Mock;
  let auditLogMock: jest.Mock;
  let service: DashboardAuditService;

  beforeEach(() => {
    findManyMock = jest.fn().mockResolvedValue([]);
    countMock = jest.fn().mockResolvedValue(0);
    auditLogMock = jest.fn().mockResolvedValue({ id: 'log-1' });

    const prisma = {
      auditLog: { findMany: findManyMock, count: countMock },
    } as unknown as PrismaService;
    const audit = { log: auditLogMock } as unknown as AuditService;

    service = new DashboardAuditService(prisma, audit);
  });

  describe('list', () => {
    it('builds an empty where clause when no filters are given', async () => {
      await service.list({ page: 1, limit: 20 });
      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('filters by category, userId, applicationId, and date range', async () => {
      await service.list({
        page: 1,
        limit: 20,
        category: AuditCategory.DISBURSEMENT,
        userId: 'user-1',
        applicationId: 'app-1',
        dateFrom: '2026-06-01T00:00:00.000Z',
        dateTo: '2026-06-30T00:00:00.000Z',
      });

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            category: AuditCategory.DISBURSEMENT,
            userId: 'user-1',
            applicationId: 'app-1',
            createdAt: {
              gte: new Date('2026-06-01T00:00:00.000Z'),
              lte: new Date('2026-06-30T00:00:00.000Z'),
            },
          },
        }),
      );
    });

    it('returns a paginated response shape', async () => {
      countMock.mockResolvedValueOnce(42);
      const result = await service.list({ page: 2, limit: 10 });
      expect(result.meta).toEqual({
        total: 42,
        page: 2,
        limit: 10,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('manualEntry', () => {
    it('delegates to AuditService.log with the entry category and merged payload', async () => {
      await service.manualEntry('user-1', {
        action: AuditAction.MANUAL_AUDIT_ENTRY,
        category: AuditCategory.SYSTEM,
        applicationId: 'app-1',
        remarks: 'manual note',
        payload: { foo: 'bar' },
      });

      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.MANUAL_AUDIT_ENTRY,
        { remarks: 'manual note', foo: 'bar' },
        'app-1',
        AuditCategory.SYSTEM,
      );
    });
  });

  describe('exportCsv', () => {
    it('produces a CSV with header and one row per log, quoting/escaping fields', async () => {
      findManyMock.mockResolvedValueOnce([
        {
          createdAt: new Date('2026-06-29T13:05:00.000Z'),
          user: { email: 'prem.napit@genzloan.com', role: 'APPROVER' },
          category: AuditCategory.APPROVAL,
          action: AuditAction.MANUAL_AUDIT_ENTRY,
          applicationId: 'app-1',
          payload: { note: 'has "quotes"' },
        },
      ]);

      const csv = await service.exportCsv({ page: 1, limit: 20 });
      const [header, row] = csv.split('\n');

      expect(header).toBe(
        'Timestamp,User,Role,Category,Action,Application ID,Payload',
      );
      expect(row).toContain('prem.napit@genzloan.com');
      // JSON.stringify escapes the inner quotes with backslashes, then CSV
      // quoting doubles every raw `"` — so the field-level `"` becomes `""`.
      expect(row).toContain('\\""quotes\\""');
    });

    it('handles a log entry with no linked user gracefully', async () => {
      findManyMock.mockResolvedValueOnce([
        {
          createdAt: new Date('2026-06-29T13:05:00.000Z'),
          user: null,
          category: AuditCategory.SYSTEM,
          action: AuditAction.MANUAL_AUDIT_ENTRY,
          applicationId: null,
          payload: null,
        },
      ]);

      const csv = await service.exportCsv({ page: 1, limit: 20 });
      expect(csv.split('\n')).toHaveLength(2);
    });
  });
});
