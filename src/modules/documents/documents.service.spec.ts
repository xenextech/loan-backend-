import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  ApplicationStatus,
  ApplicationSource,
  DocumentType,
  IdentityType,
  UserRole,
} from '../../common/enums';

const BASE_APPLICATION = {
  id: 'app-1',
  userId: 'student-1',
  status: ApplicationStatus.DRAFT,
  source: ApplicationSource.STUDENT,
  identityType: IdentityType.CITIZENSHIP,
};

const UPLOAD_RESULT = {
  fileName: 'uuid.png',
  originalFileName: 'photo.png',
  mimeType: 'image/png',
  size: 1024,
  bucketName: 'documents',
  filePath: 'app-1/uuid.png',
  publicUrl: 'https://example.com/uuid.png',
};

const FAKE_FILE = {
  mimetype: 'image/png',
  size: 1024,
} as Express.Multer.File;

describe('DocumentsService', () => {
  let findUniqueApplicationMock: jest.Mock;
  let findFirstDocumentMock: jest.Mock;
  let findManyDocumentMock: jest.Mock;
  let createDocumentMock: jest.Mock;
  let deleteDocumentMock: jest.Mock;
  let findUniqueDocumentMock: jest.Mock;
  let uploadFileMock: jest.Mock;
  let deleteFileMock: jest.Mock;
  let service: DocumentsService;

  beforeEach(() => {
    findUniqueApplicationMock = jest.fn().mockResolvedValue(BASE_APPLICATION);
    findFirstDocumentMock = jest.fn().mockResolvedValue(null);
    findManyDocumentMock = jest.fn().mockResolvedValue([]);
    createDocumentMock = jest
      .fn()
      .mockImplementation(({ data }) =>
        Promise.resolve({ id: 'doc-new', ...data }),
      );
    deleteDocumentMock = jest.fn().mockResolvedValue(undefined);
    findUniqueDocumentMock = jest.fn();
    uploadFileMock = jest.fn().mockResolvedValue(UPLOAD_RESULT);
    deleteFileMock = jest.fn().mockResolvedValue(undefined);

    const prisma = {
      loanApplication: { findUnique: findUniqueApplicationMock },
      document: {
        findFirst: findFirstDocumentMock,
        findMany: findManyDocumentMock,
        create: createDocumentMock,
        delete: deleteDocumentMock,
        findUnique: findUniqueDocumentMock,
      },
    } as unknown as PrismaService;
    const storage = {
      uploadFile: uploadFileMock,
      deleteFile: deleteFileMock,
    } as unknown as StorageService;

    service = new DocumentsService(prisma, storage);
  });

  describe('uploadDocument — identity type isolation', () => {
    it("does not touch a different identity type's document in the same slot", async () => {
      // A Citizenship IDENTITY_FRONT already exists; uploading a Passport
      // IDENTITY_FRONT must not find/delete it — different identityType.
      findFirstDocumentMock.mockResolvedValue(null);

      await service.uploadDocument(
        'app-1',
        'student-1',
        UserRole.STUDENT,
        DocumentType.IDENTITY_FRONT,
        IdentityType.PASSPORT,
        FAKE_FILE,
      );

      expect(findFirstDocumentMock).toHaveBeenCalledWith({
        where: {
          applicationId: 'app-1',
          documentType: DocumentType.IDENTITY_FRONT,
          identityType: IdentityType.PASSPORT,
        },
      });
      expect(deleteFileMock).not.toHaveBeenCalled();
      expect(createDocumentMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identityType: IdentityType.PASSPORT,
          }) as unknown,
        }),
      );
    });

    it('replaces an existing document of the SAME identity type + slot', async () => {
      findFirstDocumentMock.mockResolvedValue({
        id: 'doc-old',
        bucketName: 'documents',
        filePath: 'app-1/old.png',
      });

      await service.uploadDocument(
        'app-1',
        'student-1',
        UserRole.STUDENT,
        DocumentType.IDENTITY_FRONT,
        IdentityType.CITIZENSHIP,
        FAKE_FILE,
      );

      expect(deleteFileMock).toHaveBeenCalledWith('documents', 'app-1/old.png');
      expect(deleteDocumentMock).toHaveBeenCalledWith({
        where: { id: 'doc-old' },
      });
    });

    it('ignores an identityType query param for a non-identity documentType', async () => {
      await service.uploadDocument(
        'app-1',
        'student-1',
        UserRole.STUDENT,
        DocumentType.APPLICANT_PHOTO,
        IdentityType.PASSPORT,
        FAKE_FILE,
      );

      expect(findFirstDocumentMock).toHaveBeenCalledWith({
        where: {
          applicationId: 'app-1',
          documentType: DocumentType.APPLICANT_PHOTO,
          identityType: null,
        },
      });
      expect(createDocumentMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ identityType: null }) as unknown,
        }),
      );
    });

    it('rejects an invalid identityType value', async () => {
      await expect(
        service.uploadDocument(
          'app-1',
          'student-1',
          UserRole.STUDENT,
          DocumentType.IDENTITY_FRONT,
          'NOT_A_REAL_TYPE',
          FAKE_FILE,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('stores identityType null for the generic "no specific type" upload', async () => {
      await service.uploadDocument(
        'app-1',
        'student-1',
        UserRole.STUDENT,
        DocumentType.IDENTITY_DOCUMENT,
        undefined,
        FAKE_FILE,
      );

      expect(createDocumentMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ identityType: null }) as unknown,
        }),
      );
    });
  });

  describe('getDocuments — identity type filter', () => {
    it('filters by identityType when provided', async () => {
      await service.getDocuments(
        'app-1',
        'student-1',
        UserRole.STUDENT,
        IdentityType.PASSPORT,
      );

      expect(findManyDocumentMock).toHaveBeenCalledWith({
        where: { applicationId: 'app-1', identityType: IdentityType.PASSPORT },
      });
    });

    it('returns every document when no identityType filter is given', async () => {
      await service.getDocuments('app-1', 'student-1', UserRole.STUDENT);

      expect(findManyDocumentMock).toHaveBeenCalledWith({
        where: { applicationId: 'app-1' },
      });
    });

    it('rejects an invalid identityType filter', async () => {
      await expect(
        service.getDocuments('app-1', 'student-1', UserRole.STUDENT, 'GARBAGE'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('deleteDocument — application ownership', () => {
    it('deletes when the document belongs to the requested application', async () => {
      findUniqueDocumentMock.mockResolvedValue({
        id: 'doc-1',
        applicationId: 'app-1',
        bucketName: 'documents',
        filePath: 'app-1/doc.png',
        application: BASE_APPLICATION,
      });

      const result = await service.deleteDocument(
        'app-1',
        'doc-1',
        'student-1',
        UserRole.STUDENT,
      );

      expect(result).toEqual({ message: 'Document deleted' });
      expect(deleteFileMock).toHaveBeenCalledWith('documents', 'app-1/doc.png');
    });

    it('rejects when the document belongs to a DIFFERENT application than the URL names', async () => {
      // Same owning user, but the document actually lives under Application B —
      // must not be deletable via Application A's URL.
      findUniqueDocumentMock.mockResolvedValue({
        id: 'doc-1',
        applicationId: 'app-B',
        bucketName: 'documents',
        filePath: 'app-B/doc.png',
        application: { ...BASE_APPLICATION, id: 'app-B' },
      });

      await expect(
        service.deleteDocument('app-A', 'doc-1', 'student-1', UserRole.STUDENT),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(deleteFileMock).not.toHaveBeenCalled();
    });
  });
});
