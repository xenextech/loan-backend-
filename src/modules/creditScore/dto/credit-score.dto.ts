import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { IsMoneyAmount } from '../../../common/decorators/numeric-range.decorators';
import {
  ParentsBorrowingsWithBFIs,
  SourceOfIncome,
} from '../enum/credit-score.enum';

export class ScoreDto {
  @ApiPropertyOptional({ example: 1200000 })
  @IsOptional()
  @IsMoneyAmount()
  creditLimit?: number | null;

  @ApiPropertyOptional({ example: 42, description: 'DSGIR, as a percentage' })
  @IsOptional()
  @IsInt()
  dsgir?: number | null;

  @ApiPropertyOptional({
    example: 8,
    description: "Institution's years of operation",
  })
  @IsOptional()
  @IsInt()
  operationOfInstitution?: number | null;

  @ApiPropertyOptional({
    example: 2,
    description: "Years of the customer's satisfactory performance",
  })
  @IsOptional()
  @IsInt()
  satisfactoryPerformance?: number | null;

  @ApiPropertyOptional({ enum: ParentsBorrowingsWithBFIs })
  @IsOptional()
  @IsEnum(ParentsBorrowingsWithBFIs)
  parentsBorrowingsWithBFIs?: ParentsBorrowingsWithBFIs | null;

  @ApiPropertyOptional({ enum: SourceOfIncome })
  @IsOptional()
  @IsEnum(SourceOfIncome)
  sourceOfIncome?: SourceOfIncome | null;
}

export class CreateCreditScoringDto {
  @ApiProperty({ type: ScoreDto })
  @ValidateNested()
  @Type(() => ScoreDto)
  score!: ScoreDto;
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
  creditLimit: {
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

export interface ScoreRule {
  min?: number;
  max?: number;
  value?: string | boolean;

  weight: number;
  point: number;
}
