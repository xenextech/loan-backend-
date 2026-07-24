import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStage } from '../../../common/enums';

export class RejectApplicationDto {
  @ApiProperty({ example: 'CICL bureau hit — adverse entry at 3 BFIs' })
  @IsString()
  reason!: string;
}

export class SendBackApplicationDto {
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
