export interface ScoreFieldDto {
  value: any;
  score: number;
  weight: number;
}

export interface CreditScoreRequest {
  student?: Record<string, ScoreFieldDto>;
  parent?: Record<string, ScoreFieldDto>;
  college?: Record<string, ScoreFieldDto>;
}
export interface ScoreFieldResponseDto {
  value: any;
  score: number;
  weight: number;
}

export interface ScoreSummaryDto {
  score: number;
  weight: number;
  percentage: number;
  grade: string;
  riskCategory: string;
}

export interface RoleScoreResponseDto {
  summary: ScoreSummaryDto;

  [field: string]: ScoreFieldResponseDto | ScoreSummaryDto;
}

export interface CreditScoreResponseDto {
  overall: ScoreSummaryDto;

  [role: string]: RoleScoreResponseDto | ScoreSummaryDto;
}

interface CreditParameter {
  weight: number;
  point: number;
  readonly weightScore: number;
}

export interface CreditParameters {
  creditFacilitySize: {
    below1M: CreditParameter;
    from1MTo2point5M: CreditParameter;
    above2point5M: CreditParameter;
  };

  dsgir: {
    below40: CreditParameter;
    from40To45: CreditParameter;
    above45: CreditParameter;
  };

  operationOfInstitution: {
    above10Years: CreditParameter;
    from5To10Years: CreditParameter;
    below5Years: CreditParameter;
  };

  satisfactoryPerformance: {
    above3yrs: CreditParameter;
    from1To3yrs: CreditParameter;
    below1yr: CreditParameter;
  };

  parentsBorrowingsWithBFIs: {
    borrowingFromUs: CreditParameter;
    borrowingFromOtherBFI: CreditParameter;
    borrowingFromOtherBFIs: CreditParameter;
  };

  sourceOfIncome: {
    fixedIncome: CreditParameter;
    salaryRentBusiness: CreditParameter;
    mixedIncome: CreditParameter;
  };
}
export type CreditParameterSelection = Array<string>;
export type ParameterCategory = Record<string, CreditParameter>;
