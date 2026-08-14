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
import { ApplicationStatus, AuditAction, ApplicationSource } from '../../common/enums';
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
        ...(ownerUserId !== undefined && { userId: ownerUserId }),
        applicationNumber: generateApplicationNumber(),
        status: ApplicationStatus.DRAFT,
        source,
        dateOfBirth: resolvedDob.dateOfBirth,
        dobBs: resolvedDob.dobBs,
        ...(issuedDate && { issuedDate: new Date(issuedDate) }),
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
      courseId,
      ...personalData
    } = dto;

    let resolvedCourseName = courseName;
    let resolvedBoardUniversity = boardUniversity;
    let resolvedCourseDuration = courseDuration;
    let resolvedCollegeName = personalData.collegeName;
    let tuitionFee: number | undefined;

    // College Marketplace anti-tamper boundary: when a courseId is present,
    // re-derive every display string from the catalog instead of trusting the
    // client-supplied text — a student editing collegeName/courseName in
    // devtools while keeping a valid courseId gets overwritten here.
    if (courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: { college: { include: { university: true } } },
      });
      if (!course || !course.isActive || !course.college.isActive) {
        throw new BadRequestException('Selected course is unavailable');
      }
      if (
        personalData.collegeId &&
        course.collegeId !== personalData.collegeId
      ) {
        throw new BadRequestException(
          'Course does not belong to the selected college',
        );
      }
      personalData.collegeId = course.collegeId;
      resolvedCollegeName = course.college.name;
      resolvedCourseName = course.name;
      resolvedBoardUniversity =
        course.college.university?.name ?? resolvedBoardUniversity;
      resolvedCourseDuration = course.duration;
      tuitionFee = Number(course.tuitionFee);
    }

    await this.prisma.$transaction([
      this.prisma.loanApplication.update({
        where: { id },
        data: { ...personalData, collegeName: resolvedCollegeName },
      }),
      this.prisma.studyInformation.upsert({
        where: { applicationId: id },
        create: {
          applicationId: id,
          studyType,
          courseName: resolvedCourseName,
          boardUniversity: resolvedBoardUniversity,
          courseDuration: resolvedCourseDuration,
          courseId,
          tuitionFee,
        },
        update: {
          studyType,
          courseName: resolvedCourseName,
          boardUniversity: resolvedBoardUniversity,
          courseDuration: resolvedCourseDuration,
          courseId,
          tuitionFee,
        },
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

    // Parent/college verification invitations are handled separately by
    // VerificationInvitationService — sent independently from Step 4 (each
    // recipient gets its own secure token, never generated or exposed here).
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

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_SUBMITTED,
      {
        applicationNumber: application.applicationNumber,
      },
      id,
    );

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

  // ── Student consent (Approver-authored terms, consented to from the
  // student's own logged-in dashboard — no anonymous link involved) ─────────
  private async assertOwnedByUser(id: string, userId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return application;
  }

  async getMyConsent(id: string, userId: string) {
    await this.assertOwnedByUser(id, userId);
    return this.prisma.studentConsent.findUnique({
      where: { applicationId: id },
    });
  }

  async acceptMyConsent(id: string, userId: string, ip?: string) {
    const application = await this.assertOwnedByUser(id, userId);

    const existing = await this.prisma.studentConsent.findUnique({
      where: { applicationId: id },
    });
    if (!existing) {
      throw new NotFoundException(
        'No terms & conditions have been sent for this application yet.',
      );
    }

    const consent = await this.prisma.studentConsent.update({
      where: { applicationId: id },
      data: { consentedAt: new Date(), consentedIp: ip ?? null },
    });

    await this.audit.log(
      userId,
      AuditAction.STUDENT_CONSENT_ACCEPTED,
      { applicationNumber: application.applicationNumber },
      id,
    );

    return consent;
  }
}
