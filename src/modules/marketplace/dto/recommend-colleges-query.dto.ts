import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class RecommendCollegesQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    default: false,
    description:
      "Include the college already tied to the student's latest application " +
      '(excluded by default, since recommending what they already picked is not useful).',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  @IsBoolean()
  includeCurrentCollege?: boolean;
}
