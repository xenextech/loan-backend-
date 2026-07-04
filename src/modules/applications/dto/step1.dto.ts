import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StudyType } from '../../../common/enums';

export class Step1Dto {
  // Personal Information
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(/^(\+977)?[0-9]{10}$/, { message: 'Invalid phone number' })
  phoneNumber?: string;

  // Study Information
  @ApiPropertyOptional({ enum: StudyType })
  @IsOptional()
  @IsEnum(StudyType)
  studyType?: StudyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  boardUniversity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseDuration?: string;

  // Loan Information
  @ApiPropertyOptional({ description: 'Loan amount in NPR (max 10,00,000)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5_000_000)
  loanAmount?: number;
}
