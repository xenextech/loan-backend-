import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CollectionActivityType, RepaymentFrequency } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { IsPercentage } from '../../../common/decorators/numeric-range.decorators';
import { UserRole } from '../../../common/enums';

// Who a Credit Manager may hand a Needs-Review loan off to — a deliberate
// subset of UserRole, not the whole enum (Credit Manager reviews it
// themselves if left unassigned; Student/Parent/College/Admin aren't part of
// the internal review chain).
export const REVIEW_ASSIGNABLE_ROLES = [
  UserRole.INITIATOR,
  UserRole.SUPPORTER,
  UserRole.CHECKER,
  UserRole.APPROVER,
] as const;
export type ReviewAssignableRole = (typeof REVIEW_ASSIGNABLE_ROLES)[number];

// EMI amount is deliberately absent — it's a computed output of principal +
// rate + tenure, not an independently settable input.
export class ConfigureLoanServicingDto {
  @ApiPropertyOptional({
    example: 12.5,
    description:
      'Final interest rate (%, 0-100). Defaults to the approved rate if omitted.',
  })
  @IsOptional()
  @IsPercentage({ message: 'finalInterestRate must be between 0 and 100' })
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
      'EMI/installment cadence — how often the borrower pays. Defaults to Monthly.',
  })
  @IsOptional()
  @IsEnum(RepaymentFrequency)
  repaymentFrequency?: RepaymentFrequency;

  @ApiPropertyOptional({
    enum: RepaymentFrequency,
    example: RepaymentFrequency.YEARLY,
    description:
      'Interest compounding cadence — can differ from repaymentFrequency (e.g. interest compounds yearly but EMIs are paid monthly). Defaults to repaymentFrequency if omitted, matching pre-existing behavior.',
  })
  @IsOptional()
  @IsEnum(RepaymentFrequency)
  interestFrequency?: RepaymentFrequency;

  @ApiPropertyOptional({
    example: 495000,
    description:
      'Credit Manager override of the final disbursement/principal amount used for servicing math (EMI, total repayable, schedule). Defaults to the actual Disbursement.totalDisbursedAmount — visible in the response as disbursedAmount either way. Must be greater than 0 and cannot exceed the Approver-approved amount (loanApplication.creditLimit) — rejected with 400 otherwise. Only meaningful once at least one tranche has been disbursed. The original approved and disbursed amounts are never overwritten — both remain visible alongside the override for audit purposes.',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  finalPrincipalAmount?: number;

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
  activityType!: CollectionActivityType;

  @ApiProperty({ example: 'Called borrower, promised payment by Friday.' })
  @IsString()
  @MinLength(1)
  notes!: string;

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
  reason!: string;

  @ApiPropertyOptional({
    enum: REVIEW_ASSIGNABLE_ROLES,
    example: UserRole.APPROVER,
    description:
      "Which role should review this loan (Initiator/Supporter/Checker/Approver) — the Credit Manager's choice. Omit to keep reviewing it themselves.",
  })
  @IsOptional()
  @IsIn(REVIEW_ASSIGNABLE_ROLES, {
    message: `assignedRole must be one of: ${REVIEW_ASSIGNABLE_ROLES.join(', ')}`,
  })
  assignedRole?: ReviewAssignableRole;
}

export class ResolveReviewDto {
  @ApiPropertyOptional({
    example: 'Borrower cleared arrears, resuming normal schedule.',
  })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}

export class CompleteClearanceDto {
  @ApiPropertyOptional({
    example: 'All installments settled on schedule, no arrears.',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
