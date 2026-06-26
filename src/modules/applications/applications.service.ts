import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Step1Dto } from './dto/step1.dto';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { ApplicationStatus, AuditAction } from '../../common/enums';
import { paginate, buildPaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  private generateApplicationNumber(): string {
    const prefix = 'CLIQ';
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${year}-${random}`;
  }

  // ── Create draft application ───────────────────────────────────────────────
  async create(userId: string) {
    const application = await this.prisma.loanApplication.create({
      data: {
        userId,
        applicationNumber: this.generateApplicationNumber(),
        status: ApplicationStatus.DRAFT,
      },
    });

    await this.audit.log(userId, AuditAction.APPLICATION_CREATED, {
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
    }, application.id);

    return application;
  }

  // ── List student's own applications ───────────────────────────────────────
  async findMyApplications(userId: string, query: QueryApplicationDto) {
    const { take, skip } = paginate(query.page, query.limit);

    const where = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where,
        take,
        skip,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
        include: {
          studyInformation: true,
          loanInformation: { select: { loanAmount: true } },
          documents: { select: { id: true, documentType: true } },
        },
      }),
      this.prisma.loanApplication.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query.page ?? 1, query.limit ?? 20);
  }

  // ── Get one application (ownership check) ─────────────────────────────────
  async findOne(id: string, userId: string, role: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
      include: {
        studyInformation: true,
        loanInformation: true,
        documents: true,
      },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (role !== 'ADMIN' && application.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return application;
  }

  // ── Assert draft & ownership ──────────────────────────────────────────────
  private async assertEditableByUser(id: string, userId: string) {
    const application = await this.prisma.loanApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) throw new ForbiddenException('Access denied');
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException('Only draft applications can be edited');
    }
    return application;
  }

  // ── Step 1: Save about you ─────────────────────────────────────────────────
  async saveStep1(id: string, userId: string, dto: Step1Dto) {
    await this.assertEditableByUser(id, userId);

    const { studyType, courseName, boardUniversity, courseDuration, loanAmount, ...personalData } = dto;

    await this.prisma.$transaction([
      this.prisma.loanApplication.update({
        where: { id },
        data: personalData,
      }),
      this.prisma.studyInformation.upsert({
        where: { applicationId: id },
        create: { applicationId: id, studyType, courseName, boardUniversity, courseDuration },
        update: { studyType, courseName, boardUniversity, courseDuration },
      }),
      this.prisma.loanInformation.upsert({
        where: { applicationId: id },
        create: { applicationId: id, loanAmount },
        update: { loanAmount },
      }),
    ]);

    await this.audit.log(userId, AuditAction.APPLICATION_UPDATED, { step: 1 }, id);
    return this.findOne(id, userId, 'STUDENT');
  }

  // ── Step 2: Save identity & address ───────────────────────────────────────
  async saveStep2(id: string, userId: string, dto: Step2Dto) {
    await this.assertEditableByUser(id, userId);

    await this.prisma.loanApplication.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        issuedDate: dto.issuedDate ? new Date(dto.issuedDate) : undefined,
      },
    });

    await this.audit.log(userId, AuditAction.APPLICATION_UPDATED, { step: 2 }, id);
    return this.findOne(id, userId, 'STUDENT');
  }

  // ── Step 3: Save family & fee structure ───────────────────────────────────
  async saveStep3(id: string, userId: string, dto: Step3Dto) {
    await this.assertEditableByUser(id, userId);

    const {
      fatherName, motherName, grandfatherName, maritalStatus, spouseName,
      expectedSalary, feeStructureMethod, feeStructureUrl, feeStructureText,
    } = dto;

    await this.prisma.$transaction([
      this.prisma.loanApplication.update({
        where: { id },
        data: { fatherName, motherName, grandfatherName, maritalStatus, spouseName },
      }),
      this.prisma.loanInformation.upsert({
        where: { applicationId: id },
        create: { applicationId: id, expectedSalary, feeStructureMethod, feeStructureUrl, feeStructureText },
        update: { expectedSalary, feeStructureMethod, feeStructureUrl, feeStructureText },
      }),
    ]);

    await this.audit.log(userId, AuditAction.APPLICATION_UPDATED, { step: 3 }, id);
    return this.findOne(id, userId, 'STUDENT');
  }

  // ── Step 4: Submit declaration ────────────────────────────────────────────
  async submit(id: string, userId: string, dto: Step4Dto) {
    const application = await this.assertEditableByUser(id, userId);

    if (!dto.informationAccurate || !dto.authorizeVerification) {
      throw new BadRequestException('You must confirm both declaration fields to submit');
    }

    const updated = await this.prisma.loanApplication.update({
      where: { id },
      data: {
        informationAccurate: dto.informationAccurate,
        authorizeVerification: dto.authorizeVerification,
        status: ApplicationStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: { studyInformation: true, loanInformation: true },
    });

    await this.audit.log(userId, AuditAction.APPLICATION_SUBMITTED, {
      applicationNumber: application.applicationNumber,
    }, id);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.notifications.notifyApplicationSubmitted(
        userId,
        application.applicationNumber,
        user.email,
      );
    }

    return updated;
  }

  // ── Delete draft ───────────────────────────────────────────────────────────
  async deleteDraft(id: string, userId: string) {
    await this.assertEditableByUser(id, userId);
    await this.prisma.loanApplication.delete({ where: { id } });
    return { message: 'Draft application deleted' };
  }
}
