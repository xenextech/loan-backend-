import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditAction, AuditCategory } from '../../common/enums';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    userId: string,
    action: AuditAction,
    payload?: Record<string, unknown>,
    applicationId?: string,
    category: AuditCategory = AuditCategory.SYSTEM,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        applicationId,
        category,
        payload: payload as Prisma.InputJsonObject | undefined,
      },
    });
  }
}
