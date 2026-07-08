import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  AuditAction,
  ApplicationStatus,
  BlacklistStatus,
} from '../../common/enums';
import {
  paginate,
  buildPaginatedResponse,
} from '../../common/dto/pagination.dto';
import { generateApplicationNumber } from '../../common/utils/application-number.util';
import { CreateInitiatorApplicationDto } from './dto/create-initiator-application.dto';
import { UpdateInitiatorApplicationDto } from './dto/update-initiator-application.dto';
import { QueryCollegeVerifiedDto } from './dto/query-college-verified.dto';

@Injectable()
export class ApplicationInitiatorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
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
        personalGuarantee: true,
        insurance: true,
        repaymentCapacity: true,
        collegeVerification: true,
        parentVerification: true,
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

  // Sets initiator information on an application that already exists (e.g.
  // one created by a student, or via `createNewApplication` below).
  async createInitiatorApplication(
    applicationId: string,
    userId: string,
    dto: CreateInitiatorApplicationDto,
  ) {
    const application = await this.assertApplicationExists(applicationId);
    if (application.relationshipStartDate) {
      throw new ConflictException(
        'Initiator information already exists for this application. Use PATCH to update it.',
      );
    }

    const updated = await this.prisma.loanApplication.update({
      where: { id: applicationId },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: dto as any,
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_UPDATED,
      { section: 'initiator', action: 'create' },
      applicationId,
    );
    return updated;
  }

  // Starts a brand new application from scratch — no pre-existing
  // applicationId required. Mirrors `ApplicationsService.create()`.
  async createNewApplication(
    userId: string,
    dto: CreateInitiatorApplicationDto,
  ) {
    const created = await this.prisma.loanApplication.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        applicationNumber: generateApplicationNumber(),
        status: ApplicationStatus.DRAFT,
        ...(dto as any),
      },
    });

    await this.audit.log(
      userId,
      AuditAction.APPLICATION_CREATED,
      {
        applicationId: created.id,
        applicationNumber: created.applicationNumber,
      },
      created.id,
    );
    return created;
  }

  async updateInitiatorApplication(
    applicationId: string,
    userId: string,
    dto: UpdateInitiatorApplicationDto,
  ) {
    const application = await this.assertApplicationExists(applicationId);

    const {
      familyMembers,
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
      ...rest
    } = dto;

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
        ...(familyMembers && {
          familyMember: {
            deleteMany: {},
            create: familyMembers,
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
