import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, AuditCategory } from '../../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
  PaginationDto,
} from '../../../common/dto/pagination.dto';
import {
  CreateDisbursementConditionDto,
  UpdateDisbursementConditionDto,
} from '../dto/disbursement-condition.dto';
import { ConfirmDisbursementDto } from '../dto/confirm-disbursement.dto';

@Injectable()
export class DashboardDisbursementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getPending(query: PaginationDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = {
      status: 'SUBMITTED' as const,
      approverDate: { not: null },
      OR: [
        { disbursement: null },
        { disbursement: { status: { not: 'COMPLETED' as const } } },
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where,
        take,
        skip,
        orderBy: { approverDate: 'desc' },
        select: {
          id: true,
          applicationNumber: true,
          fullName: true,
          creditLimit: true,
          disbursementConditions: {
            select: { status: true },
          },
          disbursement: { select: { status: true } },
          parentVerification: { select: { bankAccountNumber: true } },
        },
      }),
      this.prisma.loanApplication.count({ where }),
    ]);

    const rows = data.map((a) => {
      const total = a.disbursementConditions.length;
      const done = a.disbursementConditions.filter(
        (c) => c.status === 'DONE',
      ).length;
      return {
        applicationId: a.id,
        refNo: a.applicationNumber,
        borrower: a.fullName,
        amount: a.creditLimit,
        conditionsDone: done,
        conditionsTotal: total,
        status: a.disbursement?.status ?? 'PENDING',
        bankAccountReady: Boolean(a.parentVerification?.bankAccountNumber),
      };
    });

    return buildPaginatedResponse(
      rows,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  private async assertApplicationExists(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { parentVerification: { select: { bankAccountNumber: true } } },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async getConditions(applicationId: string) {
    await this.assertApplicationExists(applicationId);
    return this.prisma.disbursementCondition.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addCondition(
    userId: string,
    applicationId: string,
    dto: CreateDisbursementConditionDto,
  ) {
    await this.assertApplicationExists(applicationId);
    const condition = await this.prisma.disbursementCondition.create({
      data: { applicationId, label: dto.label },
    });
    await this.audit.log(
      userId,
      AuditAction.DISBURSEMENT_CONDITION_UPDATED,
      { conditionId: condition.id, action: 'created', label: dto.label },
      applicationId,
      AuditCategory.DISBURSEMENT,
    );
    return condition;
  }

  async updateCondition(
    userId: string,
    applicationId: string,
    conditionId: string,
    dto: UpdateDisbursementConditionDto,
  ) {
    const condition = await this.prisma.disbursementCondition.findUnique({
      where: { id: conditionId },
    });
    if (!condition || condition.applicationId !== applicationId) {
      throw new NotFoundException('Disbursement condition not found');
    }

    const updated = await this.prisma.disbursementCondition.update({
      where: { id: conditionId },
      data: {
        status: dto.status,
        remarks: dto.remarks,
        completedAt: dto.status === 'DONE' ? new Date() : null,
        completedByUserId: dto.status === 'DONE' ? userId : null,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.DISBURSEMENT_CONDITION_UPDATED,
      { conditionId, status: dto.status },
      applicationId,
      AuditCategory.DISBURSEMENT,
    );

    return updated;
  }

  async confirm(
    userId: string,
    applicationId: string,
    dto: ConfirmDisbursementDto,
  ) {
    const application = await this.assertApplicationExists(applicationId);
    if (!application.parentVerification?.bankAccountNumber) {
      throw new BadRequestException(
        'Parent bank account not set up — cannot disburse',
      );
    }

    const disbursement = await this.prisma.disbursement.upsert({
      where: { applicationId },
      create: {
        applicationId,
        status: 'PARTIAL',
        initiatedByUserId: userId,
        totalDisbursedAmount: dto.amount,
      },
      update: {
        status: 'PARTIAL',
        totalDisbursedAmount: { increment: dto.amount },
      },
    });

    const tranche = await this.prisma.disbursementTranche.create({
      data: {
        disbursementId: disbursement.id,
        trancheNumber: dto.trancheNumber,
        amount: dto.amount,
        accountCredited: dto.accountCredited,
        status: 'CREDITED',
        disbursedAt: dto.date ? new Date(dto.date) : new Date(),
        commissionAmount: dto.commissionAmount,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.DISBURSEMENT_TRANCHE_CREATED,
      { trancheId: tranche.id, amount: dto.amount },
      applicationId,
      AuditCategory.DISBURSEMENT,
    );
    await this.audit.log(
      userId,
      AuditAction.DISBURSEMENT_CONFIRMED,
      { disbursementId: disbursement.id, trancheNumber: dto.trancheNumber },
      applicationId,
      AuditCategory.DISBURSEMENT,
    );

    return { disbursement, tranche };
  }

  async getHistory(query: PaginationDto) {
    const { take, skip } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.disbursementTranche.findMany({
        take,
        skip,
        orderBy: { disbursedAt: 'desc' },
        include: {
          disbursement: {
            include: {
              application: {
                select: { id: true, applicationNumber: true, fullName: true },
              },
            },
          },
        },
      }),
      this.prisma.disbursementTranche.count(),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
