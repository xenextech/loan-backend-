import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CollectionActivityType, RepaymentFrequency } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

// Loan amount is deliberately absent — the Approver's approved credit limit
// is locked and never overridden by loan servicing configuration. EMI amount
// is also absent — it's a computed output of amount + rate + tenure, not an
// independently settable input.
export class ConfigureLoanServicingDto {
  @ApiPropertyOptional({
    example: 12.5,
    description:
      'Final interest rate (%). Defaults to the approved rate if omitted.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  finalInterestRate?: number;

  @ApiPropertyOptional({
    example: 36,
    description:
      'Final tenure in months. Defaults to the approved tenure if omitted. Must be a multiple of 3 for quarterly, or 12 for yearly repayment frequency.',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  finalTenureMonths?: number;

  @ApiPropertyOptional({
    enum: RepaymentFrequency,
    example: RepaymentFrequency.MONTHLY,
    description:
      'Drives both interest compounding and installment period. Defaults to Monthly.',
  })
  @IsOptional()
  @IsEnum(RepaymentFrequency)
  repaymentFrequency?: RepaymentFrequency;

  @ApiPropertyOptional({
    example: 3,
    description:
      'Number of months to delay the first installment by. Does not change the amortization math — it only pushes back when the schedule starts.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gracePeriodMonths?: number;

  @ApiPropertyOptional({ example: '2026-08-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  emiStartDate?: string;
}

export class RecordCollectionActivityDto {
  @ApiProperty({ enum: CollectionActivityType })
  @IsEnum(CollectionActivityType)
  activityType: CollectionActivityType;

  @ApiProperty({ example: 'Called borrower, promised payment by Friday.' })
  @IsString()
  @MinLength(1)
  notes: string;

  @ApiPropertyOptional({ example: 'student' })
  @IsOptional()
  @IsString()
  contactedPerson?: string;
}

export class CollectionActivityQueryDto extends PaginationDto {}

export class FlagNeedsReviewDto {
  @ApiProperty({ example: 'Three consecutive missed installments.' })
  @IsString()
  @MinLength(1)
  reason: string;
}

export class ResolveReviewDto {
  @ApiPropertyOptional({
    example: 'Borrower cleared arrears, resuming normal schedule.',
  })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
