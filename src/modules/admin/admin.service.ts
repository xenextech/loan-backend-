import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminQueryDto } from './dto/admin-query.dto';
import { ApplicationStatus } from '../../common/enums';
import { paginate, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: AdminQueryDto): Prisma.LoanApplicationWhereInput {
    const where: Prisma.LoanApplicationWhereInput = {
      status: ApplicationStatus.SUBMITTED,
    };

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phoneNumber: { contains: query.search } },
        { applicationNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.studyType) {
      where.studyInformation = { studyType: query.studyType };
    }

    if (query.loanAmountMin !== undefined || query.loanAmountMax !== undefined) {
      where.loanInformation = {
        ...(query.loanAmountMin !== undefined
          ? { loanAmount: { gte: query.loanAmountMin } }
          : {}),
        ...(query.loanAmountMax !== undefined
          ? { loanAmount: { lte: query.loanAmountMax } }
          : {}),
      };
    }

    if (query.submittedFrom || query.submittedTo) {
      where.submittedAt = {
        ...(query.submittedFrom ? { gte: new Date(query.submittedFrom) } : {}),
        ...(query.submittedTo ? { lte: new Date(query.submittedTo) } : {}),
      };
    }

    return where;
  }

  // ── List submitted applications ────────────────────────────────────────────
  async listApplications(query: AdminQueryDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = this.buildWhere(query);

    const allowedSortFields = ['submittedAt', 'createdAt', 'fullName', 'applicationNumber'];
    const sortBy = allowedSortFields.includes(query.sortBy ?? '') ? query.sortBy! : 'submittedAt';

    const [data, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where,
        take,
        skip,
        orderBy: { [sortBy]: query.sortOrder ?? 'desc' },
        include: {
          studyInformation: true,
          loanInformation: { select: { loanAmount: true, expectedSalary: true } },
          documents: { select: { id: true, documentType: true, publicUrl: true } },
        },
      }),
      this.prisma.loanApplication.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  // ── Get full application detail ────────────────────────────────────────────
  async getApplicationDetail(id: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        studyInformation: true,
        loanInformation: true,
        documents: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  // ── Export to CSV ──────────────────────────────────────────────────────────
  async exportCsv(query: AdminQueryDto): Promise<string> {
    const where = this.buildWhere(query);

    const applications = await this.prisma.loanApplication.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
        studyInformation: true,
        loanInformation: true,
      },
    });

    const header = [
      'Application Number',
      'Full Name',
      'Email',
      'Phone Number',
      'Study Type',
      'Course Name',
      'Board/University',
      'Loan Amount (NPR)',
      'Identity Type',
      'Province',
      'District',
      'Submitted At',
    ].join(',');

    const rows = applications.map((a) => {
      const fields = [
        a.applicationNumber,
        a.fullName ?? '',
        a.email ?? '',
        a.phoneNumber ?? '',
        a.studyInformation?.studyType ?? '',
        a.studyInformation?.courseName ?? '',
        a.studyInformation?.boardUniversity ?? '',
        a.loanInformation?.loanAmount?.toString() ?? '',
        a.identityType ?? '',
        a.province ?? '',
        a.district ?? '',
        a.submittedAt?.toISOString() ?? '',
      ].map((f) => `"${String(f).replace(/"/g, '""')}"`);

      return fields.join(',');
    });

    return [header, ...rows].join('\n');
  }

  // ── Dashboard stats ────────────────────────────────────────────────────────
  async getDashboardStats() {
    const [totalSubmitted, totalDraft, recentSubmissions] = await Promise.all([
      this.prisma.loanApplication.count({ where: { status: ApplicationStatus.SUBMITTED } }),
      this.prisma.loanApplication.count({ where: { status: 'DRAFT' } }),
      this.prisma.loanApplication.findMany({
        where: { status: ApplicationStatus.SUBMITTED },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          applicationNumber: true,
          fullName: true,
          submittedAt: true,
          loanInformation: { select: { loanAmount: true } },
        },
      }),
    ]);

    return { totalSubmitted, totalDraft, recentSubmissions };
  }
}
