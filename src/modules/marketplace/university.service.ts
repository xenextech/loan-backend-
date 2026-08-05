import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../common/enums';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';

@Injectable()
export class UniversityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Student-facing GET /marketplace/universities defaults to active-only
  // (includeInactive undefined/false); the admin catalog view passes
  // includeInactive=true so a deactivated university can still be found
  // and reactivated instead of vanishing outright.
  async findAll(includeInactive = false) {
    const where: Prisma.UniversityWhereInput = includeInactive
      ? {}
      : { isActive: true };
    return this.prisma.university.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateUniversityDto, actorUserId: string) {
    const university = await this.prisma.university.create({ data: dto });
    await this.audit.log(
      actorUserId,
      AuditAction.MARKETPLACE_UNIVERSITY_CREATED,
      { universityId: university.id, name: university.name },
    );
    return university;
  }

  async update(id: string, dto: UpdateUniversityDto, actorUserId: string) {
    const existing = await this.prisma.university.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('University not found');

    const university = await this.prisma.university.update({
      where: { id },
      data: dto,
    });
    await this.audit.log(
      actorUserId,
      AuditAction.MARKETPLACE_UNIVERSITY_UPDATED,
      { universityId: id },
    );
    return university;
  }

  async remove(id: string, actorUserId: string) {
    const existing = await this.prisma.university.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('University not found');

    // Soft-delete only — College.universityId may reference this row.
    await this.prisma.university.update({
      where: { id },
      data: { isActive: false },
    });
    await this.audit.log(
      actorUserId,
      AuditAction.MARKETPLACE_UNIVERSITY_DELETED,
      { universityId: id },
    );
    return { message: 'University deactivated' };
  }
}
