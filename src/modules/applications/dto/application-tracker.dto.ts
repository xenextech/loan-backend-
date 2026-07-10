import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RepaymentFrequency } from '@prisma/client';
import { UserRole } from '../../../common/enums';

// One entry per stage in the application lifecycle. New stages can be added
// to ApplicationTrackerService's STAGE_DEFINITIONS without changing this enum's
// consumers — the timeline is always driven off that array.
export enum TrackerStageKey {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  COLLEGE = 'COLLEGE',
  INITIATOR = 'INITIATOR',
  SUPPORTER = 'SUPPORTER',
  CREDIT_MANAGER_REVIEW = 'CREDIT_MANAGER_REVIEW',
  APPROVER = 'APPROVER',
  CREDIT_MANAGER_SETUP = 'CREDIT_MANAGER_SETUP',
  DISBURSEMENT = 'DISBURSEMENT',
}

export enum TrackerStageStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  SENT_BACK = 'SENT_BACK',
  SKIPPED = 'SKIPPED',
}

export enum TrackerOverallStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  REJECTED = 'REJECTED',
  SENT_BACK = 'SENT_BACK',
  COMPLETED = 'COMPLETED',
}

export class TrackerStageDto {
  @ApiProperty({ enum: TrackerStageKey })
  key: TrackerStageKey;

  @ApiProperty({ example: 'Supporter Verification' })
  label: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Role that owns this stage',
  })
  role: UserRole;

  @ApiProperty({ enum: TrackerStageStatus })
  status: TrackerStageStatus;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  completedAt: Date | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'supporter@unnati.com',
    description:
      'Display label for who completed this stage — an email for staff-driven stages, a role label (e.g. "Parent") for public-link stages that have no login',
  })
  completedBy: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Rejection or send-back reason, only present on REJECTED/SENT_BACK stages',
  })
  reason: string | null;
}

// ── Repayment section — populated once the Credit Manager has configured
// loan servicing and the EMI schedule exists (LoanAccount.configuredAt is
// set). Sourced entirely from DashboardRepaymentService (getRepaymentStatus/
// getSchedule) and the shared resolveEffectiveLoanTerms() util — no
// repayment math is recomputed here, only reshaped for the student view.

export class RepaymentLoanSummaryDto {
  @ApiProperty({
    example: 1000000,
    description: 'The Approver-approved amount (loanApplication.creditLimit).',
  })
  approvedAmount: number;

  @ApiProperty({
    example: 950000,
    description:
      'The final principal the EMI schedule is computed from — the Credit ' +
      "Manager's override if one was set, else the actual disbursed " +
      'amount, else the approved amount.',
  })
  finalDisbursementAmount: number;

  @ApiProperty({ example: 12.5 })
  interestRate: number;

  @ApiProperty({
    enum: RepaymentFrequency,
    description:
      'Interest compounding cadence — the closest tracked concept to ' +
      '"interest type" in this system. Amortization is always ' +
      'reducing-balance; flat-rate is not a supported loan type.',
  })
  interestFrequency: RepaymentFrequency;

  @ApiProperty({
    enum: RepaymentFrequency,
    description: 'EMI/installment payment cadence.',
  })
  repaymentFrequency: RepaymentFrequency;

  @ApiProperty({ example: 36 })
  tenureMonths: number;

  @ApiProperty({ example: 3 })
  gracePeriodMonths: number;

  @ApiProperty({
    example: 1080000,
    description: 'Sum of every EMI amount across the full schedule.',
  })
  totalRepayable: number;
}

export class RepaymentNextPaymentDto {
  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  dueDate: Date | null;

  @ApiPropertyOptional({ nullable: true })
  amount: number | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 5,
    description: 'Negative when the next unpaid installment is overdue.',
  })
  daysRemaining: number | null;

  @ApiProperty({
    example: 'ON_TRACK',
    description:
      'One of NOT_CONFIGURED / ON_TRACK / OVERDUE / NEEDS_REVIEW / CLEARED.',
  })
  status: string;
}

export class RepaymentScheduleEntryDto {
  @ApiProperty() installmentNumber: number;
  @ApiProperty({ type: String, format: 'date-time' }) dueDate: Date;
  @ApiProperty() emiAmount: number;
  @ApiProperty() principalComponent: number;
  @ApiProperty() interestComponent: number;
  @ApiProperty() outstandingBalance: number;
  @ApiProperty({ example: 'UPCOMING' }) status: string;
}

export class RepaymentProgressDto {
  @ApiProperty() totalInstallments: number;
  @ApiProperty() paidInstallments: number;
  @ApiProperty() remainingInstallments: number;
  @ApiProperty() outstandingBalance: number;
  @ApiProperty() totalPaid: number;

  @ApiProperty({
    description:
      'Same figure as outstandingBalance (total repayable minus total ' +
      'paid) — surfaced under both names since there is no separately ' +
      'tracked "remaining principal" concept in this system.',
  })
  totalRemaining: number;
}

export class RepaymentTrackerDto {
  @ApiProperty({ type: RepaymentLoanSummaryDto })
  loanSummary: RepaymentLoanSummaryDto;

  @ApiProperty({ type: RepaymentNextPaymentDto })
  nextPayment: RepaymentNextPaymentDto;

  @ApiProperty({ type: [RepaymentScheduleEntryDto] })
  schedule: RepaymentScheduleEntryDto[];

  @ApiProperty({ type: RepaymentProgressDto })
  progress: RepaymentProgressDto;
}

export class ApplicationTrackerResponseDto {
  @ApiProperty()
  applicationId: string;

  @ApiPropertyOptional({ nullable: true })
  applicationNumber: string | null;

  @ApiPropertyOptional({ enum: TrackerStageKey, nullable: true })
  currentStageKey: TrackerStageKey | null;

  @ApiPropertyOptional({ nullable: true })
  currentStageLabel: string | null;

  @ApiPropertyOptional({ enum: UserRole, nullable: true })
  currentOwnerRole: UserRole | null;

  @ApiProperty({ enum: TrackerOverallStatus })
  currentStatus: TrackerOverallStatus;

  @ApiProperty({
    example: 62,
    description:
      'completedStages / totalStages, rounded to the nearest integer',
  })
  progressPercentage: number;

  @ApiProperty()
  completedStages: number;

  @ApiProperty()
  totalStages: number;

  @ApiProperty({ type: [TrackerStageDto] })
  timeline: TrackerStageDto[];

  @ApiPropertyOptional({
    type: RepaymentTrackerDto,
    nullable: true,
    description:
      'Populated once the Credit Manager has configured loan servicing and ' +
      'the EMI schedule has been generated; null before that.',
  })
  repayment: RepaymentTrackerDto | null;
}
