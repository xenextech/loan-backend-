import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { MaritalStatus, FeeStructureMethod } from '../../../common/enums';

export class Step3Dto {
  // Family Information
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grandfatherName?: string;

  @ApiPropertyOptional({ enum: MaritalStatus })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @ApiPropertyOptional({ description: 'Required if married' })
  @IsOptional()
  @IsString()
  spouseName?: string;

  // Education — Expected Salary
  @ApiPropertyOptional({ description: 'Expected monthly salary after course (NPR)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  expectedSalary?: number;

  // Fee Structure
  @ApiPropertyOptional({ enum: FeeStructureMethod })
  @IsOptional()
  @IsEnum(FeeStructureMethod)
  feeStructureMethod?: FeeStructureMethod;

  @ApiPropertyOptional({ description: 'URL of fee structure (if method is LINK)' })
  @IsOptional()
  @IsUrl()
  feeStructureUrl?: string;

  @ApiPropertyOptional({ description: 'Manual fee details (if method is MANUAL)' })
  @IsOptional()
  @IsString()
  feeStructureText?: string;
}
