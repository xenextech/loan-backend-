import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { AuditCategory } from '../../../common/enums';

export class AuditQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AuditCategory })
  @IsOptional()
  @IsEnum(AuditCategory)
  category?: AuditCategory;

  @ApiPropertyOptional({ description: 'Filter by acting user id' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by application id' })
  @IsOptional()
  @IsString()
  applicationId?: string;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z' })
  @IsOptional()
  @IsISO8601()
  dateTo?: string;
}
