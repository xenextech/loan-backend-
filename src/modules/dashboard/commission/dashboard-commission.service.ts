import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import {
  AuditAction,
  AuditCategory,
  CommissionPartnerType,
  NRB_DIGITAL_LENDING_CAP,
} from '../../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
  PaginationDto,
} from '../../../common/dto/pagination.dto';
import {
  CreateCommissionPartnerDto,
  UpdateCommissionPartnerDto,
  CommissionPartnerQueryDto,
  CreateCommissionEntryDto,
  UpdateCommissionEntryDto,
  CommissionEntryQueryDto,
} from '../dto/commission.dto';

@Injectable()
export class DashboardCommissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getSummary() {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const yearEnd = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

    const entries = await this.prisma.commissionEntry.findMany({
      where: { month: { gte: yearStart, lte: yearEnd } },
      include: { partner: { select: { partnerType: true } } },
    });

    const totalEarned = entries.reduce((sum, e) => sum + Number(e.amount), 0);
    const fromBanks = entries
      .filter((e) => e.partner.partnerType === CommissionPartnerType.BANK)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const fromColleges = entries
      .filter((e) => e.partner.partnerType === CommissionPartnerType.COLLEGE)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const pendingPayment = entries
      .filter((e) => e.status !== 'PAID')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return { totalEarned, fromBanks, fromColleges, pendingPayment };
  }

  private async getByPartnerType(
    partnerType: CommissionPartnerType,
    query: PaginationDto,
  ) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = { partnerType };

    const [partners, total] = await Promise.all([
      this.prisma.commissionPartner.findMany({
        where,
        take,
        skip,
        orderBy: { name: 'asc' },
        include: {
          entries: { select: { amount: true, applicationId: true } },
        },
      }),
      this.prisma.commissionPartner.count({ where }),
    ]);

    const rows = partners.map((p) => ({
      id: p.id,
      name: p.name,
      rateType: p.rateType,
      rateValue: p.rateValue,
      mouReference: p.mouReference,
      isActive: p.isActive,
      loans: new Set(p.entries.map((e) => e.applicationId).filter(Boolean))
        .size,
      totalEarned: p.entries.reduce((sum, e) => sum + Number(e.amount), 0),
    }));

    return buildPaginatedResponse(
      rows,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  getByBank(query: PaginationDto) {
    return this.getByPartnerType(CommissionPartnerType.BANK, query);
  }

  getByCollege(query: PaginationDto) {
    return this.getByPartnerType(CommissionPartnerType.COLLEGE, query);
  }

  async getNrbCapCompliance(query: PaginationDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = { creditLimit: { not: null } };

    const [data, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where,
        take,
        skip,
        orderBy: { creditLimit: 'desc' },
        select: {
          id: true,
          applicationNumber: true,
          fullName: true,
          creditLimit: true,
        },
      }),
      this.prisma.loanApplication.count({ where }),
    ]);

    const rows = data.map((a) => {
      const creditLimit = Number(a.creditLimit ?? 0);
      const utilizationPercent = Number(
        ((creditLimit / NRB_DIGITAL_LENDING_CAP) * 100).toFixed(1),
      );
      return {
        applicationId: a.id,
        refNo: a.applicationNumber,
        borrower: a.fullName,
        creditLimit,
        nrbCapAmount: NRB_DIGITAL_LENDING_CAP,
        utilizationPercent,
        compliant: creditLimit <= NRB_DIGITAL_LENDING_CAP,
      };
    });

    return buildPaginatedResponse(
      rows,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async listPartners(query: CommissionPartnerQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = query.partnerType ? { partnerType: query.partnerType } : {};

    const [data, total] = await Promise.all([
      this.prisma.commissionPartner.findMany({
        where,
        take,
        skip,
        orderBy: { name: 'asc' },
      }),
      this.prisma.commissionPartner.count({ where }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async createPartner(userId: string, dto: CreateCommissionPartnerDto) {
    const partner = await this.prisma.commissionPartner.create({ data: dto });
    await this.audit.log(
      userId,
      AuditAction.COMMISSION_PARTNER_UPDATED,
      { partnerId: partner.id, action: 'created' },
      undefined,
      AuditCategory.COMMISSION,
    );
    return partner;
  }

  async updatePartner(
    userId: string,
    id: string,
    dto: UpdateCommissionPartnerDto,
  ) {
    const existing = await this.prisma.commissionPartner.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Commission partner not found');

    const partner = await this.prisma.commissionPartner.update({
      where: { id },
      data: dto,
    });
    await this.audit.log(
      userId,
      AuditAction.COMMISSION_PARTNER_UPDATED,
      { partnerId: id, action: 'updated' },
      undefined,
      AuditCategory.COMMISSION,
    );
    return partner;
  }

  async listEntries(query: CommissionEntryQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = {
      ...(query.partnerId ? { partnerId: query.partnerId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.commissionEntry.findMany({
        where,
        take,
        skip,
        orderBy: { month: 'desc' },
        include: { partner: { select: { name: true, partnerType: true } } },
      }),
      this.prisma.commissionEntry.count({ where }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async createEntry(userId: string, dto: CreateCommissionEntryDto) {
    const partner = await this.prisma.commissionPartner.findUnique({
      where: { id: dto.partnerId },
    });
    if (!partner) throw new NotFoundException('Commission partner not found');

    const entry = await this.prisma.commissionEntry.create({
      data: {
        applicationId: dto.applicationId,
        partnerId: dto.partnerId,
        amount: dto.amount,
        month: new Date(dto.month),
        invoiceRef: dto.invoiceRef,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.COMMISSION_ENTRY_CREATED,
      { entryId: entry.id, amount: dto.amount },
      dto.applicationId,
      AuditCategory.COMMISSION,
    );

    return entry;
  }

  async updateEntry(userId: string, id: string, dto: UpdateCommissionEntryDto) {
    const existing = await this.prisma.commissionEntry.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Commission entry not found');

    const entry = await this.prisma.commissionEntry.update({
      where: { id },
      data: {
        status: dto.status,
        invoiceRef: dto.invoiceRef,
        paidAt: dto.status === 'PAID' ? new Date() : existing.paidAt,
      },
    });

    if (dto.status === 'PAID') {
      await this.audit.log(
        userId,
        AuditAction.COMMISSION_ENTRY_PAID,
        { entryId: id },
        existing.applicationId ?? undefined,
        AuditCategory.COMMISSION,
      );
    }

    return entry;
  }
}
