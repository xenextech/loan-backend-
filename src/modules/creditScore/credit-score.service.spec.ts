import { NotFoundException } from '@nestjs/common';
import { CreditScoreService } from './credit-score.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CreditScoreService', () => {
  let findUniqueMock: jest.Mock;
  let updateMock: jest.Mock;
  let service: CreditScoreService;

  // A plain-object stand-in for a Prisma Decimal.js instance: not typeof
  // 'number', but converts correctly via Number(...) — exactly like the real
  // thing. Regression fixture for the creditLimit bug (see credit-score.service.ts).
  const decimalLike = (value: string) => ({ toString: () => value });

  const fullyScoredApplication = {
    id: 'app-1',
    creditLimit: decimalLike('3000000'), // above2.5M -> weight 2, point 3
    dsgir: 30, // below40 -> weight 3, point 1
    operationOfInstitution: 12, // above10Years -> weight 2, point 1
    satisfactoryPerformance: 4, // above3Years -> weight 1, point 1
    parentsBorrowingsWithBFIs: 'US', // weight 1, point 1
    sourceOfIncome: 'FIXED', // weight 1, point 1
  };

  beforeEach(() => {
    findUniqueMock = jest.fn().mockResolvedValue(fullyScoredApplication);
    updateMock = jest.fn().mockResolvedValue(fullyScoredApplication);

    const prisma = {
      loanApplication: {
        findUnique: findUniqueMock,
        update: updateMock,
      },
    } as unknown as PrismaService;

    service = new CreditScoreService(prisma);
  });

  describe('calculateByApplicationId', () => {
    it('throws NotFoundException when the application does not exist', async () => {
      findUniqueMock.mockResolvedValueOnce(null);
      await expect(service.calculateByApplicationId('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('computes a weighted score when every scoring field is set, including a Decimal creditLimit', async () => {
      const result = await service.calculateByApplicationId('app-1');
      // weights:   creditLimit(2) + dsgir(3) + opInst(2) + satPerf(1) + parents(1) + source(1) = 10
      // points:    3               + 1         + 1          + 1          + 1           + 1
      // weightedScore: 6            + 3         + 2          + 1          + 1           + 1      = 14
      // maxPossibleScore: 2×3 + 3×3 + 2×3 + 1×3 + 1×3 + 1×3 = 6+9+6+3+3+3 = 30
      // percentage: 14/30 × 100 = 46.67%
      expect(result.overall.weight).toBe(30); // maxPossibleScore
      expect(result.overall.score).toBe(14); // totalWeightScore (= Σ weight×point)
      expect(result.overall.percentage).toBe(46.67);
    });

    it('still scores creditLimit when it arrives as a Decimal-like object, not a plain number', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...fullyScoredApplication,
        dsgir: null,
        operationOfInstitution: null,
        satisfactoryPerformance: null,
        parentsBorrowingsWithBFIs: null,
        sourceOfIncome: null,
      });
      const result = await service.calculateByApplicationId('app-1');
      // Only creditLimit (above2.5M): weight 2, point 3, maxPoint 3
      // totalWeightScore = 2×3 = 6; maxPossibleScore = 2×3 = 6; percentage = 100%
      expect(result.overall.weight).toBe(6); // maxPossibleScore
      expect(result.overall.score).toBe(6);
      expect(result.overall.percentage).toBe(100);
    });

    it('does not throw and simply excludes fields that are null', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...fullyScoredApplication,
        parentsBorrowingsWithBFIs: null,
        sourceOfIncome: null,
      });

      const result = await service.calculateByApplicationId('app-1');
      // Active fields: creditLimit(w=2,p=3) + dsgir(w=3,p=1) + opInst(w=2,p=1) + satPerf(w=1,p=1)
      // totalWeightScore = 6+3+2+1 = 12
      // maxPossibleScore = 2×3 + 3×3 + 2×3 + 1×3 = 6+9+6+3 = 24
      // percentage = 12/24 × 100 = 50%
      expect(result.overall.weight).toBe(24); // maxPossibleScore
      expect(result.overall.score).toBe(12);
      expect(result.overall.percentage).toBe(50);
    });

    it('does not throw and excludes a field whose value matches no configured rule', async () => {
      findUniqueMock.mockResolvedValueOnce({
        ...fullyScoredApplication,
        parentsBorrowingsWithBFIs: 'SOME_UNRECOGNIZED_VALUE',
      });

      const result = await service.calculateByApplicationId('app-1');
      // Active: creditLimit(w=2,p=3) + dsgir(w=3,p=1) + opInst(w=2,p=1) + satPerf(w=1,p=1) + source(w=1,p=1)
      // totalWeightScore = 6+3+2+1+1 = 13
      // maxPossibleScore = 2×3 + 3×3 + 2×3 + 1×3 + 1×3 = 6+9+6+3+3 = 27
      // percentage = 13/27 × 100 = 48.15%
      expect(result.overall.weight).toBe(27); // maxPossibleScore
      expect(result.overall.score).toBe(13);
      expect(result.overall.percentage).toBe(48.15);
    });

    it('returns a zero score without throwing when every field is null', async () => {
      findUniqueMock.mockResolvedValueOnce({
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

  describe('grade resolution', () => {
    // calculate() is exercised directly here to hit exact percentage
    // boundaries without reverse-engineering weight/point combinations.
    it('grades below 51% as A1 / Low Risk', () => {
      const result = service.calculate({
        maxPossibleScore: 100,
        totalWeightScore: 50,
      });
      expect(result.overall.grade).toBe('A1');
      expect(result.overall.riskCategory).toBe('LOW_RISK');
    });

    it('treats exactly 51% as A2, not A1 (strict "<" boundary)', () => {
      const result = service.calculate({
        maxPossibleScore: 100,
        totalWeightScore: 51,
      });
      expect(result.overall.grade).toBe('A2');
      expect(result.overall.riskCategory).toBe('MODERATE_RISK');
    });

    it('treats exactly 61% as A3, not A2', () => {
      const result = service.calculate({
        maxPossibleScore: 100,
        totalWeightScore: 61,
      });
      expect(result.overall.grade).toBe('A3');
    });

    it('treats exactly 71% as A4, not A3', () => {
      const result = service.calculate({
        maxPossibleScore: 100,
        totalWeightScore: 71,
      });
      expect(result.overall.grade).toBe('A4');
    });

    it('leaves >= 80% explicitly ungraded (NA / UNGRADED), not a fallback grade', () => {
      const result = service.calculate({
        maxPossibleScore: 100,
        totalWeightScore: 80,
      });
      expect(result.overall.grade).toBe('NA');
      expect(result.overall.riskCategory).toBe('UNGRADED');
    });

    it('leaves a worst-case 100% score ungraded', () => {
      const result = service.calculate({
        maxPossibleScore: 30,
        totalWeightScore: 30,
      });
      expect(result.overall.grade).toBe('NA');
    });
  });

  describe('saveCreditScoreParameterByApplicationId', () => {
    it('throws NotFoundException when the application does not exist', async () => {
      findUniqueMock.mockResolvedValueOnce(null);
      await expect(
        service.saveCreditScoreParameterByApplicationId(
          { score: {} },
          'missing',
        ),
      ).rejects.toThrow(NotFoundException);
      expect(updateMock).not.toHaveBeenCalled();
    });

    it('persists the raw inputs and the computed grade/score/percentage/riskCategory in one update', async () => {
      const score = {
        creditLimit: 3000000,
        dsgir: 30,
        operationOfInstitution: 12,
        satisfactoryPerformance: 4,
        parentsBorrowingsWithBFIs: 'US' as const,
        sourceOfIncome: 'FIXED' as const,
      };

      const result = await service.saveCreditScoreParameterByApplicationId(
        { score },
        'app-1',
      );

      expect(updateMock).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: {
          creditLimit: 3000000,
          dsgir: 30,
          operationOfInstitution: 12,
          satisfactoryPerformance: 4,
          parentsBorrowingsWithBFIs: 'US',
          sourceOfIncome: 'FIXED',
          riskGrade: result.overall.grade,
          totalScore: result.overall.score,
          totalPercentage: result.overall.percentage,
          creditRiskScoring: result.overall.riskCategory,
        },
      });
      // totalWeightScore = 2×3 + 3×1 + 2×1 + 1×1 + 1×1 + 1×1 = 6+3+2+1+1+1 = 14
      // maxPossibleScore = 2×3 + 3×3 + 2×3 + 1×3 + 1×3 + 1×3 = 30
      // percentage = 14/30 × 100 = 46.67% → A1 (Low Risk, < 51%)
      expect(result.overall.score).toBe(14);
      expect(result.overall.weight).toBe(30); // maxPossibleScore
      expect(result.overall.percentage).toBe(46.67);
      expect(result.overall.grade).toBe('A1');
      expect(result.overall.riskCategory).toBe('LOW_RISK');
    });
  });
});
