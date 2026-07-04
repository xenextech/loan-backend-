import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class DashboardApplicationsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by borrower name, ref no, citizenship no, or phone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by branch' })
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z' })
  @IsOptional()
  @IsISO8601()
  dateTo?: string;
}
