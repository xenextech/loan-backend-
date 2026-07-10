import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateCreditScoringDto,
  CreditScoreResponseDto,
  ScoreDto,
  ScoreRule,
} from './dto/credit-score.dto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ParentsBorrowingsWithBFIs,
  SourceOfIncome,
} from './enum/credit-score.enum';
import {
  RiskCategory,
  CreditGrade,
  LOW_RISK_THRESHOLD,
  MODERATE_RISK_THRESHOLD,
  MEDIUM_RISK_THRESHOLD,
  MEDIUM_HIGH_RISK_THRESHOLD,
  CREDIT_PARAMETERS,
} from './constant/credit-parameters.constant';

type ScoreInput = number | string | null | undefined;

@Injectable()
export class CreditScoreService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns null (rather than throwing) when input is null/undefined or an
  // unrecognized value — several ScoreDto fields (e.g. parentsBorrowingsWithBFIs)
  // are optional on LoanApplication and are frequently unset, so "no matching
  // rule" is an expected case, not an error.
  private getScore<T extends ScoreRule>(
    rules: readonly T[],
    input: ScoreInput,
  ) {
    if (input === null || input === undefined) return null;

    const rule = rules.find((r) => {
      if (typeof input === 'number') {
        if (r.min !== undefined && input < r.min) return false;
        if (r.max !== undefined && input > r.max) return false;
        return true;
      }

      return r.value === input;
    });

    if (!rule) return null;

    return {
      weight: rule.weight,
      point: rule.point,
      weightScore: rule.weight * rule.point,
    };
  }

  calculate(request: {
    // maxPossibleScore = Σ(weight × maxPoint) — mirrors the spreadsheet's
    // implicit constant 30 (= sum(weight_i * max points in parameter_i)).
    // This is the CORRECT denominator, matching Risk Rating!D9 = E20/30.
    // DO NOT use totalWeight (= Σweight = 10) here — that gives a wrong result.
    maxPossibleScore: number;
    totalWeightScore: number;
  }): CreditScoreResponseDto {
    const percentage =
      request.maxPossibleScore === 0
        ? 0
        : Number(
            (
              (request.totalWeightScore / request.maxPossibleScore) *
              100
            ).toFixed(2),
          );
    const { grade, riskCategory } = this.resolveGrade(percentage);

    return {
      overall: {
        score: request.totalWeightScore,
        weight: request.maxPossibleScore,
        percentage,
        grade,
        riskCategory,
      },
    };
  }

  // Pure read/preview — computes live from the application's current
  // scoring inputs, never persists. See saveCreditScoreParameterByApplicationId
  // below for the path that writes riskGrade/totalScore/totalPercentage/
  // creditRiskScoring back to the application.
  async calculateByApplicationId(
    applicationId: string,
  ): Promise<CreditScoreResponseDto> {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const request = this.buildScoreRequest({
      // Prisma returns Decimal columns as Decimal.js instances, not plain
      // numbers — converted here so getScore()'s numeric-rule matching
      // actually runs instead of silently falling through to a value-equality
      // check that no creditLimit rule defines.
      creditLimit: application.creditLimit
        ? Number(application.creditLimit)
        : null,
      dsgir: application.dsgir,
      operationOfInstitution: application.operationOfInstitution,
      satisfactoryPerformance: application.satisfactoryPerformance,
      parentsBorrowingsWithBFIs:
        application.parentsBorrowingsWithBFIs as ParentsBorrowingsWithBFIs | null,
      sourceOfIncome: application.sourceOfIncome as SourceOfIncome | null,
    });

    return this.calculate(request);
  }

  // The one write path for scoring inputs — persists the six raw parameters
  // plus the computed grade/score/percentage/riskCategory into
  // riskGrade/totalScore/totalPercentage/creditRiskScoring in the same
  // update, so those columns (read directly by the approval summary,
  // applications list, and checker queue) always reflect the last time this
  // engine actually ran, instead of standing values an Initiator typed by
  // hand.
  async saveCreditScoreParameterByApplicationId(
    data: CreateCreditScoringDto,
    applicationId: string,
  ): Promise<CreditScoreResponseDto> {
    const application = await this.prisma.loanApplication.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const request = this.buildScoreRequest(data.score);
    const result = this.calculate(request);

    await this.prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        creditLimit: data.score.creditLimit,
        dsgir: data.score.dsgir,
        operationOfInstitution: data.score.operationOfInstitution,
        satisfactoryPerformance: data.score.satisfactoryPerformance,
        parentsBorrowingsWithBFIs: data.score.parentsBorrowingsWithBFIs,
        sourceOfIncome: data.score.sourceOfIncome,
        riskGrade: result.overall.grade,
        totalScore: result.overall.score,
        totalPercentage: result.overall.percentage,
        creditRiskScoring: result.overall.riskCategory,
      },
    });

    return result;
  }

  private buildScoreRequest(request: ScoreDto): {
    maxPossibleScore: number;
    totalWeightScore: number;
  } {
    let maxPossibleScore = 0;
    let totalWeightScore = 0;

    for (const [key, value] of Object.entries(request)) {
      const rules = CREDIT_PARAMETERS[key as keyof typeof CREDIT_PARAMETERS];
      if (!rules) continue;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const score = this.getScore(
        rules as readonly ScoreRule[],
        value as ScoreInput,
      );
      if (!score) continue;

      // maxPossibleScore accumulates weight × maxPoint (not just weight) so
      // the denominator matches Σ(weight_i * max_points_i) = 30, mirroring
      // the spreadsheet's D9 = E20/30 formula.
      const maxPoint = Math.max(
        ...(rules as readonly ScoreRule[]).map((r) => r.point),
      );
      maxPossibleScore += score.weight * maxPoint;
      totalWeightScore += score.weightScore;
    }

    return { maxPossibleScore, totalWeightScore };
  }

  // Mirrors the source spreadsheet's Risk Rating!D10/D11 — grade and risk
  // category are always derived from the exact same band, so they're
  // resolved together rather than via separately-thresholded functions.
  // percentage >= MEDIUM_HIGH_RISK_THRESHOLD (80%) is explicitly ungraded
  // (CreditGrade.NA / RiskCategory.UNGRADED), matching Excel's blank D10/D11
  // for that range rather than inventing a new top grade.
  private resolveGrade(percentage: number): {
    grade: CreditGrade;
    riskCategory: RiskCategory;
  } {
    if (percentage < LOW_RISK_THRESHOLD) {
      return { grade: CreditGrade.A1, riskCategory: RiskCategory.LOW };
    }
    if (percentage < MODERATE_RISK_THRESHOLD) {
      return { grade: CreditGrade.A2, riskCategory: RiskCategory.MODERATE };
    }
    if (percentage < MEDIUM_RISK_THRESHOLD) {
      return { grade: CreditGrade.A3, riskCategory: RiskCategory.MEDIUM };
    }
    if (percentage < MEDIUM_HIGH_RISK_THRESHOLD) {
      return { grade: CreditGrade.A4, riskCategory: RiskCategory.MEDIUM_HIGH };
    }
    return { grade: CreditGrade.NA, riskCategory: RiskCategory.UNGRADED };
  }
}
