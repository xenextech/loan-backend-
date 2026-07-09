import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DisbursementConditionStatus } from '../../../common/enums';

export class CreateDisbursementConditionDto {
  @ApiProperty({ example: 'Property registration deed executed and submitted' })
  @IsString()
  label!: string;
}

export class UpdateDisbursementConditionDto {
  @ApiProperty({ enum: DisbursementConditionStatus })
  @IsEnum(DisbursementConditionStatus)
  status!: DisbursementConditionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remarks?: string;
}
