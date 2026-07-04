import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsNumber, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class OverdueQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['1-30', '31-90', '90+'] })
  @IsOptional()
  @IsIn(['1-30', '31-90', '90+'])
  bucket?: '1-30' | '31-90' | '90+';
}

export class MarkEmiPaidDto {
  @ApiProperty({ example: 10439 })
  @IsNumber()
  paidAmount: number;

  @ApiProperty({ example: '2026-07-25T00:00:00.000Z' })
  @IsISO8601()
  paidDate: string;
}
