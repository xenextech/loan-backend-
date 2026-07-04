import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreditScoreService } from '../../creditScore/credit-score.service';
import {
  paginate,
  buildPaginatedResponse,
} from '../../../common/dto/pagination.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class DashboardApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly creditScore: CreditScoreService,
  ) {}

  private async getApplicationOrThrow(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { personalGuarantee: true, insurance: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async getSummary(applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);

    return {
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      status: application.status,
      dsgir: application.dsgir,
      loanToValueRatio: application.loanToValueRatio,
      ciclStatus: application.personalGuarantee?.ciclStatus ?? null,
      ciclRemarks: application.personalGuarantee?.ciclRemarks ?? null,
      identityType: application.identityType,
      identityNumber: application.identityNumber,
      citizenshipNumber: application.citizenshipNumber,
      riskGrade: application.riskGrade,
      collateralText: application.securityDetails,
      insuranceAttached: Boolean(application.insurance),
    };
  }

  async getCreditScore(applicationId: string) {
    await this.getApplicationOrThrow(applicationId);
    return this.creditScore.calculateByApplicationId(applicationId);
  }

  async getNrbChecklist(applicationId: string) {
    const application = await this.getApplicationOrThrow(applicationId);

    // Derived, best-effort checklist — only items backed by real persisted
    // fields are booleans; everything else is explicitly marked "not tracked"
    // since there's no workflow/compliance-checklist model in this pass.
    return {
      applicationId: application.id,
      items: [
        {
          label: 'DSGIR within NRB limit',
          tracked: application.dsgir !== null,
          value: application.dsgir !== null ? application.dsgir <= 50 : null,
        },
        {
          label: 'LTV within NRB cap',
          tracked: application.loanToValueRatio !== null,
          value:
            application.loanToValueRatio !== null
              ? Number(application.loanToValueRatio) <= 60
              : null,
        },
        {
          label: 'CICL checked — no adverse',
          tracked: application.personalGuarantee?.ciclStatus !== undefined,
          value: application.personalGuarantee?.ciclStatus ?? null,
        },
        {
          label: 'Not blacklisted',
          tracked: application.isBlacklisted !== null,
          value:
            application.isBlacklisted !== null
              ? !application.isBlacklisted
              : null,
        },
        {
          label: 'Insurance attached',
          tracked: true,
          value: Boolean(application.insurance),
        },
        {
          label: 'PEP screening',
          tracked: false,
          value: null,
        },
        {
          label: 'NRB Rokka restriction check',
          tracked: false,
          value: null,
        },
      ],
    };
  }

  async getActivity(applicationId: string, query: PaginationDto) {
    await this.getApplicationOrThrow(applicationId);
    const { take, skip } = paginate(query.page, query.limit);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { applicationId },
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where: { applicationId } }),
    ]);

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
