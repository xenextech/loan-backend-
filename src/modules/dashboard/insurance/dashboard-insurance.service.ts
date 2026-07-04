import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuditAction, AuditCategory } from '../../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../../common/dto/pagination.dto';
import { InsurancePolicyQueryDto } from '../dto/insurance-policy-query.dto';
import { CreateInsurancePolicyDto } from '../dto/create-insurance-policy.dto';

const EXPIRING_SOON_WINDOW_DAYS = 30;

@Injectable()
export class DashboardInsuranceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private computeStatus(expiryDate: Date, now = new Date()) {
    if (expiryDate < now) return 'EXPIRED';
    const soonThreshold = new Date(
      now.getTime() + EXPIRING_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );
    if (expiryDate <= soonThreshold) return 'EXPIRING_SOON';
    return 'ACTIVE';
  }

  async getStats() {
    const now = new Date();
    const soonThreshold = new Date(
      now.getTime() + EXPIRING_SOON_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );

    const [active, expiringSoon, expired, sums, loanTotal] = await Promise.all([
      this.prisma.insurancePolicy.count({
        where: { expiryDate: { gt: soonThreshold } },
      }),
      this.prisma.insurancePolicy.count({
        where: { expiryDate: { gte: now, lte: soonThreshold } },
      }),
      this.prisma.insurancePolicy.count({
        where: { expiryDate: { lt: now } },
      }),
      this.prisma.insurancePolicy.aggregate({ _sum: { sumInsured: true } }),
      this.prisma.loanApplication.aggregate({
        _sum: { creditLimit: true },
      }),
    ]);

    const totalSumInsured = Number(sums._sum.sumInsured ?? 0);
    const totalLoans = Number(loanTotal._sum.creditLimit ?? 0);
    const sumInsuredToLoanRatio =
      totalLoans > 0
        ? Number(((totalSumInsured / totalLoans) * 100).toFixed(1))
        : null;

    return {
      activeCount: active,
      expiringIn30DaysCount: expiringSoon,
      expiredCount: expired,
      sumInsuredToLoanRatio,
    };
  }

  async list(query: InsurancePolicyQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = query.applicationId
      ? { applicationId: query.applicationId }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.insurancePolicy.findMany({
        where,
        take,
        skip,
        orderBy: { expiryDate: 'asc' },
        include: {
          application: {
            select: { id: true, applicationNumber: true, fullName: true },
          },
        },
      }),
      this.prisma.insurancePolicy.count({ where }),
    ]);

    const rows = data.map((p) => ({
      ...p,
      status: this.computeStatus(p.expiryDate),
    }));

    return buildPaginatedResponse(
      rows,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  async getOne(id: string) {
    const policy = await this.prisma.insurancePolicy.findUnique({
      where: { id },
      include: {
        application: {
          select: { id: true, applicationNumber: true, fullName: true },
        },
      },
    });
    if (!policy) throw new NotFoundException('Insurance policy not found');
    return { ...policy, status: this.computeStatus(policy.expiryDate) };
  }

  async create(userId: string, dto: CreateInsurancePolicyDto) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: dto.applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');

    const policy = await this.prisma.insurancePolicy.create({
      data: {
        applicationId: dto.applicationId,
        policyNumber: dto.policyNumber,
        insurer: dto.insurer,
        policyType: dto.policyType,
        sumInsured: dto.sumInsured,
        premiumAmount: dto.premiumAmount,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        expiryDate: new Date(dto.expiryDate),
        addedByUserId: userId,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.INSURANCE_POLICY_ADDED,
      { policyNumber: policy.policyNumber },
      dto.applicationId,
      AuditCategory.SYSTEM,
    );

    return { ...policy, status: this.computeStatus(policy.expiryDate) };
  }
}
