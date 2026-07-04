import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { ParentVerificationDto } from './dto/parent-verification.dto';
import { ApplicationLinkType, AuditAction } from '../../common/enums';
import {
  DOCUMENT_BUCKET,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from '../storage/storage.constants';

@Injectable()
export class ParentPublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  // ── Validate parent token and return the link record ──────────────────────
  private async resolveParentToken(token: string) {
    const link = await this.prisma.applicationLink.findUnique({
      where: { token },
      include: {
        application: {
          include: { studyInformation: true, loanInformation: true },
        },
      },
    });

    if (!link || link.linkType !== ApplicationLinkType.PARENT) {
      throw new NotFoundException('Invalid link');
    }
    if (link.expiresAt < new Date()) {
      throw new BadRequestException('This verification link has expired');
    }

    return link;
  }

  // ── GET: application overview + current parent form state ─────────────────
  async getApplicationByToken(token: string) {
    const link = await this.resolveParentToken(token);

    if (!link.accessedAt) {
      await this.prisma.applicationLink.update({
        where: { id: link.id },
        data: { accessedAt: new Date() },
      });
    }

    const app = link.application;
    const verification = await this.prisma.parentVerification.findUnique({
      where: { applicationId: link.applicationId },
    });

    return {
      applicationNumber: app.applicationNumber,
      studentName: app.fullName,
      email: app.email,
      phoneNumber: app.phoneNumber,
      studyType: app.studyInformation?.studyType,
      courseName: app.studyInformation?.courseName,
      boardUniversity: app.studyInformation?.boardUniversity,
      courseDuration: app.studyInformation?.courseDuration,
      loanAmount:
        app.loanInformation?.loanAmount != null
          ? Number(app.loanInformation.loanAmount)
          : undefined,
      submittedAt: app.submittedAt,
      verification,
    };
  }

  // ── PUT: submit/update the parent profile form ────────────────────────────
  async submitParentProfile(token: string, dto: ParentVerificationDto) {
    const link = await this.resolveParentToken(token);

    const record = await this.prisma.parentVerification.upsert({
      where: { applicationId: link.applicationId },
      create: {
        applicationId: link.applicationId,
        ...dto,
        submittedAt: new Date(),
      },
      update: {
        ...dto,
        submittedAt: new Date(),
      },
    });

    await this.audit.log(
      link?.application?.userId || '',
      AuditAction.PARENT_FORM_SUBMITTED,
      { name: dto.name, applicationId: link.applicationId },
      link.applicationId,
    );

    return record;
  }

  // ── POST: upload salary sheet ─────────────────────────────────────────────
  async uploadSalarySheet(token: string, file: Express.Multer.File) {
    const link = await this.resolveParentToken(token);

    const existing = await this.prisma.parentVerification.findUnique({
      where: { applicationId: link.applicationId },
    });

    if (existing?.salarySheetFilePath && existing?.salarySheetBucketName) {
      await this.storage.deleteFile(
        existing.salarySheetBucketName,
        existing.salarySheetFilePath,
      );
    }

    const result = await this.storage.uploadFile(
      file,
      DOCUMENT_BUCKET,
      `parent-docs/${link.applicationId}/salary-sheets`,
      [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
      MAX_DOCUMENT_SIZE,
    );

    return this.prisma.parentVerification.upsert({
      where: { applicationId: link.applicationId },
      create: {
        applicationId: link.applicationId,
        salarySheetFileName: result.fileName,
        salarySheetOriginalFileName: result.originalFileName,
        salarySheetMimeType: result.mimeType,
        salarySheetSize: result.size,
        salarySheetBucketName: result.bucketName,
        salarySheetFilePath: result.filePath,
        salarySheetPublicUrl: result.publicUrl,
      },
      update: {
        salarySheetFileName: result.fileName,
        salarySheetOriginalFileName: result.originalFileName,
        salarySheetMimeType: result.mimeType,
        salarySheetSize: result.size,
        salarySheetBucketName: result.bucketName,
        salarySheetFilePath: result.filePath,
        salarySheetPublicUrl: result.publicUrl,
      },
    });
  }
}
