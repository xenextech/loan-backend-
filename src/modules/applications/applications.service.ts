import * as crypto from 'crypto';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Step1Dto } from './dto/step1.dto';
import { Step2Dto } from './dto/step2.dto';
import { Step3Dto } from './dto/step3.dto';
import { Step4Dto } from './dto/step4.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import {
  ApplicationStatus,
  AuditAction,
  ApplicationLinkType,
  ApplicationSource,
} from '../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../common/dto/pagination.dto';
import { generateApplicationNumber } from '../../common/utils/application-number.util';
import {
  IDENTITY_DOCUMENT_TYPES,
  assertIdentityDocumentsComplete,
} from '../../common/utils/identity-document.util';
import {
  convertAdToBs,
  convertBsToAd,
  calculateAge,
} from '../../common/utils/bs-ad-date.util';

// 3-day token TTL — enough for college/parent to complete verification
const LINK_TTL_MS = 3 * 24 * 60 * 60 * 1000;

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  // ── Create draft application ───────────────────────────────────────────────
  async create(userId: string) {
    const application = await this.prisma.loanApplication.create({
      data: {
        userId,
        applicationNumber: generateApplicationNumber(),
        status: ApplicationStatus.DRAFT,
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_CREATED,
      {
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
      },
      application.id,
    );

    return application;
  }

  // ── Create a complete application in one shot (Initiator-sourced) ─────────
  // Reuses the exact same field shape (Step1/2/3Dto) and DOB-resolution logic
  // as the student's own step-by-step flow — the only differences are that
  // everything is supplied and persisted in a single call, `source` is
  // tagged, and `userId` (the student-owner FK) stays whatever the caller
  // passes, which is intentionally absent when the Initiator originates the
  // record. Called by ApplicationInitiatorService.createNewApplication() —
  // kept here, not duplicated there, since this is the one place that knows
  // how a LoanApplication + its StudyInformation/LoanInformation rows are
  // built from step-shaped form data.
  async createComplete(
    actorUserId: string,
    dto: Step1Dto & Step2Dto & Step3Dto,
    options: { ownerUserId?: string; source?: ApplicationSource } = {},
  ) {
    const { ownerUserId, source = ApplicationSource.STUDENT } = options;
    const {
      studyType,
      courseName,
      boardUniversity,
      courseDuration,
      loanAmount,
      expectedSalary,
      feeStructureMethod,
      feeStructureUrl,
      feeStructureText,
      dateOfBirth: legacyDobAd,
      dobAd,
      dobBs,
      issuedDate,
      ...personalFields
    } = dto;
    const resolvedDob = this.resolveDateOfBirth({
      dateOfBirth: legacyDobAd,
      dobAd,
      dobBs,
    });

    const application = await this.prisma.loanApplication.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...personalFields,
        userId: ownerUserId,
        applicationNumber: generateApplicationNumber(),
        status: ApplicationStatus.DRAFT,
        source,
        dateOfBirth: resolvedDob.dateOfBirth,
        dobBs: resolvedDob.dobBs,
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
        studyInformation: {
          create: { studyType, courseName, boardUniversity, courseDuration },
        },
        loanInformation: {
          create: {
            loanAmount,
            expectedSalary,
            feeStructureMethod,
            feeStructureUrl,
            feeStructureText,
          },
        },
      } as any,
      include: { studyInformation: true, loanInformation: true },
    });

    await this.audit.log(
      actorUserId,
      AuditAction.APPLICATION_CREATED,
      {
        applicationId: application.id,
        applicationNumber: application.applicationNumber,
        source,
      },
      application.id,
    );

    return this.withComputedDob(application);
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

    return buildPaginatedResponse(
      data.map((application) => this.withComputedDob(application)),
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
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

    return this.withComputedDob(application);
  }

  // Adds the AD-canonical `dobAd` alias, a backfilled `dobBs` (for rows saved
  // before this field existed), and a live-calculated `age` — derived on read
  // so it never goes stale, rather than stored.
  private withComputedDob<
    T extends { dateOfBirth: Date | null; dobBs: string | null },
  >(application: T): T & { dobAd: Date | null; age: number | null } {
    if (!application.dateOfBirth) {
      return { ...application, dobAd: null, age: null };
    }
    return {
      ...application,
      dobAd: application.dateOfBirth,
      dobBs: application.dobBs ?? convertAdToBs(application.dateOfBirth),
      age: calculateAge(application.dateOfBirth),
    };
  }

  // ── Assert draft & ownership ──────────────────────────────────────────────
  private async assertEditableByUser(id: string, userId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId)
      throw new ForbiddenException('Access denied');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException('Only draft applications can be edited');
    }
    return application;
  }

  // ── Step 1: Save about you ─────────────────────────────────────────────────
  async saveStep1(id: string, userId: string, dto: Step1Dto) {
    await this.assertEditableByUser(id, userId);

    const {
      studyType,
      courseName,
      boardUniversity,
      courseDuration,
      loanAmount,
      ...personalData
    } = dto;

    await this.prisma.$transaction([
      this.prisma.loanApplication.update({
        where: { id },
        data: personalData,
      }),
      this.prisma.studyInformation.upsert({
        where: { applicationId: id },
        create: {
          applicationId: id,
          studyType,
          courseName,
          boardUniversity,
          courseDuration,
        },
        update: { studyType, courseName, boardUniversity, courseDuration },
      }),
      this.prisma.loanInformation.upsert({
        where: { applicationId: id },
        create: { applicationId: id, loanAmount },
        update: { loanAmount },
      }),
    ]);

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_UPDATED,
      { step: 1 },
      id,
    );
    return this.findOne(id, userId, 'STUDENT');
  }

  // dobAd / legacy dateOfBirth / dobBs — any one may arrive; AD stays
  // canonical, BS is derived (or cross-checked, if both were supplied).
  // Shared by saveStep2 (student self-service) and createComplete
  // (Initiator one-shot creation) so the two never drift.
  private resolveDateOfBirth(dto: {
    dateOfBirth?: string;
    dobAd?: string;
    dobBs?: string;
  }): { dateOfBirth?: Date; dobBs?: string } {
    const adInput = dto.dobAd ?? dto.dateOfBirth;

    if (adInput && dto.dobBs) {
      const parsedAd = new Date(adInput);
      const derivedBs = convertAdToBs(parsedAd);
      if (derivedBs !== dto.dobBs) {
        throw new BadRequestException(
          'dobAd and dobBs do not refer to the same calendar date',
        );
      }
      return { dateOfBirth: parsedAd, dobBs: dto.dobBs };
    }
    if (adInput) {
      const dateOfBirth = new Date(adInput);
      return { dateOfBirth, dobBs: convertAdToBs(dateOfBirth) };
    }
    if (dto.dobBs) {
      return { dateOfBirth: convertBsToAd(dto.dobBs), dobBs: dto.dobBs };
    }
    return {};
  }

  // ── Step 2: Save identity & address ───────────────────────────────────────
  async saveStep2(id: string, userId: string, dto: Step2Dto) {
    await this.assertEditableByUser(id, userId);

    const { dateOfBirth: legacyDobAd, dobAd, dobBs, issuedDate, ...rest } = dto;
    const resolved = this.resolveDateOfBirth({
      dateOfBirth: legacyDobAd,
      dobAd,
      dobBs,
    });

    await this.prisma.loanApplication.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...rest,
        ...(resolved.dateOfBirth !== undefined && {
          dateOfBirth: resolved.dateOfBirth,
        }),
        ...(resolved.dobBs !== undefined && { dobBs: resolved.dobBs }),
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
      } as any,
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_UPDATED,
      { step: 2 },
      id,
    );
    return this.findOne(id, userId, 'STUDENT');
  }

  // ── Step 3: Save family & fee structure ───────────────────────────────────
  async saveStep3(id: string, userId: string, dto: Step3Dto) {
    await this.assertEditableByUser(id, userId);

    const {
      fatherName,
      motherName,
      grandfatherName,
      maritalStatus,
      spouseName,
      expectedSalary,
      feeStructureMethod,
      feeStructureUrl,
      feeStructureText,
    } = dto;

    await this.prisma.$transaction([
      this.prisma.loanApplication.update({
        where: { id },
        data: {
          fatherName,
          motherName,
          grandfatherName,
          maritalStatus,
          spouseName,
        },
      }),
      this.prisma.loanInformation.upsert({
        where: { applicationId: id },
        create: {
          applicationId: id,
          expectedSalary,
          feeStructureMethod,
          feeStructureUrl,
          feeStructureText,
        },
        update: {
          expectedSalary,
          feeStructureMethod,
          feeStructureUrl,
          feeStructureText,
        },
      }),
    ]);

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_UPDATED,
      { step: 3 },
      id,
    );
    return this.findOne(id, userId, 'STUDENT');
  }

  // ── Step 4: Submit declaration ────────────────────────────────────────────
  async submit(id: string, userId: string, dto: Step4Dto) {
    const application = await this.assertEditableByUser(id, userId);
    if (!application.applicationNumber) {
      throw new BadRequestException(
        'Application is missing an application number',
      );
    }

    if (!dto.informationAccurate || !dto.authorizeVerification) {
      throw new BadRequestException(
        'You must confirm both declaration fields to submit',
      );
    }

    const identityDocuments = await this.prisma.document.findMany({
      where: {
        applicationId: id,
        documentType: { in: IDENTITY_DOCUMENT_TYPES },
      },
      select: { documentType: true, mimeType: true },
    });
    assertIdentityDocumentsComplete(
      application.identityType,
      identityDocuments,
    );

    const expiresAt = new Date(Date.now() + LINK_TTL_MS);
    const parentToken = crypto.randomBytes(32).toString('hex');
    const collegeToken = crypto.randomBytes(32).toString('hex');

    // Persist application status change + both access tokens atomically
    const [updated] = await this.prisma.$transaction([
      this.prisma.loanApplication.update({
        where: { id },
        data: {
          informationAccurate: dto.informationAccurate,
          authorizeVerification: dto.authorizeVerification,
          status: ApplicationStatus.SUBMITTED,
          submittedAt: new Date(),
        },
        include: { studyInformation: true, loanInformation: true },
      }),
      this.prisma.applicationLink.create({
        data: {
          token: parentToken,
          applicationId: id,
          linkType: ApplicationLinkType.PARENT,
          expiresAt,
          recipientEmail: dto.parentContactEmail ?? null,
        },
      }),
      this.prisma.applicationLink.create({
        data: {
          token: collegeToken,
          applicationId: id,
          linkType: ApplicationLinkType.COLLEGE,
          expiresAt,
          recipientEmail: dto.collegeContactEmail ?? null,
        },
      }),
    ]);

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_SUBMITTED,
      {
        applicationNumber: application.applicationNumber,
      },
      id,
    );
    await this.audit.log(
      userId,
      AuditAction.APPLICATION_LINK_GENERATED,
      {
        applicationNumber: application.applicationNumber,
      },
      id,
    );

    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const parentLink = `${frontendUrl}/parent-verify/${parentToken}`;
    const collegeLink = `${frontendUrl}/college-verify/${collegeToken}`;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await this.notifications.notifyApplicationSubmitted(
        userId,
        application.applicationNumber,
        user.email,
        parentLink,
        collegeLink,
      );
    }

    // Email magic links directly to contacts if the student provided their addresses
    if (dto.parentContactEmail) {
      await this.notifications.sendParentVerificationLink(
        dto.parentContactEmail,
        application.applicationNumber,
        parentLink,
      );
    }
    if (dto.collegeContactEmail) {
      await this.notifications.sendCollegeVerificationLink(
        dto.collegeContactEmail,
        application.applicationNumber,
        collegeLink,
      );
    }

    return { ...updated, parentLink, collegeLink };
  }

  // ── Delete draft ───────────────────────────────────────────────────────────
  async deleteDraft(id: string, userId: string) {
    await this.assertEditableByUser(id, userId);
    await this.prisma.loanApplication.delete({ where: { id } });
    return { message: 'Draft application deleted' };
  }
}
