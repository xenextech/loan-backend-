import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DashboardDocumentsService } from './dashboard-documents.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  AuditAction,
  AuditCategory,
  DocumentType,
  GeneratedAgreementType,
  UserRole,
} from '../../../common/enums';

interface AgreementCreateCallArgs {
  data: {
    status: string;
    generatedByUserId: string;
    generatedByName: string;
    documentNumber: string;
    templateSnapshot: Record<string, unknown>;
  };
}

interface AgreementUpdateCallArgs {
  data: { status: string; sentToSignAt?: Date; signedAt?: Date };
}

interface CollegeVerificationUpdateCallArgs {
  where: { applicationId: string };
  data: { offerLetterVerified: boolean; offerLetterVerifiedByUserId: string };
}

describe('DashboardDocumentsService', () => {
  let applicationFindUniqueMock: jest.Mock;
  let offerLetterFindFirstMock: jest.Mock;
  let collegeVerificationUpdateMock: jest.Mock<
    unknown,
    [CollegeVerificationUpdateCallArgs]
  >;
  let documentFindManyMock: jest.Mock;
  let documentCountMock: jest.Mock;
  let agreementFindManyMock: jest.Mock;
  let agreementCountMock: jest.Mock;
  let agreementCreateMock: jest.Mock<unknown, [AgreementCreateCallArgs]>;
  let agreementFindUniqueMock: jest.Mock;
  let agreementUpdateMock: jest.Mock<unknown, [AgreementUpdateCallArgs]>;
  let loanAccountFindUniqueMock: jest.Mock;
  let emiScheduleFindManyMock: jest.Mock;
  let userFindUniqueMock: jest.Mock;
  let auditLogMock: jest.Mock;
  let notifyLegalDocumentGeneratedMock: jest.Mock;
  let notifyStudentDocumentReadyToSignMock: jest.Mock;
  let notifyLegalDocumentForwardedMock: jest.Mock;
  let storageUploadFileMock: jest.Mock;
  let service: DashboardDocumentsService;

  beforeEach(() => {
    applicationFindUniqueMock = jest.fn().mockResolvedValue({
      id: 'app-1',
      applicationNumber: 'Unati-2026-00001',
      fullName: 'Bikash Rai',
      collegeName: 'Kathmandu University',
      facility: 'Education Loan',
      creditLimit: 637000,
      interestRate: 9.5,
      period: 8,
      periodUnit: 'MONTH',
      userId: 'student-1',
      initiatorUserId: null,
      supporterUserId: null,
      checkerUserId: null,
      approverUserId: null,
      studyInformation: { courseName: 'B.Tech' },
      loanInformation: { loanAmount: 637000 },
      collegeVerification: { applicationId: 'app-1', collegeName: null },
      personalGuarantee: null,
      disbursement: null,
    });
    offerLetterFindFirstMock = jest.fn().mockResolvedValue(null);
    collegeVerificationUpdateMock = jest.fn<
      unknown,
      [CollegeVerificationUpdateCallArgs]
    >();
    documentFindManyMock = jest.fn().mockResolvedValue([]);
    documentCountMock = jest.fn().mockResolvedValue(0);
    agreementFindManyMock = jest.fn().mockResolvedValue([]);
    agreementCountMock = jest.fn().mockResolvedValue(0);
    agreementCreateMock = jest.fn<unknown, [AgreementCreateCallArgs]>();
    agreementFindUniqueMock = jest.fn().mockResolvedValue(null);
    agreementUpdateMock = jest.fn<unknown, [AgreementUpdateCallArgs]>();
    loanAccountFindUniqueMock = jest.fn().mockResolvedValue(null);
    emiScheduleFindManyMock = jest.fn().mockResolvedValue([]);
    userFindUniqueMock = jest.fn().mockResolvedValue({
      fullName: 'Credit Manager One',
      email: 'cm@unati.com',
    });
    auditLogMock = jest.fn().mockResolvedValue(undefined);
    notifyLegalDocumentGeneratedMock = jest.fn().mockResolvedValue(undefined);
    notifyStudentDocumentReadyToSignMock = jest
      .fn()
      .mockResolvedValue(undefined);
    notifyLegalDocumentForwardedMock = jest.fn().mockResolvedValue(undefined);
    storageUploadFileMock = jest.fn().mockResolvedValue({
      fileName: 'signed.pdf',
      originalFileName: 'signed.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      bucketName: 'Private',
      filePath: 'app-1/signed.pdf',
      publicUrl: 'https://storage.example.com/app-1/signed.pdf',
    });

    const prisma = {
      loanApplication: { findUnique: applicationFindUniqueMock },
      offerLetter: { findFirst: offerLetterFindFirstMock },
      collegeVerification: { update: collegeVerificationUpdateMock },
      document: { findMany: documentFindManyMock, count: documentCountMock },
      generatedAgreement: {
        findMany: agreementFindManyMock,
        count: agreementCountMock,
        create: agreementCreateMock,
        findUnique: agreementFindUniqueMock,
        update: agreementUpdateMock,
      },
      loanAccount: { findUnique: loanAccountFindUniqueMock },
      emiScheduleEntry: { findMany: emiScheduleFindManyMock },
      user: { findUnique: userFindUniqueMock },
    } as unknown as PrismaService;

    const storage = {
      uploadFile: storageUploadFileMock,
    } as unknown as StorageService;
    const audit = { log: auditLogMock } as unknown as AuditService;
    const notifications = {
      notifyLegalDocumentGenerated: notifyLegalDocumentGeneratedMock,
      notifyStudentDocumentReadyToSign: notifyStudentDocumentReadyToSignMock,
      notifyLegalDocumentForwarded: notifyLegalDocumentForwardedMock,
    } as unknown as NotificationsService;

    service = new DashboardDocumentsService(
      prisma,
      storage,
      audit,
      notifications,
    );
  });

  describe('verifyOfferLetter', () => {
    it('throws NotFoundException for a missing application', async () => {
      applicationFindUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.verifyOfferLetter('user-1', {
          applicationId: 'missing',
          refOrQrToken: 'AIM/OFFER/2081-082/0041',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('reports unmatched when no offer letter matches the ref/QR token', async () => {
      const result = await service.verifyOfferLetter('user-1', {
        applicationId: 'app-1',
        refOrQrToken: 'unknown-ref',
      });
      expect(result).toEqual({
        matched: false,
        offerLetter: null,
        verification: null,
      });
      expect(collegeVerificationUpdateMock).not.toHaveBeenCalled();
    });

    it('reports unmatched when the application has no college verification record', async () => {
      applicationFindUniqueMock.mockResolvedValueOnce({
        id: 'app-1',
        collegeVerification: null,
      });
      offerLetterFindFirstMock.mockResolvedValueOnce({ id: 'ol-1' });

      const result = await service.verifyOfferLetter('user-1', {
        applicationId: 'app-1',
        refOrQrToken: 'AIM/OFFER/2081-082/0041',
      });
      expect(result.matched).toBe(false);
    });

    it('marks the offer letter verified and logs an audit entry on match', async () => {
      offerLetterFindFirstMock.mockResolvedValueOnce({
        id: 'ol-1',
        refNo: 'AIM/OFFER/2081-082/0041',
      });
      collegeVerificationUpdateMock.mockResolvedValueOnce({
        applicationId: 'app-1',
        offerLetterVerified: true,
      });

      const result = await service.verifyOfferLetter('user-1', {
        applicationId: 'app-1',
        refOrQrToken: 'AIM/OFFER/2081-082/0041',
      });

      expect(result.matched).toBe(true);
      const updateArgs = collegeVerificationUpdateMock.mock.calls[0][0];
      expect(updateArgs.where).toEqual({ applicationId: 'app-1' });
      expect(updateArgs.data.offerLetterVerified).toBe(true);
      expect(updateArgs.data.offerLetterVerifiedByUserId).toBe('user-1');
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.OFFER_LETTER_VERIFIED,
        { refOrQrToken: 'AIM/OFFER/2081-082/0041' },
        'app-1',
        AuditCategory.SYSTEM,
      );
    });
  });

  describe('getVault', () => {
    it('filters by applicationId and documentType when provided', async () => {
      await service.getVault({
        page: 1,
        limit: 20,
        applicationId: 'app-1',
        documentType: DocumentType.OFFER_LETTER,
      });
      expect(documentFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            applicationId: 'app-1',
            documentType: DocumentType.OFFER_LETTER,
          },
        }),
      );
    });
  });

  describe('listAgreements', () => {
    it('scopes to a single application when applicationId is given', async () => {
      await service.listAgreements({
        page: 1,
        limit: 20,
        applicationId: 'app-1',
      });
      expect(agreementFindManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: { applicationId: 'app-1' } }),
      );
    });
  });

  describe('createAgreement', () => {
    it('throws NotFoundException for a missing application', async () => {
      applicationFindUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.createAgreement('user-1', {
          applicationId: 'missing',
          agreementType: GeneratedAgreementType.LOAN_AGREEMENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('auto-populates the template snapshot from the application, logs the action, and notifies participants', async () => {
      agreementCreateMock.mockResolvedValueOnce({ id: 'agr-1' });

      await service.createAgreement('user-1', {
        applicationId: 'app-1',
        agreementType: GeneratedAgreementType.LOAN_AGREEMENT,
      });

      const { data } = agreementCreateMock.mock.calls[0][0];
      expect(data.status).toBe('DRAFT');
      expect(data.generatedByUserId).toBe('user-1');
      expect(data.generatedByName).toBe('Credit Manager One');
      expect(data.documentNumber).toMatch(/^LGL-\d{4}-\d{5}$/);
      expect(data.templateSnapshot).toEqual(
        expect.objectContaining({
          studentName: 'Bikash Rai',
          applicationNumber: 'Unati-2026-00001',
          collegeName: 'Kathmandu University',
        }),
      );
      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.AGREEMENT_GENERATED,
        expect.objectContaining({
          agreementId: 'agr-1',
          agreementType: GeneratedAgreementType.LOAN_AGREEMENT,
        }),
        'app-1',
        AuditCategory.SYSTEM,
      );
      expect(notifyLegalDocumentGeneratedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          documentLabel: 'Loan Agreement',
          generatedByName: 'Credit Manager One',
        }),
      );
    });
  });

  describe('sendToSign', () => {
    it('throws NotFoundException for an unknown agreement', async () => {
      await expect(service.sendToSign('user-1', 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects sending a non-draft agreement to sign', async () => {
      agreementFindUniqueMock.mockResolvedValueOnce({
        id: 'agr-1',
        status: 'SIGNED',
      });
      await expect(service.sendToSign('user-1', 'agr-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('moves a draft agreement to PENDING_SIGNATURE and notifies the student', async () => {
      agreementFindUniqueMock.mockResolvedValueOnce({
        id: 'agr-1',
        status: 'DRAFT',
        applicationId: 'app-1',
        agreementType: GeneratedAgreementType.LOAN_AGREEMENT,
        documentNumber: 'LGL-2026-00001',
      });
      await service.sendToSign('user-1', 'agr-1');

      const { data } = agreementUpdateMock.mock.calls[0][0];
      expect(data.status).toBe('PENDING_SIGNATURE');
      expect(data.sentToSignAt).toBeInstanceOf(Date);

      expect(notifyStudentDocumentReadyToSignMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'student-1',
          applicationId: 'app-1',
          applicationNumber: 'Unati-2026-00001',
          documentLabel: 'Loan Agreement',
          documentNumber: 'LGL-2026-00001',
        }),
      );
    });
  });

  describe('markSigned', () => {
    it('rejects marking a non-pending agreement as signed', async () => {
      agreementFindUniqueMock.mockResolvedValueOnce({
        id: 'agr-1',
        status: 'DRAFT',
      });
      await expect(service.markSigned('user-1', 'agr-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('marks a pending agreement as SIGNED and logs the action', async () => {
      agreementFindUniqueMock.mockResolvedValueOnce({
        id: 'agr-1',
        status: 'PENDING_SIGNATURE',
        applicationId: 'app-1',
      });
      agreementUpdateMock.mockResolvedValueOnce({
        id: 'agr-1',
        status: 'SIGNED',
      });

      await service.markSigned('user-1', 'agr-1');

      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.AGREEMENT_SIGNED,
        { agreementId: 'agr-1' },
        'app-1',
        AuditCategory.SYSTEM,
      );
    });
  });

  describe('forwardAgreement', () => {
    it('throws NotFoundException for an unknown agreement', async () => {
      await expect(
        service.forwardAgreement('user-1', 'missing', {
          toRole: UserRole.INITIATOR,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('sets forwarding fields, logs the action, and notifies the target role', async () => {
      agreementFindUniqueMock.mockResolvedValueOnce({
        id: 'agr-1',
        applicationId: 'app-1',
        agreementType: GeneratedAgreementType.LOAN_AGREEMENT,
        documentNumber: 'LGL-2026-00001',
      });
      applicationFindUniqueMock.mockResolvedValueOnce({
        applicationNumber: 'Unati-2026-00001',
      });

      await service.forwardAgreement('user-1', 'agr-1', {
        toRole: UserRole.INITIATOR,
        note: 'Please collect signature this week',
      });

      const { data } = agreementUpdateMock.mock.calls[0][0];
      expect(data.forwardedToRole).toBe(UserRole.INITIATOR);
      expect(data.forwardedByUserId).toBe('user-1');
      expect(data.forwardedAt).toBeInstanceOf(Date);
      expect(data.forwardNote).toBe('Please collect signature this week');

      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.AGREEMENT_FORWARDED,
        { agreementId: 'agr-1', toRole: UserRole.INITIATOR },
        'app-1',
        AuditCategory.SYSTEM,
      );
      expect(notifyLegalDocumentForwardedMock).toHaveBeenCalledWith(
        expect.objectContaining({
          toRole: UserRole.INITIATOR,
          documentLabel: 'Loan Agreement',
          documentNumber: 'LGL-2026-00001',
          applicationNumber: 'Unati-2026-00001',
        }),
      );
    });
  });

  describe('uploadSignedDocument', () => {
    const file = { originalname: 'signed.pdf' } as Express.Multer.File;

    it('rejects uploading to an already-signed agreement', async () => {
      agreementFindUniqueMock.mockResolvedValueOnce({
        id: 'agr-1',
        status: 'SIGNED',
      });
      await expect(
        service.uploadSignedDocument('user-1', 'agr-1', file),
      ).rejects.toThrow(BadRequestException);
    });

    it('uploads the file, sets documentUrl, and marks the agreement SIGNED', async () => {
      agreementFindUniqueMock.mockResolvedValueOnce({
        id: 'agr-1',
        applicationId: 'app-1',
        status: 'PENDING_SIGNATURE',
      });
      agreementUpdateMock.mockResolvedValueOnce({
        id: 'agr-1',
        status: 'SIGNED',
      });

      await service.uploadSignedDocument('user-1', 'agr-1', file);

      expect(storageUploadFileMock).toHaveBeenCalled();
      const { data } = agreementUpdateMock.mock.calls[0][0] as {
        data: { documentUrl: string; status: string; signedAt: Date };
      };
      expect(data.documentUrl).toBe(
        'https://storage.example.com/app-1/signed.pdf',
      );
      expect(data.status).toBe('SIGNED');
      expect(data.signedAt).toBeInstanceOf(Date);

      expect(auditLogMock).toHaveBeenCalledWith(
        'user-1',
        AuditAction.AGREEMENT_SIGNED,
        expect.objectContaining({ agreementId: 'agr-1' }),
        'app-1',
        AuditCategory.SYSTEM,
      );
    });
  });
});
