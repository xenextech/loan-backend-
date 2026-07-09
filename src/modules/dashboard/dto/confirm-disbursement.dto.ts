import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator';

export class ConfirmDisbursementDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  trancheNumber!: number;

  @ApiProperty({ example: 710000 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ example: 'College A/C' })
  @IsOptional()
  @IsString()
  accountCredited?: string;

  @ApiPropertyOptional({ example: 710 })
  @IsOptional()
  @IsNumber()
  commissionAmount?: number;

  @ApiPropertyOptional({ example: '2026-06-29T11:30:00.000Z' })
  @IsOptional()
  @IsISO8601()
  date?: string;
}
