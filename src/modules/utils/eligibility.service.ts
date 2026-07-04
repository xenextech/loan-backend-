import { Injectable } from '@nestjs/common';
import { EligibilityDto } from './dto/eligibility.dto';
import { StudyType } from '../../common/enums';

type EligibilityResult = 'ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'NOT_ELIGIBLE';

// Minimum expected salary multiples per study type (simple rule engine)
const SALARY_TO_EMI_RATIO = 3; // EMI should not exceed 1/3 of monthly salary
const INTEREST_RATE = 10.5;
const DEFAULT_TENURE_MONTHS = 60; // 5 years

const MAX_LOAN_BY_STUDY_TYPE: Record<StudyType, number> = {
  [StudyType.PROGRAM]: 1_000_000,
  [StudyType.COURSE]: 500_000,
  [StudyType.DIPLOMA]: 750_000,
  [StudyType.CERTIFICATION]: 300_000,
};

@Injectable()
export class EligibilityService {
  check(dto: EligibilityDto): {
    result: EligibilityResult;
    explanation: string;
    details: Record<string, unknown>;
  } {
    const { studyType, expectedSalary, loanAmount } = dto;

    const maxAllowed = MAX_LOAN_BY_STUDY_TYPE[studyType];
    const r = INTEREST_RATE / 12 / 100;
    const n = DEFAULT_TENURE_MONTHS;
    const pow = Math.pow(1 + r, n);
    const estimatedEmi = (loanAmount * r * pow) / (pow - 1);
    const maxAffordableEmi = expectedSalary / SALARY_TO_EMI_RATIO;

    const details = {
      maxLoanForStudyType: maxAllowed,
      estimatedMonthlyEmi: Math.round(estimatedEmi),
      maxAffordableEmi: Math.round(maxAffordableEmi),
      salaryToEmiRatioUsed: SALARY_TO_EMI_RATIO,
      assumedTenureMonths: DEFAULT_TENURE_MONTHS,
      assumedInterestRate: `${INTEREST_RATE}%`,
    };

    if (loanAmount > maxAllowed) {
      return {
        result: 'NOT_ELIGIBLE',
        explanation: `Loan amount NPR ${loanAmount.toLocaleString()} exceeds the maximum of NPR ${maxAllowed.toLocaleString()} for a ${studyType.toLowerCase()} program.`,
        details,
      };
    }

    if (expectedSalary === 0) {
      return {
        result: 'POSSIBLY_ELIGIBLE',
        explanation:
          'No expected salary provided. Eligibility depends on guarantor income and other factors. Please speak to a loan officer.',
        details,
      };
    }

    if (estimatedEmi <= maxAffordableEmi) {
      return {
        result: 'ELIGIBLE',
        explanation: `You appear eligible. Your estimated EMI of NPR ${Math.round(estimatedEmi).toLocaleString()} is within the affordable range based on your expected salary of NPR ${expectedSalary.toLocaleString()}.`,
        details,
      };
    }

    if (estimatedEmi <= maxAffordableEmi * 1.5) {
      return {
        result: 'POSSIBLY_ELIGIBLE',
        explanation: `Your estimated EMI of NPR ${Math.round(estimatedEmi).toLocaleString()} may be slightly high relative to your expected salary. A loan officer will review your full profile including guarantor income.`,
        details,
      };
    }

    return {
      result: 'NOT_ELIGIBLE',
      explanation: `Your estimated EMI of NPR ${Math.round(estimatedEmi).toLocaleString()} significantly exceeds what is affordable on an expected salary of NPR ${expectedSalary.toLocaleString()}. Consider requesting a lower amount or a longer tenure.`,
      details,
    };
  }
}
