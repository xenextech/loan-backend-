import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditService } from '../audit/audit.service';
import { VerificationInvitationService } from '../verification/verification-invitation.service';
import { BankAccountOpeningService } from '../bank-account/bank-account-opening.service';
import { ParentVerificationDto } from './dto/parent-verification.dto';
import { ParentIdentityDocumentType } from './dto/parent-document.dto';
import { AuditAction, ParentDocumentType } from '../../common/enums';
import {
  DOCUMENT_BUCKET,
  ALLOWED_IDENTITY_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from '../storage/storage.constants';

const PARENT_DOCUMENT_FOLDERS: Record<ParentDocumentType, string> = {
  [ParentDocumentType.NID]: 'nid',
  [ParentDocumentType.PAN_ID]: 'pan-id',
  [ParentDocumentType.SALARY_SHEET]: 'salary-sheets',
};

@Injectable()
export class ParentPublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
    private readonly verificationInvitation: VerificationInvitationService,
    private readonly bankAccountOpening: BankAccountOpeningService,
  ) {}

  // ── Validate parent token (+ email, when the invitation captured one) ─────
  private async resolveParentToken(token: string, email?: string) {
    return this.verificationInvitation.resolveInvitation(
      token,
      email,
      'PARENT',
    );
  }

  // ── GET: application overview + current parent form state ─────────────────
  async getApplicationByToken(token: string, email?: string) {
    const link = await this.resolveParentToken(token, email);

    const app = link.application;
    const verification = await this.prisma.parentVerification.findUnique({
      where: { applicationId: link.applicationId },
    });

    const documents = verification
      ? await this.prisma.parentDocument.findMany({
          where: { parentVerificationId: verification.id },
          orderBy: { createdAt: 'asc' },
        })
      : [];

    // Legacy single-file salary sheet columns are no longer written to —
    // fall back to the latest SALARY_SHEET document so old clients reading
    // verification.salarySheetPublicUrl keep working after the multi-file change.
    const latestSalarySheet = [...documents]
      .reverse()
      .find((d) => d.documentType === ParentDocumentType.SALARY_SHEET);

    return {
      applicationNumber: app.applicationNumber,
      verificationCode: link.verificationCode,
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
      verification: verification && {
        ...verification,
        salarySheetPublicUrl:
          verification.salarySheetPublicUrl ??
          latestSalarySheet?.publicUrl ??
          null,
      },
      documents,
    };
  }

  // ── PUT: submit/update the parent profile form ────────────────────────────
  async submitParentProfile(
    token: string,
    dto: ParentVerificationDto,
    email?: string,
  ) {
    const link = await this.resolveParentToken(token, email);

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
    await this.verificationInvitation.markVerified(link.id);

    // No-ops unless College verification is also already complete — see
    // BankAccountOpeningService for the actual gating logic.
    await this.bankAccountOpening.ensureRequirementIfBothVerified(
      link.applicationId,
    );

    return record;
  }

  // ── Ensure a ParentVerification row exists so documents have a parent ─────
  private async ensureParentVerification(applicationId: string) {
    return this.prisma.parentVerification.upsert({
      where: { applicationId },
      create: { applicationId },
      update: {},
    });
  }

  private assertAllowedDocument(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_IDENTITY_DOCUMENT_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, JPEG, PNG, WEBP and PDF files are allowed.',
      );
    }
  }

  // Uploads one file and creates its ParentDocument row. When `replaceExisting`
  // is true (NID/PAN ID — exactly one document), any prior document of the
  // same type is deleted first; otherwise the upload is appended (SALARY_SHEET).
  private async storeParentDocument(
    applicationId: string,
    documentType: ParentDocumentType,
    file: Express.Multer.File,
    label: string | undefined,
    replaceExisting: boolean,
  ) {
    const verification = await this.ensureParentVerification(applicationId);

    if (replaceExisting) {
      const existing = await this.prisma.parentDocument.findFirst({
        where: { parentVerificationId: verification.id, documentType },
      });
      if (existing) {
        await this.storage.deleteFile(existing.bucketName, existing.filePath);
        await this.prisma.parentDocument.delete({
          where: { id: existing.id },
        });
      }
    }

    const result = await this.storage.uploadFile(
      file,
      DOCUMENT_BUCKET,
      `parent-docs/${applicationId}/${PARENT_DOCUMENT_FOLDERS[documentType]}`,
      ALLOWED_IDENTITY_DOCUMENT_TYPES,
      MAX_DOCUMENT_SIZE,
    );

    return this.prisma.parentDocument.create({
      data: {
        parentVerificationId: verification.id,
        documentType,
        label: label?.trim() || null,
        fileName: result.fileName,
        originalFileName: result.originalFileName,
        mimeType: result.mimeType,
        size: result.size,
        bucketName: result.bucketName,
        filePath: result.filePath,
        publicUrl: result.publicUrl,
      },
    });
  }

  // ── POST: upload salary sheet(s) — multiple files, never overwritten ──────
  async uploadSalarySheets(
    token: string,
    files: Express.Multer.File[],
    label?: string,
    email?: string,
  ) {
    if (!files?.length) {
      throw new BadRequestException(
        'Salary sheet must contain at least one document.',
      );
    }
    files.forEach((f) => this.assertAllowedDocument(f));

    const link = await this.resolveParentToken(token, email);

    // Sequential (not Promise.all) so each upload safely reuses the same
    // ParentVerification row without racing its upsert.
    const created: Awaited<
      ReturnType<ParentPublicService['storeParentDocument']>
    >[] = [];
    for (const file of files) {
      created.push(
        await this.storeParentDocument(
          link.applicationId,
          ParentDocumentType.SALARY_SHEET,
          file,
          label,
          false,
        ),
      );
    }
    return created;
  }

  // ── POST: upload NID / PAN ID — exactly one document, image or PDF ────────
  async uploadIdentityDocument(
    token: string,
    identityType: ParentIdentityDocumentType,
    file: Express.Multer.File,
    label?: string,
    email?: string,
  ) {
    this.assertAllowedDocument(file);
    const link = await this.resolveParentToken(token, email);

    const documentType: ParentDocumentType =
      identityType === ParentIdentityDocumentType.NID
        ? ParentDocumentType.NID
        : ParentDocumentType.PAN_ID;

    return this.storeParentDocument(
      link.applicationId,
      documentType,
      file,
      label,
      true,
    );
  }

  // ── GET: list all parent documents ─────────────────────────────────────────
  async getDocuments(token: string, email?: string) {
    const link = await this.resolveParentToken(token, email);
    const verification = await this.prisma.parentVerification.findUnique({
      where: { applicationId: link.applicationId },
    });
    if (!verification) return [];

    return this.prisma.parentDocument.findMany({
      where: { parentVerificationId: verification.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ── PATCH: rename a document's editable label ──────────────────────────────
  async updateDocumentLabel(
    token: string,
    documentId: string,
    label: string,
    email?: string,
  ) {
    if (!label?.trim()) {
      throw new BadRequestException('Document label cannot be empty.');
    }
    const link = await this.resolveParentToken(token, email);

    const document = await this.prisma.parentDocument.findUnique({
      where: { id: documentId },
      include: { parentVerification: true },
    });
    if (
      !document ||
      document.parentVerification.applicationId !== link.applicationId
    ) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.parentDocument.update({
      where: { id: documentId },
      data: { label: label.trim() },
    });
  }
}
