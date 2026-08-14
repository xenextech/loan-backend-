import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  DocumentType,
  ApplicationStatus,
  ApplicationSource,
  UserRole,
} from '../../common/enums';
import {
  DOCUMENT_BUCKET,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IDENTITY_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
} from '../storage/storage.constants';
import {
  isIdentityDocumentType,
  assertIdentitySingleDocumentMimeType,
} from '../../common/utils/identity-document.util';

const DOCUMENT_CONFIG: Record<
  DocumentType,
  { bucket: string; allowedTypes: string[]; maxSize: number }
> = {
  [DocumentType.APPLICANT_PHOTO]: {
    bucket: DOCUMENT_BUCKET,
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE,
  },
  // Front and Back slots accept images as well as PDF so users can upload
  // whichever format they have. Mixing images + PDF is fully supported.
  [DocumentType.IDENTITY_FRONT]: {
    bucket: DOCUMENT_BUCKET,
    allowedTypes: ALLOWED_IDENTITY_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE,
  },
  [DocumentType.IDENTITY_BACK]: {
    bucket: DOCUMENT_BUCKET,
    allowedTypes: ALLOWED_IDENTITY_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE,
  },
  [DocumentType.IDENTITY_DOCUMENT]: {
    bucket: DOCUMENT_BUCKET,
    allowedTypes: ALLOWED_IDENTITY_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE,
  },
  [DocumentType.ACADEMIC_RECORD]: {
    bucket: DOCUMENT_BUCKET,
    allowedTypes: ALLOWED_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE,
  },
  [DocumentType.FEE_STRUCTURE]: {
    bucket: DOCUMENT_BUCKET,
    allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
    maxSize: MAX_DOCUMENT_SIZE,
  },
  [DocumentType.STUDENT_APPLICATION]: {
    bucket: DOCUMENT_BUCKET,
    allowedTypes: ALLOWED_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE,
  },
  [DocumentType.OFFER_LETTER]: {
    bucket: DOCUMENT_BUCKET,
    allowedTypes: ALLOWED_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE,
  },
  [DocumentType.ENROLLMENT_DOCUMENT]: {
    bucket: DOCUMENT_BUCKET,
    allowedTypes: ALLOWED_DOCUMENT_TYPES,
    maxSize: MAX_DOCUMENT_SIZE,
  },
};

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // Initiator-created applications have no owning student (userId is null) —
  // an Initiator acting on their own INITIATOR-sourced application is let
  // through in place of the usual student-ownership check.
  private isInitiatorOwnApplication(
    application: { source: ApplicationSource },
    role: UserRole,
  ) {
    return (
      role === UserRole.INITIATOR &&
      application.source === ApplicationSource.INITIATOR
    );
  }

  private async assertApplicationAccess(
    applicationId: string,
    userId: string,
    role: UserRole,
  ) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (
      application.userId !== userId &&
      !this.isInitiatorOwnApplication(application, role)
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot upload documents to a submitted application',
      );
    }
    return application;
  }

  async uploadDocument(
    applicationId: string,
    userId: string,
    role: UserRole,
    documentType: DocumentType,
    file: Express.Multer.File,
  ) {
    const application = await this.assertApplicationAccess(
      applicationId,
      userId,
      role,
    );

    const config = DOCUMENT_CONFIG[documentType];

    if (isIdentityDocumentType(documentType)) {
      assertIdentitySingleDocumentMimeType(
        application.identityType,
        documentType,
        file.mimetype,
      );
    }

    // For ACADEMIC_RECORD, multiple documents are allowed (student may have
    // several transcripts/certificates). For every other type we keep the
    // existing one-at-a-time behaviour — delete the previous file first.
    if (documentType !== DocumentType.ACADEMIC_RECORD) {
      const existing = await this.prisma.document.findFirst({
        where: { applicationId, documentType },
      });
      if (existing) {
        await this.storage.deleteFile(existing.bucketName, existing.filePath);
        await this.prisma.document.delete({ where: { id: existing.id } });
      }
    }

    const uploadResult = await this.storage.uploadFile(
      file,
      config.bucket,
      applicationId,
      config.allowedTypes,
      config.maxSize,
    );

    return this.prisma.document.create({
      data: {
        applicationId,
        documentType,
        ...uploadResult,
      },
    });
  }

  async getDocuments(applicationId: string, userId: string, role: UserRole) {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (
      role !== UserRole.ADMIN &&
      application.userId !== userId &&
      !this.isInitiatorOwnApplication(application, role)
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.document.findMany({ where: { applicationId } });
  }

  async deleteDocument(documentId: string, userId: string, role: UserRole) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { application: true },
    });
    if (!document) throw new NotFoundException('Document not found');
    if (
      document.application.userId !== userId &&
      !this.isInitiatorOwnApplication(document.application, role)
    )
      throw new ForbiddenException('Access denied');
    if (document.application.status !== ApplicationStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot delete documents from a submitted application',
      );
    }

    await this.storage.deleteFile(document.bucketName, document.filePath);
    await this.prisma.document.delete({ where: { id: documentId } });

    return { message: 'Document deleted' };
  }
}
