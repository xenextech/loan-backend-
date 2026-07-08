import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
}
