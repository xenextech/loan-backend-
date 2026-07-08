import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export const APPLICATION_LIST_FILTERS = [
  'my-queue',
  'pending',
  'approval',
  'disbursement',
  'rejected',
  'sent-back',
  'action-needed',
  'pending-disbursement',
  'disbursed',
] as const;
export type ApplicationListFilter = (typeof APPLICATION_LIST_FILTERS)[number];

export class DashboardApplicationsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by borrower name, ref no, citizenship no, or phone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: APPLICATION_LIST_FILTERS,
    description:
      'Queue filter — "my-queue" depends on the requesting staff role (SUPPORTER sees INITIATED, CREDIT_MANAGER/CHECKER sees SUPPORTED, APPROVER sees CHECKING)',
  })
  @IsOptional()
  @IsIn(APPLICATION_LIST_FILTERS)
  filter?: ApplicationListFilter;

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
