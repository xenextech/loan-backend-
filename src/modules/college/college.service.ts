import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { VerificationInvitationService } from '../verification/verification-invitation.service';
import { BankAccountOpeningService } from '../bank-account/bank-account-opening.service';
import { CollegeFormDto } from './dto/college-form.dto';
import { ApplicationLinkType, AuditAction } from '../../common/enums';
import {
  DOCUMENT_BUCKET,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from '../storage/storage.constants';

@Injectable()
export class CollegeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
    private readonly verificationInvitation: VerificationInvitationService,
    private readonly bankAccountOpening: BankAccountOpeningService,
  ) {}

  // ── Validate college token (+ email, when the invitation captured one) ────
  private async resolveCollegeToken(token: string, email?: string) {
    return this.verificationInvitation.resolveInvitation(
      token,
      email,
      'COLLEGE',
    );
  }

  // ── GET: application overview + current college form state ────────────────
  async getApplicationByToken(token: string, email?: string) {
    const link = await this.resolveCollegeToken(token, email);

    const app = link.application;
    const verification = await this.prisma.collegeVerification.findUnique({
      where: { applicationId: link.applicationId },
    });

    return {
      applicationNumber: app.applicationNumber,
      verificationCode: link.verificationCode,
      studentName: app.fullName,
      studentEmail: app.email,
      studentPhone: app.phoneNumber,
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

  // ── POST/PUT: submit/update the college verification form ─────────────────
  async submitCollegeForm(token: string, dto: CollegeFormDto, email?: string) {
    const link = await this.resolveCollegeToken(token, email);

    const record = await this.prisma.collegeVerification.upsert({
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
      AuditAction.COLLEGE_FORM_SUBMITTED,
      { collegeName: dto.collegeName, applicationId: link.applicationId },
      link.applicationId,
    );
    await this.verificationInvitation.markVerified(link.id);

    // No-ops unless Parent verification is also already complete — see
    // BankAccountOpeningService for the actual gating logic.
    await this.bankAccountOpening.ensureRequirementIfBothVerified(
      link.applicationId,
    );

    return record;
  }

  // ── POST: upload offer letter ─────────────────────────────────────────────
  async uploadOfferLetter(
    token: string,
    file: Express.Multer.File,
    email?: string,
  ) {
    const link = await this.resolveCollegeToken(token, email);

    const existing = await this.prisma.collegeVerification.findUnique({
      where: { applicationId: link.applicationId },
    });

    if (existing?.offerLetterFilePath && existing?.offerLetterBucketName) {
      await this.storage.deleteFile(
        existing.offerLetterBucketName,
        existing.offerLetterFilePath,
      );
    }

    const result = await this.storage.uploadFile(
      file,
      DOCUMENT_BUCKET,
      `college-docs/${link.applicationId}/offer-letters`,
      [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
      MAX_DOCUMENT_SIZE,
    );

    return this.prisma.collegeVerification.upsert({
      where: { applicationId: link.applicationId },
      create: {
        applicationId: link.applicationId,
        offerLetterFileName: result.fileName,
        offerLetterOriginalFileName: result.originalFileName,
        offerLetterMimeType: result.mimeType,
        offerLetterSize: result.size,
        offerLetterBucketName: result.bucketName,
        offerLetterFilePath: result.filePath,
        offerLetterPublicUrl: result.publicUrl,
      },
      update: {
        offerLetterFileName: result.fileName,
        offerLetterOriginalFileName: result.originalFileName,
        offerLetterMimeType: result.mimeType,
        offerLetterSize: result.size,
        offerLetterBucketName: result.bucketName,
        offerLetterFilePath: result.filePath,
        offerLetterPublicUrl: result.publicUrl,
      },
    });
  }

  // ── GET: all verifications for this college account ──────────────────────
  // Queries via ApplicationLink.recipientEmail so applications appear as soon
  // as the student submits, without requiring the college to submit the form first.
  async getMyVerifications(email: string) {
    const links = await this.prisma.applicationLink.findMany({
      where: {
        linkType: ApplicationLinkType.COLLEGE,
        recipientEmail: email,
      },
      include: {
        application: {
          include: {
            studyInformation: true,
            loanInformation: true,
            collegeVerification: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return links.map((link) => {
      const app = link.application;
      const v = app.collegeVerification;
      return {
        id: link.id,
        applicationId: link.applicationId,
        applicationNumber: app.applicationNumber,
        studentName: app.fullName,
        courseName: app.studyInformation?.courseName,
        boardUniversity: app.studyInformation?.boardUniversity,
        loanAmount:
          app.loanInformation?.loanAmount != null
            ? Number(app.loanInformation.loanAmount)
            : undefined,
        applicationStatus: app.status,
        isApplicationVerified: v?.isApplicationVerified ?? false,
        offerLetterUploaded: !!v?.offerLetterPublicUrl,
        enrollmentDocUploaded: !!v?.enrollmentDocPublicUrl,
        verificationSubmittedAt: v?.submittedAt,
        linkToken: link.token,
        linkExpiresAt: link.expiresAt,
      };
    });
  }

  // ── POST: upload enrollment docs ──────────────────────────────────────────
  async uploadEnrollmentDocs(
    token: string,
    file: Express.Multer.File,
    email?: string,
  ) {
    const link = await this.resolveCollegeToken(token, email);

    const existing = await this.prisma.collegeVerification.findUnique({
      where: { applicationId: link.applicationId },
    });

    if (existing?.enrollmentDocFilePath && existing?.enrollmentDocBucketName) {
      await this.storage.deleteFile(
        existing.enrollmentDocBucketName,
        existing.enrollmentDocFilePath,
      );
    }

    const result = await this.storage.uploadFile(
      file,
      DOCUMENT_BUCKET,
      `college-docs/${link.applicationId}/enrollment-docs`,
      [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
      MAX_DOCUMENT_SIZE,
    );

    return this.prisma.collegeVerification.upsert({
      where: { applicationId: link.applicationId },
      create: {
        applicationId: link.applicationId,
        enrollmentDocFileName: result.fileName,
        enrollmentDocOriginalFileName: result.originalFileName,
        enrollmentDocMimeType: result.mimeType,
        enrollmentDocSize: result.size,
        enrollmentDocBucketName: result.bucketName,
        enrollmentDocFilePath: result.filePath,
        enrollmentDocPublicUrl: result.publicUrl,
      },
      update: {
        enrollmentDocFileName: result.fileName,
        enrollmentDocOriginalFileName: result.originalFileName,
        enrollmentDocMimeType: result.mimeType,
        enrollmentDocSize: result.size,
        enrollmentDocBucketName: result.bucketName,
        enrollmentDocFilePath: result.filePath,
        enrollmentDocPublicUrl: result.publicUrl,
      },
    });
  }
}
