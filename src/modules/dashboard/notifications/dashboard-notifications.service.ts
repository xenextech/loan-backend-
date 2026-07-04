import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, AuditCategory } from '../../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../../common/dto/pagination.dto';
import { NotificationLogQueryDto } from '../dto/notification-log-query.dto';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from '../dto/notification-template.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class DashboardNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getLog(query: NotificationLogQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where: Prisma.NotificationWhereInput = {};

    if (query.channel) where.channel = query.channel;
    if (query.deliveryStatus) where.deliveryStatus = query.deliveryStatus;
    if (query.applicationId) where.applicationId = query.applicationId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async listTemplates(query: PaginationDto) {
    const { take, skip } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.notificationTemplate.findMany({
        take,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notificationTemplate.count(),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async createTemplate(userId: string, dto: CreateNotificationTemplateDto) {
    const template = await this.prisma.notificationTemplate.create({
      data: dto,
    });
    await this.audit.log(
      userId,
      AuditAction.NOTIFICATION_TEMPLATE_UPDATED,
      { templateId: template.id, action: 'created' },
      undefined,
      AuditCategory.SYSTEM,
    );
    return template;
  }

  async updateTemplate(
    userId: string,
    id: string,
    dto: UpdateNotificationTemplateDto,
  ) {
    const existing = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Notification template not found');

    const template = await this.prisma.notificationTemplate.update({
      where: { id },
      data: dto,
    });
    await this.audit.log(
      userId,
      AuditAction.NOTIFICATION_TEMPLATE_UPDATED,
      { templateId: template.id, action: 'updated' },
      undefined,
      AuditCategory.SYSTEM,
    );
    return template;
  }

  async deleteTemplate(userId: string, id: string) {
    const existing = await this.prisma.notificationTemplate.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException('Notification template not found');

    await this.prisma.notificationTemplate.delete({ where: { id } });
    await this.audit.log(
      userId,
      AuditAction.NOTIFICATION_TEMPLATE_UPDATED,
      { templateId: id, action: 'deleted' },
      undefined,
      AuditCategory.SYSTEM,
    );
    return { message: 'Notification template deleted' };
  }
}
