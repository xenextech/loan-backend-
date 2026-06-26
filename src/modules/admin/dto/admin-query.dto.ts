import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { StudyType } from '../../../common/enums';

export class AdminQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by full name, email, or phone number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: StudyType })
  @IsOptional()
  @IsEnum(StudyType)
  studyType?: StudyType;

  @ApiPropertyOptional({ description: 'Minimum loan amount (NPR)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  loanAmountMin?: number;

  @ApiPropertyOptional({ description: 'Maximum loan amount (NPR)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  loanAmountMax?: number;

  @ApiPropertyOptional({ description: 'Filter from submission date (ISO 8601)' })
  @IsOptional()
  @IsString()
  submittedFrom?: string;

  @ApiPropertyOptional({ description: 'Filter to submission date (ISO 8601)' })
  @IsOptional()
  @IsString()
  submittedTo?: string;

  @ApiPropertyOptional({ default: 'submittedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
