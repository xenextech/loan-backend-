import { BadRequestException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { AuditAction, ApplicationSource } from '../../common/enums';

interface CreateCallArgs {
  data: {
    userId?: string;
    source?: string;
    fullName?: string;
    dateOfBirth?: Date;
    dobBs?: string;
    studyInformation?: { create: Record<string, unknown> };
    loanInformation?: { create: Record<string, unknown> };
  };
}

describe('ApplicationsService', () => {
  let createMock: jest.Mock<unknown, [CreateCallArgs]>;
  let findFirstMock: jest.Mock;
  let auditLogMock: jest.Mock;
  let service: ApplicationsService;

  beforeEach(() => {
    createMock = jest
      .fn<unknown, [CreateCallArgs]>()
      .mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'app-1',
          applicationNumber: 'Unnati-2026-00001',
          dateOfBirth: data.dateOfBirth ?? null,
          dobBs: data.dobBs ?? null,
          ...data,
          studyInformation: data.studyInformation?.create ?? null,
          loanInformation: data.loanInformation?.create ?? null,
        }),
      );
    // No existing draft by default — individual tests override this to
    // exercise the "reuse existing draft" branch.
    findFirstMock = jest.fn().mockResolvedValue(null);
    auditLogMock = jest.fn().mockResolvedValue(undefined);

    const prisma = {
      loanApplication: { create: createMock, findFirst: findFirstMock },
    } as unknown as PrismaService;
    const audit = { log: auditLogMock } as unknown as AuditService;
    const notifications = {} as unknown as NotificationsService;
    const config = { get: jest.fn() } as unknown as ConfigService;

    service = new ApplicationsService(prisma, audit, notifications, config);
  });

  describe('create', () => {
    it('creates a bare draft owned by the given student and audit-logs it', async () => {
      const result = await service.create('student-1');

      expect(findFirstMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'student-1', status: 'DRAFT' },
        }),
      );
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'student-1',
            status: 'DRAFT',
          }) as unknown,
        }),
      );
      expect(auditLogMock).toHaveBeenCalledWith(
        'student-1',
        AuditAction.APPLICATION_CREATED,
        expect.objectContaining({ applicationId: 'app-1' }),
        'app-1',
      );
      expect(result.id).toBe('app-1');
    });

    it('returns the existing DRAFT instead of creating a second one', async () => {
      findFirstMock.mockResolvedValue({
        id: 'existing-draft',
        userId: 'student-1',
        status: 'DRAFT',
      });

      const result = await service.create('student-1');

      expect(result).toEqual(expect.objectContaining({ id: 'existing-draft' }));
      expect(createMock).not.toHaveBeenCalled();
      expect(auditLogMock).not.toHaveBeenCalled();
    });
  });

  describe('createComplete', () => {
    const fullDto = {
      fullName: 'Jane Student',
      email: 'jane@example.com',
      phoneNumber: '9800000000',
      studyType: 'PROGRAM' as const,
      courseName: 'BSc CS',
      boardUniversity: 'TU',
      courseDuration: '4 years',
      loanAmount: 500000,
      identityType: 'CITIZENSHIP' as const,
      identityNumber: '123-456',
      dobAd: '2000-01-15',
      province: 'Bagmati',
      fatherName: 'John Student',
      expectedSalary: 60000,
      feeStructureMethod: 'MANUAL' as const,
      feeStructureText: 'Rs 500000 total',
    };

    it('creates the application with source STUDENT by default, owned by ownerUserId', async () => {
      await service.createComplete('actor-1', fullDto, {
        ownerUserId: 'actor-1',
      });

      const { data } = createMock.mock.calls[0][0];
      expect(data.source).toBe(ApplicationSource.STUDENT);
      expect(data.userId).toBe('actor-1');
      expect(data.fullName).toBe('Jane Student');
    });

    it('tags source INITIATOR and leaves userId undefined when created by an Initiator', async () => {
      await service.createComplete('initiator-1', fullDto, {
        source: ApplicationSource.INITIATOR,
      });

      const { data } = createMock.mock.calls[0][0];
      expect(data.source).toBe(ApplicationSource.INITIATOR);
      expect(data.userId).toBeUndefined();
      expect(auditLogMock).toHaveBeenCalledWith(
        'initiator-1',
        AuditAction.APPLICATION_CREATED,
        expect.objectContaining({ source: ApplicationSource.INITIATOR }),
        'app-1',
      );
    });

    it('nests StudyInformation and LoanInformation as a single create — no separate calls', async () => {
      await service.createComplete('initiator-1', fullDto, {
        source: ApplicationSource.INITIATOR,
      });

      const { data } = createMock.mock.calls[0][0];
      expect(data.studyInformation?.create).toEqual({
        studyType: 'PROGRAM',
        courseName: 'BSc CS',
        boardUniversity: 'TU',
        courseDuration: '4 years',
      });
      expect(data.loanInformation?.create).toEqual({
        loanAmount: 500000,
        expectedSalary: 60000,
        feeStructureMethod: 'MANUAL',
        feeStructureUrl: undefined,
        feeStructureText: 'Rs 500000 total',
      });
      expect(createMock).toHaveBeenCalledTimes(1);
    });

    it('derives dobBs from dobAd, matching saveStep2 behavior', async () => {
      await service.createComplete('initiator-1', fullDto, {
        source: ApplicationSource.INITIATOR,
      });
      const { data } = createMock.mock.calls[0][0];
      expect(data.dobBs).toBeDefined();
    });

    it('rejects when dobAd and dobBs refer to different dates', async () => {
      await expect(
        service.createComplete(
          'initiator-1',
          { ...fullDto, dobAd: '2000-01-15', dobBs: '2050-01-01' },
          { source: ApplicationSource.INITIATOR },
        ),
      ).rejects.toThrow(BadRequestException);
      expect(createMock).not.toHaveBeenCalled();
    });
  });

  describe('saveStep1 — College Marketplace prefill anti-tamper', () => {
    const draftApplication = {
      id: 'app-1',
      userId: 'student-1',
      status: 'DRAFT',
      dateOfBirth: null,
      dobBs: null,
    };

    const activeCourse = {
      id: 'course-1',
      collegeId: 'college-1',
      name: 'Bachelor of Information Management',
      duration: '4 Years',
      tuitionFee: { toString: () => '340000' } as unknown as number, // Decimal-like
      isActive: true,
      college: {
        id: 'college-1',
        name: 'Pokhara College of IT',
        isActive: true,
        university: { name: 'Pokhara University' },
      },
    };

    let findUniqueApplicationMock: jest.Mock;
    let findUniqueCourseMock: jest.Mock;
    let updateMock: jest.Mock;
    let studyUpsertMock: jest.Mock;
    let loanUpsertMock: jest.Mock;
    let transactionMock: jest.Mock;
    let stepService: ApplicationsService;

    beforeEach(() => {
      findUniqueApplicationMock = jest.fn().mockResolvedValue(draftApplication);
      findUniqueCourseMock = jest.fn().mockResolvedValue(activeCourse);
      updateMock = jest.fn().mockResolvedValue({});
      studyUpsertMock = jest.fn().mockResolvedValue({});
      loanUpsertMock = jest.fn().mockResolvedValue({});
      transactionMock = jest.fn((ops: Promise<unknown>[]) => Promise.all(ops));

      const prisma = {
        loanApplication: {
          findUnique: findUniqueApplicationMock,
          update: updateMock,
        },
        course: { findUnique: findUniqueCourseMock },
        studyInformation: { upsert: studyUpsertMock },
        loanInformation: { upsert: loanUpsertMock },
        $transaction: transactionMock,
      } as unknown as PrismaService;
      const audit = {
        log: jest.fn().mockResolvedValue(undefined),
      } as unknown as AuditService;
      const notifications = {} as unknown as NotificationsService;
      const config = { get: jest.fn() } as unknown as ConfigService;

      stepService = new ApplicationsService(
        prisma,
        audit,
        notifications,
        config,
      );
    });

    it('re-derives collegeName/courseName/boardUniversity/duration/tuitionFee from the catalog when courseId is present, ignoring client-supplied text', async () => {
      await stepService.saveStep1('app-1', 'student-1', {
        collegeName: 'Some Tampered College Name',
        courseName: 'Tampered Course Name',
        boardUniversity: 'Tampered University',
        courseDuration: '99 Years',
        collegeId: 'college-1',
        courseId: 'course-1',
        loanAmount: 300000,
      });

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            collegeName: 'Pokhara College of IT',
            collegeId: 'college-1',
          }) as unknown,
        }),
      );
      expect(studyUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            courseName: 'Bachelor of Information Management',
            boardUniversity: 'Pokhara University',
            courseDuration: '4 Years',
            courseId: 'course-1',
            tuitionFee: 340000,
          }) as unknown,
        }),
      );
    });

    it('rejects when the course does not belong to the selected college', async () => {
      await expect(
        stepService.saveStep1('app-1', 'student-1', {
          collegeId: 'a-different-college',
          courseId: 'course-1',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(updateMock).not.toHaveBeenCalled();
    });

    it('rejects when the course is inactive or not found', async () => {
      findUniqueCourseMock.mockResolvedValueOnce(null);
      await expect(
        stepService.saveStep1('app-1', 'student-1', {
          collegeId: 'college-1',
          courseId: 'missing-course',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('leaves free-text fields untouched when no courseId is supplied (direct /apply path)', async () => {
      await stepService.saveStep1('app-1', 'student-1', {
        collegeName: 'Hand-typed College',
        courseName: 'Hand-typed Course',
        boardUniversity: 'Hand-typed University',
        courseDuration: '3 Years',
        loanAmount: 200000,
      });

      expect(findUniqueCourseMock).not.toHaveBeenCalled();
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            collegeName: 'Hand-typed College',
          }) as unknown,
        }),
      );
      expect(studyUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            courseName: 'Hand-typed Course',
            boardUniversity: 'Hand-typed University',
            courseDuration: '3 Years',
            courseId: undefined,
          }) as unknown,
        }),
      );
    });
  });
});
