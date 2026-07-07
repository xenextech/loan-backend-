import { NotFoundException } from '@nestjs/common';
import { DashboardApplicationsService } from './dashboard-applications.service';
import { PrismaService } from '../../../prisma/prisma.service';

interface FindManyCallArgs {
  where: {
    OR?: unknown[];
    branch?: string;
    submittedAt?: { gte?: Date; lte?: Date };
  };
}

describe('DashboardApplicationsService', () => {
  let findManyMock: jest.Mock<unknown, [FindManyCallArgs]>;
  let countMock: jest.Mock;
  let findUniqueMock: jest.Mock;
  let service: DashboardApplicationsService;

  beforeEach(() => {
    findManyMock = jest.fn<unknown, [FindManyCallArgs]>().mockResolvedValue([]);
    countMock = jest.fn().mockResolvedValue(0);
    findUniqueMock = jest.fn().mockResolvedValue(null);

    const prisma = {
      loanApplication: {
        findMany: findManyMock,
        count: countMock,
        findUnique: findUniqueMock,
      },
    } as unknown as PrismaService;

    service = new DashboardApplicationsService(prisma);
  });

  describe('list', () => {
    it('always scopes to SUBMITTED applications', async () => {
      await service.list({ page: 1, limit: 20 });
      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'SUBMITTED' } }),
      );
    });

    it('searches by name/ref/citizenship/phone via OR when a search term is given', async () => {
      await service.list({ page: 1, limit: 20, search: 'sunita' });
      const { where } = findManyMock.mock.calls[0][0];
      expect(where.OR).toEqual([
        { fullName: { contains: 'sunita', mode: 'insensitive' } },
        { applicationNumber: { contains: 'sunita', mode: 'insensitive' } },
        { citizenshipNumber: { contains: 'sunita' } },
        { phoneNumber: { contains: 'sunita' } },
      ]);
    });

    it('filters by branch and a submitted-date range', async () => {
      await service.list({
        page: 1,
        limit: 20,
        branch: 'Birgunj',
        dateFrom: '2026-06-01T00:00:00.000Z',
        dateTo: '2026-06-30T00:00:00.000Z',
      });
      const { where } = findManyMock.mock.calls[0][0];
      expect(where.branch).toBe('Birgunj');
      expect(where.submittedAt).toEqual({
        gte: new Date('2026-06-01T00:00:00.000Z'),
        lte: new Date('2026-06-30T00:00:00.000Z'),
      });
    });

    it('maps LoanApplication rows to the ref/borrower/grade/DSGIR/LTV/daysOpen shape', async () => {
      findManyMock.mockResolvedValueOnce([
        {
          id: 'app-1',
          applicationNumber: 'Unnati-2026-00001',
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          fullName: 'Sharada Sah Godh',
          branch: 'Birgunj',
          facility: 'Agriculture',
          riskGrade: 'A2',
          dsgir: 31.3,
          loanToValueRatio: 69.4,
          creditLimit: 710000,
          status: 'SUBMITTED',
        },
      ]);
      countMock.mockResolvedValueOnce(1);

      const result = await service.list({ page: 1, limit: 20 });
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: 'app-1',
          refNo: 'Unnati-2026-00001',
          borrower: 'Sharada Sah Godh',
          branch: 'Birgunj',
          type: 'Agriculture',
          amount: 710000,
          grade: 'A2',
          stage: 'SUBMITTED',
          dsgir: 31.3,
          ltv: 69.4,
          daysOpen: 5,
        }),
      );
    });

    it('falls back to createdAt for daysOpen when submittedAt is null', async () => {
      findManyMock.mockResolvedValueOnce([
        {
          id: 'app-2',
          applicationNumber: 'Unnati-2026-00002',
          submittedAt: null,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          fullName: 'Test User',
          branch: null,
          facility: null,
          riskGrade: null,
          dsgir: null,
          loanToValueRatio: null,
          creditLimit: null,
          status: 'SUBMITTED',
        },
      ]);
      const result = await service.list({ page: 1, limit: 20 });
      expect(result.data[0].daysOpen).toBe(2);
    });
  });

  describe('getOne', () => {
    it('returns the application with its nested relations', async () => {
      findUniqueMock.mockResolvedValueOnce({ id: 'app-1' });
      const result = await service.getOne('app-1');
      expect(result).toEqual({ id: 'app-1' });
      expect(findUniqueMock).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'app-1' } }),
      );
    });

    it('throws NotFoundException when the application does not exist', async () => {
      await expect(service.getOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
