import { NotFoundException } from '@nestjs/common';
import { DashboardNotificationsService } from './dashboard-notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  AuditAction,
  AuditCategory,
  NotificationChannel,
  NotificationDeliveryStatus,
} from '../../../common/enums';

describe('DashboardNotificationsService', () => {
  let notificationFindManyMock: jest.Mock;
  let notificationCountMock: jest.Mock;
  let templateFindManyMock: jest.Mock;
  let templateCountMock: jest.Mock;
  let templateCreateMock: jest.Mock;
  let templateUpdateMock: jest.Mock;
  let templateDeleteMock: jest.Mock;
  let templateFindUniqueMock: jest.Mock;
  let auditLogMock: jest.Mock;
  let service: DashboardNotificationsService;

  beforeEach(() => {
    notificationFindManyMock = jest.fn().mockResolvedValue([]);
    notificationCountMock = jest.fn().mockResolvedValue(0);
    templateFindManyMock = jest.fn().mockResolvedValue([]);
    templateCountMock = jest.fn().mockResolvedValue(0);
    templateCreateMock = jest.fn();
    templateUpdateMock = jest.fn();
    templateDeleteMock = jest.fn().mockResolvedValue(undefined);
    templateFindUniqueMock = jest.fn().mockResolvedValue({ id: 'tpl-1' });
    auditLogMock = jest.fn().mockResolvedValue(undefined);

    const prisma = {
      notification: {
        findMany: notificationFindManyMock,
        count: notificationCountMock,
      },
      notificationTemplate: {
        findMany: templateFindManyMock,
        count: templateCountMock,
        create: templateCreateMock,
        update: templateUpdateMock,
        delete: templateDeleteMock,
        findUnique: templateFindUniqueMock,
      },
    } as unknown as PrismaService;

    const audit = { log: auditLogMock } as unknown as AuditService;

    service = new DashboardNotificationsService(prisma, audit);
  });

  describe('getLog', () => {
    it('filters by channel, deliveryStatus, applicationId, and date range', async () => {
      await service.getLog({
        page: 1,
        limit: 20,
        channel: NotificationChannel.WHATSAPP,
        deliveryStatus: NotificationDeliveryStatus.DELIVERED,
        applicationId: 'app-1',
        dateFrom: '2026-06-01T00:00:00.000Z',
        dateTo: '2026-06-30T00:00:00.000Z',
      });

      expect(notificationFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            channel: NotificationChannel.WHATSAPP,
            deliveryStatus: NotificationDeliveryStatus.DELIVERED,
            applicationId: 'app-1',
            createdAt: {
              gte: new Date('2026-06-01T00:00:00.000Z'),
              lte: new Date('2026-06-30T00:00:00.000Z'),
            },
          },
        }),
      );
    });

    it('builds an empty where clause with no filters', async () => {
      await service.getLog({ page: 1, limit: 20 });
      expect(notificationFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('template CRUD', () => {
    it('creates a template and logs the action', async () => {
      templateCreateMock.mockResolvedValueOnce({ id: 'tpl-1' });
      const dto = {
        name: 'EMI due reminder',
        channel: NotificationChannel.SMS,
        body: 'Dear {name}, your EMI is due.',
      };

      await service.createTemplate('user-1', dto);

      expect(templateCreateMock).toHaveBeenCalledWith({ data: dto });
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.NOTIFICATION_TEMPLATE_UPDATED,
        { templateId: 'tpl-1', action: 'created' },
        undefined,
        AuditCategory.SYSTEM,
      );
    });

    it('throws NotFoundException when updating a template that does not exist', async () => {
      templateFindUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.updateTemplate('user-1', 'missing', { name: 'x' }),
      ).rejects.toThrow(NotFoundException);
      expect(templateUpdateMock).not.toHaveBeenCalled();
    });

    it('updates a template and logs the action', async () => {
      templateUpdateMock.mockResolvedValueOnce({ id: 'tpl-1' });
      await service.updateTemplate('user-1', 'tpl-1', { name: 'Updated' });
      expect(templateUpdateMock).toHaveBeenCalledWith({
        where: { id: 'tpl-1' },
        data: { name: 'Updated' },
      });
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.NOTIFICATION_TEMPLATE_UPDATED,
        { templateId: 'tpl-1', action: 'updated' },
        undefined,
        AuditCategory.SYSTEM,
      );
    });

    it('throws NotFoundException when deleting a template that does not exist', async () => {
      templateFindUniqueMock.mockResolvedValueOnce(null);
      await expect(service.deleteTemplate('user-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(templateDeleteMock).not.toHaveBeenCalled();
    });

    it('deletes a template and logs the action', async () => {
      const result = await service.deleteTemplate('user-1', 'tpl-1');
      expect(templateDeleteMock).toHaveBeenCalledWith({
        where: { id: 'tpl-1' },
      });
      expect(result).toEqual({ message: 'Notification template deleted' });
    });
  });
});
