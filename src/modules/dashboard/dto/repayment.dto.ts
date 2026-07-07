import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsNumber, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export const OVERDUE_BUCKETS = [
  '1-30',
  '31-90',
  '91-180',
  '181-365',
  '365+',
] as const;
export type OverdueBucket = (typeof OVERDUE_BUCKETS)[number];

export class OverdueQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: OVERDUE_BUCKETS })
  @IsOptional()
  @IsIn(OVERDUE_BUCKETS)
  bucket?: OverdueBucket;
}

export class MarkEmiPaidDto {
  @ApiProperty({ example: 10439 })
  @IsNumber()
  paidAmount: number;

  @ApiProperty({ example: '2026-07-25T00:00:00.000Z' })
  @IsISO8601()
  paidDate: string;
}
