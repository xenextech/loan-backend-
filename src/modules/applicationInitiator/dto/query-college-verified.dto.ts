import {
  IsOptional,
  IsString,
} from 'class-validator/types/decorator/decorators';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCollegeVerifiedDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
