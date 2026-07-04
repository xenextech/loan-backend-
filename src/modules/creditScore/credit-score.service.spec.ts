import { NotFoundException } from '@nestjs/common';
import { CreditScoreService } from './credit-score.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CreditScoreService.calculateByApplicationId', () => {
  let findUniqueMock: jest.Mock;
  let findFirstMock: jest.Mock;
  let service: CreditScoreService;

  const fullyScoredApplication = {
    id: 'app-1',
    creditLimit: 3000000, // above2.5M -> weight 2, point 3
    dsgir: 30, // below40 -> weight 3, point 1
    operationOfInstitution: 12, // above10Years -> weight 2, point 1
    satisfactoryPerformance: 4, // above3Years -> weight 1, point 1
    parentsBorrowingsWithBFIs: 'US', // weight 1, point 1
    sourceOfIncome: 'FIXED', // weight 1, point 1
  };

  beforeEach(() => {
    findUniqueMock = jest.fn().mockResolvedValue(fullyScoredApplication);
    findFirstMock = jest.fn().mockResolvedValue(fullyScoredApplication);

    const prisma = {
      loanApplication: {
        findUnique: findUniqueMock,
        findFirst: findFirstMock,
      },
    } as unknown as PrismaService;

    service = new CreditScoreService(prisma);
  });

  it('throws NotFoundException when the application does not exist', async () => {
    findUniqueMock.mockResolvedValueOnce(null);
    await expect(service.calculateByApplicationId('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('computes a weighted score when every scoring field is set', async () => {
    const result = await service.calculateByApplicationId('app-1');
    // totalWeight = 2+3+2+1+1+1 = 10; totalWeightScore = 2*3+3*1+2*1+1*1+1*1+1*1 = 6+3+2+1+1+1 = 14
    expect(result.overall.weight).toBe(10);
    expect(result.overall.score).toBe(14);
    expect(result.overall.percentage).toBe(140);
  });

  it('does not throw and simply excludes fields that are null (real bug this covers)', async () => {
    findFirstMock.mockResolvedValueOnce({
      ...fullyScoredApplication,
      parentsBorrowingsWithBFIs: null,
      sourceOfIncome: null,
    });

    const result = await service.calculateByApplicationId('app-1');
    // Excludes the two null fields: weight = 2+3+2+1 = 8; score = 6+3+2+1 = 12
    expect(result.overall.weight).toBe(8);
    expect(result.overall.score).toBe(12);
  });

  it('does not throw and excludes a field whose value matches no configured rule', async () => {
    findFirstMock.mockResolvedValueOnce({
      ...fullyScoredApplication,
      parentsBorrowingsWithBFIs: 'SOME_UNRECOGNIZED_VALUE',
    });

    const result = await service.calculateByApplicationId('app-1');
    // Excludes only parentsBorrowingsWithBFIs: weight = 2+3+2+1+1 = 9; score = 6+3+2+1+1 = 13
    expect(result.overall.weight).toBe(9);
    expect(result.overall.score).toBe(13);
  });

  it('returns a zero score without throwing when every field is null', async () => {
    findFirstMock.mockResolvedValueOnce({
      id: 'app-1',
      creditLimit: null,
      dsgir: null,
      operationOfInstitution: null,
      satisfactoryPerformance: null,
      parentsBorrowingsWithBFIs: null,
      sourceOfIncome: null,
    });

    const result = await service.calculateByApplicationId('app-1');
    expect(result.overall.weight).toBe(0);
    expect(result.overall.score).toBe(0);
    expect(result.overall.percentage).toBe(0);
  });
});
