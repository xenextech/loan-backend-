import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  IsEnum,
  IsNumber,
  IsUUID,
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collegeName?: string;

  // College Marketplace linkage — when set, the service re-derives
  // collegeName/courseName/boardUniversity/courseDuration/tuitionFee from the
  // catalog instead of trusting the client-supplied text for those fields.
  @ApiPropertyOptional({
    description:
      'College Marketplace college UUID (only when applying via the marketplace)',
  })
  @IsOptional()
  @IsUUID()
  collegeId?: string;

  @ApiPropertyOptional({
    description:
      'College Marketplace course UUID (only when applying via the marketplace)',
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

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
  @Max(15_00_000)
  loanAmount?: number;

  @ApiPropertyOptional({ description: 'Estimated monthly EMI based on the chosen loan amount and duration' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimatedEmi?: number;
}
