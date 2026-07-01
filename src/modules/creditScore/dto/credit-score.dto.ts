import { IsEnum } from 'class-validator';
import {
  CreditFacilitySize,
  Dsgir,
  OperationOfInstitution,
  ParentsBorrowingsWithBFIs,
  SatisfactoryPerformance,
  SourceOfIncome,
} from '../enum/credit-score.enum';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class ScoreDto {
  @ApiProperty({ enum: CreditFacilitySize })
  @IsEnum(CreditFacilitySize)
  creditFacilitySize!: CreditFacilitySize;

  @ApiProperty({ enum: Dsgir })
  @IsEnum(Dsgir)
  dsgir!: Dsgir;

  @ApiProperty({ enum: OperationOfInstitution })
  @IsEnum(OperationOfInstitution)
  operationOfInstitution!: OperationOfInstitution;

  @ApiProperty({ enum: SatisfactoryPerformance })
  @IsEnum(SatisfactoryPerformance)
  satisfactoryPerformance!: SatisfactoryPerformance;

  @ApiProperty({ enum: ParentsBorrowingsWithBFIs })
  @IsEnum(ParentsBorrowingsWithBFIs)
  parentsBorrowingsWithBFIs!: ParentsBorrowingsWithBFIs;

  @ApiProperty({ enum: SourceOfIncome })
  @IsEnum(SourceOfIncome)
  sourceOfIncome!: SourceOfIncome;
}

export class CreateCreditScoringDto {
  @ApiProperty({ type: ScoreDto })
  @ValidateNested()
  @Type(() => ScoreDto)
  score!: ScoreDto;
  isVerified?: boolean;
}
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
    above3Years: CreditParameter;
    from1To3Years: CreditParameter;
    below1Year: CreditParameter;
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
