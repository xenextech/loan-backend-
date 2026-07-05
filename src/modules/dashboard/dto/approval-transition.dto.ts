import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStage } from '../../../common/enums';

export class RejectApplicationDto {
  @ApiProperty({ example: 'CICL bureau hit — adverse entry at 3 BFIs' })
  @IsString()
  reason: string;
}

export class SendBackApplicationDto {
  @ApiProperty({
    example: 'Trace map missing for Plot 781. Re-upload and resubmit.',
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    enum: ApplicationStage,
    description: 'Stage this application is being rewound to',
    example: ApplicationStage.INITIATED,
  })
  @IsOptional()
  @IsEnum(ApplicationStage)
  toStage?: ApplicationStage;
}
