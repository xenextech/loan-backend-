import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  paginate,
  buildPaginatedResponse,
} from '../../../common/dto/pagination.dto';
import { AuditQueryDto } from '../dto/audit-query.dto';
import { ManualAuditEntryDto } from '../dto/manual-audit-entry.dto';

@Injectable()
export class DashboardAuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private buildWhere(query: AuditQueryDto): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {};

    if (query.category) where.category = query.category;
    if (query.userId) where.userId = query.userId;
    if (query.applicationId) where.applicationId = query.applicationId;

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      };
    }

    return where;
  }

  async list(query: AuditQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = this.buildWhere(query);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async manualEntry(userId: string, dto: ManualAuditEntryDto) {
    return this.audit.log(
      userId,
      dto.action,
      { remarks: dto.remarks, ...dto.payload },
      dto.applicationId,
      dto.category,
    );
  }

  async exportCsv(query: AuditQueryDto): Promise<string> {
    const where = this.buildWhere(query);

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, role: true } } },
    });

    const header = [
      'Timestamp',
      'User',
      'Role',
      'Category',
      'Action',
      'Application ID',
      'Payload',
    ].join(',');

    const rows = logs.map((l) => {
      const fields = [
        l.createdAt.toISOString(),
        l.user?.email ?? '',
        l.user?.role ?? '',
        l.category,
        l.action,
        l.applicationId ?? '',
        l.payload ? JSON.stringify(l.payload) : '',
      ].map((f) => `"${String(f).replace(/"/g, '""')}"`);

      return fields.join(',');
    });

    return [header, ...rows].join('\n');
  }
}
