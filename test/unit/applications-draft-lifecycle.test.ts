import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ApplicationsService } from '../../src/modules/applications/applications.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AuditService } from '../../src/modules/audit/audit.service';
import { NotificationsService } from '../../src/modules/notifications/notifications.service';
import { ConfigService } from '@nestjs/config';

// Covers the line between "an application row exists because the wizard is
// open" and "the student explicitly saved this as a draft" — the distinction
// that keeps refreshing the form out of the Drafts list.
describe('ApplicationsService — draft lifecycle', () => {
  let deleteManyMock: Mock;
  let createMock: Mock;
  let updateMock: Mock;
  let findUniqueMock: Mock;
  let auditLogMock: Mock;
  let service: ApplicationsService;

  const scratchApplication = {
    id: 'app-1',
    userId: 'user-1',
    status: 'DRAFT',
    currentStep: 1,
    draftSavedAt: null,
    dateOfBirth: null,
    dobBs: null,
  };

  beforeEach(() => {
    deleteManyMock = vi.fn().mockResolvedValue({ count: 1 });
    createMock = vi
      .fn()
      .mockResolvedValue({ ...scratchApplication, applicationNumber: 'APP-1' });
    updateMock = vi.fn().mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...scratchApplication, ...data }),
    );
    findUniqueMock = vi.fn().mockResolvedValue(scratchApplication);
    auditLogMock = vi.fn().mockResolvedValue(undefined);

    const prisma = {
      loanApplication: {
        deleteMany: deleteManyMock,
        create: createMock,
        update: updateMock,
        findUnique: findUniqueMock,
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaService;

    service = new ApplicationsService(
      prisma,
      { log: auditLogMock } as unknown as AuditService,
      {} as NotificationsService,
      {} as ConfigService,
    );
  });

  describe('create', () => {
    it('always creates a new application, so drafts never collide', async () => {
      const created = await service.create('user-1');

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(created.id).toBe('app-1');
    });

    it('discards only this user’s unsaved scratch applications', async () => {
      await service.create('user-1');

      expect(deleteManyMock).toHaveBeenCalledTimes(1);
      expect(deleteManyMock.mock.calls[0][0]).toEqual({
        where: { userId: 'user-1', status: 'DRAFT', draftSavedAt: null },
      });
    });

    it('never touches explicitly saved drafts or submitted applications', async () => {
      await service.create('user-1');

      const where = deleteManyMock.mock.calls[0][0].where as Record<
        string,
        unknown
      >;
      // draftSavedAt: null is what protects saved drafts; status: DRAFT is
      // what protects submitted applications.
      expect(where.draftSavedAt).toBeNull();
      expect(where.status).toBe('DRAFT');
    });
  });

  describe('saveDraft', () => {
    it('stamps draftSavedAt and records the step to resume on', async () => {
      const before = Date.now();
      await service.saveDraft('app-1', 'user-1', 3);

      expect(updateMock).toHaveBeenCalledTimes(1);
      const { where, data } = updateMock.mock.calls[0][0] as {
        where: { id: string };
        data: { currentStep: number; draftSavedAt: Date };
      };
      expect(where).toEqual({ id: 'app-1' });
      expect(data.currentStep).toBe(3);
      expect(data.draftSavedAt.getTime()).toBeGreaterThanOrEqual(before);
    });

    it('does not submit, change status, or advance the workflow stage', async () => {
      await service.saveDraft('app-1', 'user-1', 2);

      const data = (
        updateMock.mock.calls[0][0] as { data: Record<string, unknown> }
      ).data;
      expect(Object.keys(data).sort()).toEqual(['currentStep', 'draftSavedAt']);
      expect(data).not.toHaveProperty('status');
      expect(data).not.toHaveProperty('stage');
      expect(data).not.toHaveProperty('submittedAt');
    });

    it('refuses to save an application that is no longer a draft', async () => {
      findUniqueMock.mockResolvedValue({
        ...scratchApplication,
        status: 'SUBMITTED',
      });

      await expect(service.saveDraft('app-1', 'user-1', 2)).rejects.toThrow(
        BadRequestException,
      );
      expect(updateMock).not.toHaveBeenCalled();
    });
  });

  describe('updateCurrentStep', () => {
    it('records the wizard position without making it a saved draft', async () => {
      updateMock.mockResolvedValue({ id: 'app-1', currentStep: 2 });

      await service.updateCurrentStep('app-1', 'user-1', 2);

      const data = (
        updateMock.mock.calls[0][0] as { data: Record<string, unknown> }
      ).data;
      expect(data).toEqual({ currentStep: 2 });
      expect(data).not.toHaveProperty('draftSavedAt');
    });
  });
});
