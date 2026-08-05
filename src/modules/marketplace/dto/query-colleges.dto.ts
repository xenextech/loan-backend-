import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CourseCategory, DegreeLevel } from '../../../common/enums';

export class QueryCollegesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Matches college name (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Affiliated university UUID' })
  @IsOptional()
  @IsUUID()
  universityId?: string;

  @ApiPropertyOptional({ enum: CourseCategory })
  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @ApiPropertyOptional({ enum: DegreeLevel })
  @IsOptional()
  @IsEnum(DegreeLevel)
  degreeLevel?: DegreeLevel;

  @ApiPropertyOptional({
    description: 'Matches courses with this exact duration label',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxFee?: number;

  @ApiPropertyOptional({
    description: 'Sort field: name | startingTuition | createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    default: false,
    description: 'Admin-only: include soft-deleted (inactive) colleges',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  @IsBoolean()
  includeInactive?: boolean;
}
