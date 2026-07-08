import { ApplicationInitiatorService } from './application-initiator.service';
import { ApplicationsService } from '../applications/applications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ApplicationSource } from '../../common/enums';

type CreateCompleteArgs = [
  actorUserId: string,
  dto: unknown,
  options: { ownerUserId?: string; source?: ApplicationSource },
];

interface FindManyCallArgs {
  where: { OR: Record<string, unknown>[] };
}

describe('ApplicationInitiatorService', () => {
  let createCompleteMock: jest.Mock<unknown, CreateCompleteArgs>;
  let findManyMock: jest.Mock<unknown, [FindManyCallArgs]>;
  let countMock: jest.Mock;
  let service: ApplicationInitiatorService;

  beforeEach(() => {
    createCompleteMock = jest
      .fn<unknown, CreateCompleteArgs>()
      .mockResolvedValue({
        id: 'app-1',
        applicationNumber: 'Unnati-2026-00001',
        source: ApplicationSource.INITIATOR,
      });
    findManyMock = jest.fn<unknown, [FindManyCallArgs]>().mockResolvedValue([]);
    countMock = jest.fn().mockResolvedValue(0);

    const prisma = {
      loanApplication: { findMany: findManyMock, count: countMock },
    } as unknown as PrismaService;
    const audit = { log: jest.fn() } as unknown as AuditService;
    const applicationsService = {
      createComplete: createCompleteMock,
    } as unknown as ApplicationsService;

    service = new ApplicationInitiatorService(
      prisma,
      audit,
      applicationsService,
    );
  });

  describe('createNewApplication', () => {
    it('delegates to ApplicationsService.createComplete tagged source: INITIATOR', async () => {
      const dto = {
        fullName: 'Jane Student',
        identityType: 'CITIZENSHIP' as const,
      };

      const result = await service.createNewApplication(
        'initiator-1',
        dto as never,
      );

      expect(createCompleteMock).toHaveBeenCalledWith('initiator-1', dto, {
        source: ApplicationSource.INITIATOR,
      });
      expect(result.id).toBe('app-1');
    });

    it('never sets an ownerUserId — Initiator-sourced applications have no student owner', async () => {
      await service.createNewApplication('initiator-1', {});
      const [, , options] = createCompleteMock.mock.calls[0];
      expect(options.ownerUserId).toBeUndefined();
    });
  });

  describe('getInitiatorQueue', () => {
    it('queries both college-verified and Initiator-sourced applications via OR', async () => {
      await service.getInitiatorQueue({ page: 1, limit: 20 });

      const { where } = findManyMock.mock.calls[0][0];
      expect(where.OR).toEqual([
        { collegeVerification: { isApplicationVerified: true } },
        { source: ApplicationSource.INITIATOR },
      ]);
    });

    it('maps each row to { applicationId, source, student, collegeVerification }', async () => {
      findManyMock.mockResolvedValueOnce([
        {
          id: 'app-1',
          applicationNumber: 'Unnati-2026-00001',
          status: 'DRAFT',
          source: 'INITIATOR',
          fullName: 'Jane Student',
          email: null,
          phoneNumber: null,
          createdAt: new Date(),
          user: null,
          collegeVerification: null,
        },
      ]);
      countMock.mockResolvedValueOnce(1);

      const result = await service.getInitiatorQueue({ page: 1, limit: 20 });

      expect(result.data[0]).toEqual(
        expect.objectContaining({
          applicationId: 'app-1',
          source: 'INITIATOR',
          collegeVerification: null,
        }),
      );
      expect(result.data[0].student).toEqual(
        expect.objectContaining({ id: 'app-1', fullName: 'Jane Student' }),
      );
    });
  });
});
