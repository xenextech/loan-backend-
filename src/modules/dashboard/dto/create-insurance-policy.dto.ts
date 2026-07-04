import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInsurancePolicyDto {
  @ApiProperty({ description: 'Loan application this policy is tied to' })
  @IsString()
  applicationId: string;

  @ApiProperty({ example: 'IMG-PROP-2080-092' })
  @IsString()
  policyNumber: string;

  @ApiProperty({ example: 'IME General Insurance' })
  @IsString()
  insurer: string;

  @ApiPropertyOptional({ example: 'Property insurance' })
  @IsOptional()
  @IsString()
  policyType?: string;

  @ApiProperty({ example: 1200000 })
  @IsNumber()
  sumInsured: number;

  @ApiPropertyOptional({ example: 8500 })
  @IsOptional()
  @IsNumber()
  premiumAmount?: number;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({ example: '2027-01-01T00:00:00.000Z' })
  @IsISO8601()
  expiryDate: string;
}
