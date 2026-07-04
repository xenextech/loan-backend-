import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  CommissionEntryStatus,
  CommissionPartnerType,
  CommissionRateType,
} from '../../../common/enums';

export class CreateCommissionPartnerDto {
  @ApiProperty({ enum: CommissionPartnerType })
  @IsEnum(CommissionPartnerType)
  partnerType: CommissionPartnerType;

  @ApiProperty({ example: 'Best Finance Co. (BFCL)' })
  @IsString()
  name: string;

  @ApiProperty({ enum: CommissionRateType })
  @IsEnum(CommissionRateType)
  rateType: CommissionRateType;

  @ApiProperty({ example: 0.1 })
  @IsNumber()
  rateValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mouReference?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCommissionPartnerDto extends PartialType(
  CreateCommissionPartnerDto,
) {}

export class CommissionPartnerQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CommissionPartnerType })
  @IsOptional()
  @IsEnum(CommissionPartnerType)
  partnerType?: CommissionPartnerType;
}

export class CreateCommissionEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicationId?: string;

  @ApiProperty()
  @IsString()
  partnerId: string;

  @ApiProperty({ example: 710 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @IsISO8601()
  month: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceRef?: string;
}

export class UpdateCommissionEntryDto {
  @ApiPropertyOptional({ enum: CommissionEntryStatus })
  @IsOptional()
  @IsEnum(CommissionEntryStatus)
  status?: CommissionEntryStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoiceRef?: string;
}

export class CommissionEntryQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({ enum: CommissionEntryStatus })
  @IsOptional()
  @IsEnum(CommissionEntryStatus)
  status?: CommissionEntryStatus;
}
