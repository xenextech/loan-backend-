import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStage } from '../../../common/enums';

// Branch/designation the acting role recorded for their own decision — stored
// on that role's own *Branch/*Post columns (see schema.prisma's Approval
// Section), never the Initiator's single application-wide `branch` field.
// Shared by every real workflow-transition DTO below (support/check/approve/
// reject/send-back) since any of these roles can record it.
export class RoleAttestationDto {
  @ApiPropertyOptional({ example: 'Kathmandu Branch' })
  @IsOptional()
  @IsString()
  branchName?: string;

  @ApiPropertyOptional({ example: 'BM' })
  @IsOptional()
  @IsString()
  designation?: string;

  // Typed digital-signature placeholder — stored on that role's own
  // *Signature column (see schema.prisma's Approval Section), same as
  // branchName/designation above.
  @ApiPropertyOptional({ example: 'signed-by-ram-sharma' })
  @IsOptional()
  @IsString()
  signature?: string;
}

export class SupportApplicationDto extends RoleAttestationDto {}
export class CheckApplicationDto extends RoleAttestationDto {}
export class ApproveApplicationDto extends RoleAttestationDto {}

export class RejectApplicationDto extends RoleAttestationDto {
  @ApiProperty({ example: 'CICL bureau hit — adverse entry at 3 BFIs' })
  @IsString()
  reason!: string;
}

export class SendBackApplicationDto extends RoleAttestationDto {
  @ApiProperty({
    example: 'Trace map missing for Plot 781. Re-upload and resubmit.',
  })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({
    enum: ApplicationStage,
    description: 'Stage this application is being rewound to',
    example: ApplicationStage.INITIATED,
  })
  @IsOptional()
  @IsEnum(ApplicationStage)
  toStage?: ApplicationStage;
}

export class SendStudentConsentDto {
  @ApiProperty({
    description:
      'Custom terms & conditions text the Approver is sending to the student for consent',
    example:
      'By proceeding, you agree that disbursement is contingent on submission of the signed loan agreement within 7 days of approval...',
  })
  @IsString()
  termsText!: string;
}

export class PepScreeningDto {
  @ApiProperty({
    description: 'true if the applicant is a Politically Exposed Person',
    example: false,
  })
  @IsBoolean()
  status!: boolean;

  @ApiPropertyOptional({ example: 'Cross-checked against NRB Rokka list' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
