import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ApplicationsService } from '../applications/applications.service';
import {
  AuditAction,
  ApplicationSource,
  ApplicationStatus,
  BlacklistStatus,
} from '../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../common/dto/pagination.dto';
import { CreateInitiatorApplicationDto } from './dto/create-initiator-application.dto';
import {
  ApprovalChainDto,
  UpdateInitiatorApplicationDto,
} from './dto/update-initiator-application.dto';
import { CreateInitiatorNewApplicationDto } from './dto/create-initiator-new-application.dto';
import { QueryCollegeVerifiedDto } from './dto/query-college-verified.dto';

@Injectable()
export class ApplicationInitiatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  private async assertApplicationExists(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  // Validates the blacklist section against the *merged* state (existing DB
  // row + this request's changes), not just the incoming payload — so a
  // partial update in a later step can't leave the record inconsistent even
  // if it doesn't repeat blacklistStatus. Reusable shape for any future
  // "status gates a group of dependent fields" rule: resolve the effective
  // value of every field in the group, then validate the merged result once.
  private resolveBlacklistUpdate(
    existing: {
      blacklistStatus: BlacklistStatus | null;
      blacklistReason: string | null;
      blacklistDate: Date | null;
      blacklistReferenceNumber: string | null;
    },
    dto: {
      blacklistStatus?: BlacklistStatus;
      blacklistReason?: string;
      blacklistDate?: string;
      blacklistReferenceNumber?: string;
    },
  ) {
    const hasStatus = dto.blacklistStatus !== undefined;
    const hasReason = dto.blacklistReason !== undefined;
    const hasDate = dto.blacklistDate !== undefined;
    const hasReferenceNumber = dto.blacklistReferenceNumber !== undefined;

    // Nothing blacklist-related in this request — leave the section untouched
    // and skip re-validating rows this request doesn't concern itself with.
    if (!hasStatus && !hasReason && !hasDate && !hasReferenceNumber) {
      return {};
    }

    const effectiveStatus = hasStatus
      ? dto.blacklistStatus
      : existing.blacklistStatus;
    const effectiveReason = hasReason
      ? (dto.blacklistReason ?? '') || null
      : existing.blacklistReason;
    const effectiveDate = hasDate
      ? dto.blacklistDate
        ? new Date(dto.blacklistDate)
        : null
      : existing.blacklistDate;
    const effectiveReferenceNumber = hasReferenceNumber
      ? (dto.blacklistReferenceNumber ?? '') || null
      : existing.blacklistReferenceNumber;

    if (effectiveStatus === BlacklistStatus.NOT_BLACKLISTED) {
      if (effectiveReason || effectiveDate || effectiveReferenceNumber) {
        throw new BadRequestException(
          'Blacklist details cannot be provided when blacklist status is NOT_BLACKLISTED.',
        );
      }
    } else if (effectiveStatus === BlacklistStatus.BLACKLISTED) {
      if (!effectiveReason) {
        throw new BadRequestException(
          'Blacklist reason is required when blacklist status is BLACKLISTED.',
        );
      }
      if (!effectiveDate) {
        throw new BadRequestException(
          'Blacklist date is required when blacklist status is BLACKLISTED.',
        );
      }
      if (!effectiveReferenceNumber) {
        throw new BadRequestException(
          'Blacklist reference number is required when blacklist status is BLACKLISTED.',
        );
      }
    }

    return {
      ...(hasStatus && { blacklistStatus: dto.blacklistStatus }),
      ...(hasReason && { blacklistReason: effectiveReason }),
      ...(hasDate && { blacklistDate: effectiveDate }),
      ...(hasReferenceNumber && {
        blacklistReferenceNumber: effectiveReferenceNumber,
      }),
    };
  }

  // Flattens the Step 9 approval chain's nested { initiator, support, checker,
  // approver } shape onto LoanApplication's per-role columns (initiatorName/
  // initiatorPost/..., supporterName/..., etc. — see schema.prisma's
  // "Approval Section"). Only the Initiator's entry carries branchName —
  // written to the application's single top-level `branch` field, since that
  // column represents the application's branch as a whole, not one role's.
  private buildApprovalUpdate(approval?: ApprovalChainDto) {
    if (!approval) return {};
    const { initiator, support, checker, approver } = approval;

    const entryFields = (
      entry: (typeof approval)['support'],
      prefix: 'initiator' | 'supporter' | 'checker' | 'approver',
    ) => {
      if (!entry) return {};
      return {
        ...(entry.approverName !== undefined && {
          [`${prefix}Name`]: entry.approverName,
        }),
        ...(entry.status !== undefined && {
          [`${prefix}Status`]: entry.status,
        }),
        ...(entry.approvedDate !== undefined && {
          [`${prefix}Date`]: entry.approvedDate
            ? new Date(entry.approvedDate)
            : null,
        }),
        ...(entry.remarks !== undefined && {
          [`${prefix}Remarks`]: entry.remarks,
        }),
        ...(entry.signature !== undefined && {
          [`${prefix}Signature`]: entry.signature,
        }),
      };
    };

    return {
      ...entryFields(initiator, 'initiator'),
      ...(initiator?.designation !== undefined && {
        initiatorPost: initiator.designation,
      }),
      ...(initiator?.branchName !== undefined && {
        branch: initiator.branchName,
      }),
      ...entryFields(support, 'supporter'),
      ...entryFields(checker, 'checker'),
      ...entryFields(approver, 'approver'),
    };
  }

  // ── Combined initiator sections, merged directly onto LoanApplication ──────

  async getInitiatorApplication(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        studyInformation: true,
        loanInformation: true,
        documents: true,
        familyMember: true,
        existingFacility: true,
        personalGuarantee: true,
        insurance: true,
        repaymentCapacity: true,
        collegeVerification: true,
        // Includes the parent's NID/PAN/salary-sheet uploads (ParentDocument,
        // supports multiple labeled files) alongside the verification form
        // itself — the legacy salarySheetPublicUrl only ever covered one file.
        parentVerification: { include: { documents: true } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async getInitiatorApplicationOverview(applicationId: string) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        applicationNumber: true,
        status: true,
        source: true,

        // Step 1: Personal Information
        fullName: true,
        email: true,
        phoneNumber: true,

        // Step 2: Identity
        identityType: true,
        identityNumber: true,
        identityName: true,
        dateOfBirth: true,
        gender: true,
        occupation: true,
        issuedDistrict: true,
        issuedDate: true,

        // Step 2: Address
        province: true,
        district: true,
        municipality: true,
        ward: true,
        permanentAddress: true,
        correspondenceAddress: true,

        // Step 3: Family
        fatherName: true,
        motherName: true,
        grandfatherName: true,
        maritalStatus: true,
        spouseName: true,

        collegeVerification: true,
        parentVerification: true,
      },
    });
    if (!application) throw new NotFoundException('Application not found');

    const { collegeVerification, parentVerification, ...student } = application;
    return {
      student,
      collegeVerification,
      parentProfile: parentVerification,
    };
  }

  async getCollegeVerifiedApplications(query: QueryCollegeVerifiedDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = { isApplicationVerified: true };

    const [verifications, total] = await Promise.all([
      this.prisma.collegeVerification.findMany({
        where,
        take,
        skip,
        orderBy: { submittedAt: 'desc' },
        include: {
          application: {
            select: {
              id: true,
              applicationNumber: true,
              status: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.collegeVerification.count({ where }),
    ]);

    const data = verifications.map(
      ({ application, ...collegeVerification }) => ({
        applicationId: collegeVerification.applicationId,
        student: application,
        collegeVerification,
      }),
    );

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  // The Initiator's unified work queue — everything ready for the Initiator
  // to act on, regardless of how it arrived: college-verified student
  // applications (existing flow, unchanged) plus Initiator-sourced
  // applications, which are ready the instant they're created since they
  // never wait on a college or student step. Deliberately a *new*, additive
  // endpoint rather than broadening getCollegeVerifiedApplications() above —
  // that one's name and response shape (always a non-null collegeVerification)
  // are a real contract existing callers rely on; this one's shape says
  // upfront that collegeVerification can be null.
  async getInitiatorQueue(query: QueryCollegeVerifiedDto) {
    const { take, skip } = paginate(query.page, query.limit);
    const where = {
      OR: [
        { collegeVerification: { isApplicationVerified: true } },
        { source: ApplicationSource.INITIATOR },
      ],
    };

    const [applications, total] = await Promise.all([
      this.prisma.loanApplication.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          applicationNumber: true,
          status: true,
          source: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          createdAt: true,
          user: { select: { id: true, email: true, role: true } },
          studyInformation: { select: { courseName: true, studyType: true } },
          loanInformation: { select: { loanAmount: true } },
          collegeVerification: true,
        },
      }),
      this.prisma.loanApplication.count({ where }),
    ]);

    const data = applications.map(({ collegeVerification, ...student }) => ({
      applicationId: student.id,
      source: student.source,
      student,
      collegeVerification,
    }));

    return buildPaginatedResponse(
      data,
      total,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  // Sets initiator information on an application that already exists (e.g.
  // one created by a student, or via `createNewApplication` below). This is
  // the Initiator's one-time finalization of their section, so it also
  // stamps who did it and when — from the authenticated user, never the
  // request body — for the approval-history trail (see
  // DashboardApprovalService.getSummary()).
  async createInitiatorApplication(
    applicationId: string,
    userId: string,
    dto: CreateInitiatorApplicationDto,
  ) {
    const application = await this.assertApplicationExists(applicationId);
    // Existence is judged by `initiatorUserId`, not a business field like
    // `relationshipStartDate` — that field is optional here (an Initiator can
    // legitimately leave it blank) and, critically, is also writable through
    // `updateInitiatorApplication()` (PATCH), which has no create-vs-update
    // gate of its own. If a PATCH ever lands on this application before its
    // first POST (e.g. an autosaved field, or a UI tab saved out of order),
    // a `relationshipStartDate`-based check would see that stray value and
    // wrongly conflict on the Initiator's actual first submission — which is
    // exactly what happened for freshly Initiator-created applications.
    // `initiatorUserId` has no such ambiguity: it is stamped only right here,
    // exactly once, and `UpdateInitiatorApplicationDto` doesn't expose it, so
    // PATCH can never set it. It is therefore a true "has POST ever
    // succeeded for this application" flag for both the Student→Parent→
    // College→Initiator flow and the Initiator-created flow alike.
    if (application.initiatorUserId) {
      throw new ConflictException(
        'Initiator information already exists for this application. Use PATCH to update it.',
      );
    }

    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    });
    if (!actor) throw new NotFoundException('User not found');

    // Student-sourced applications already carry status: SUBMITTED by the
    // time they reach here — the student's own Step 4 submit() sets it,
    // long before Parent/College/Initiator ever touch the record. An
    // Initiator-created application never passes through that endpoint (it
    // has no student owner to submit it), so without this it stays at
    // status: DRAFT forever and never satisfies the SUBMITTED-only default
    // filter every staff dashboard query (Supporter/Checker/Approver/Credit
    // Manager, via DashboardApplicationsService.buildFilterWhere()) uses to
    // list applications. This is therefore the Initiator-created flow's
    // equivalent of the student's submit() call — the one-time completion of
    // the Initiator's own section is what makes a bank-created application
    // "approved" and ready to enter the same pipeline everyone else uses.
    const isInitiatorSourced =
      application.source === ApplicationSource.INITIATOR;

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...(dto as any),
        initiatorUserId: actor.id,
        initiatorName: actor.fullName ?? actor.email,
        initiatorDate: new Date(),
        ...(isInitiatorSourced && {
          status: ApplicationStatus.SUBMITTED,
          submittedAt: new Date(),
        }),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_UPDATED,
      { section: 'initiator', action: 'create' },
      applicationId,
    );
    return updated;
  }

  // Starts a brand-new, complete application from scratch — no pre-existing
  // applicationId, and no student submission or college verification
  // required. Delegates entirely to ApplicationsService.createComplete(),
  // the same place the student flow's own creation logic lives, tagged
  // `source: INITIATOR` — so field shape, validation, and the
  // LoanApplication + StudyInformation + LoanInformation write pattern are
  // shared with (not duplicated from) the student flow. The Initiator's own
  // credit-appraisal fields (customerName, relationshipStartDate, etc.) are
  // added afterward through the existing createInitiatorApplication()/
  // updateInitiatorApplication() above — this call only handles the
  // student-shaped part of the record.
  async createNewApplication(
    userId: string,
    dto: CreateInitiatorNewApplicationDto,
  ) {
    return this.applicationsService.createComplete(userId, dto, {
      source: ApplicationSource.INITIATOR,
    });
  }

  async updateInitiatorApplication(
    applicationId: string,
    userId: string,
    dto: UpdateInitiatorApplicationDto,
  ) {
    const application = await this.assertApplicationExists(applicationId);

    const {
      familyMembers,
      existingFacilities,
      personalGuarantee,
      insuredAssets,
      valueOfAssets,
      sumOfInsurance,
      insuranceCoverage,
      insuranceRemarks,
      repaymentCapacity,
      blacklistStatus,
      blacklistReason,
      blacklistDate,
      blacklistReferenceNumber,
      approval,
      ...rest
    } = dto;

    const approvalUpdate = this.buildApprovalUpdate(approval);

    const insurance = {
      insuredAssets,
      valueOfAssets,
      sumOfInsurance,
      insuranceCoverage,
      insuranceRemarks,
    };
    const hasInsuranceUpdate = Object.values(insurance).some(
      (value) => value !== undefined,
    );

    const blacklistUpdate = this.resolveBlacklistUpdate(application, {
      blacklistStatus,
      blacklistReason,
      blacklistDate,
      blacklistReferenceNumber,
    });

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...rest,
        ...blacklistUpdate,
        ...approvalUpdate,
        ...(familyMembers && {
          familyMember: {
            deleteMany: {},
            create: familyMembers,
          },
        }),
        ...(existingFacilities && {
          existingFacility: {
            deleteMany: {},
            create: existingFacilities,
          },
        }),
        ...(personalGuarantee && {
          personalGuarantee: {
            upsert: {
              create: personalGuarantee,
              update: personalGuarantee,
            },
          },
        }),
        ...(hasInsuranceUpdate && {
          insurance: {
            upsert: {
              create: insurance,
              update: insurance,
            },
          },
        }),
        ...(repaymentCapacity && {
          repaymentCapacity: {
            upsert: {
              create: repaymentCapacity,
              update: repaymentCapacity,
            },
          },
        }),
      } as any,
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_UPDATED,
      { section: 'initiator', action: 'update' },
      applicationId,
    );
    return updated;
  }
}
