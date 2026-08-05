import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CourseCategory, DegreeLevel } from '../../../common/enums';

export class QueryCoursesAdminDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Matches course name (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter to a single college UUID' })
  @IsOptional()
  @IsUUID()
  collegeId?: string;

  @ApiPropertyOptional({ enum: CourseCategory })
  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @ApiPropertyOptional({ enum: DegreeLevel })
  @IsOptional()
  @IsEnum(DegreeLevel)
  degreeLevel?: DegreeLevel;

  @ApiPropertyOptional({
    default: false,
    description: 'Admin-only: include soft-deleted (inactive) courses',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  @IsBoolean()
  includeInactive?: boolean;
}
