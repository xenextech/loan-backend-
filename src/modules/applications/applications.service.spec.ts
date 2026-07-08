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
    auditLogMock = jest.fn().mockResolvedValue(undefined);

    const prisma = {
      loanApplication: { create: createMock },
    } as unknown as PrismaService;
    const audit = { log: auditLogMock } as unknown as AuditService;
    const notifications = {} as unknown as NotificationsService;
    const config = { get: jest.fn() } as unknown as ConfigService;

    service = new ApplicationsService(prisma, audit, notifications, config);
  });

  describe('create', () => {
    it('creates a bare draft owned by the given student and audit-logs it', async () => {
      const result = await service.create('student-1');

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
});
