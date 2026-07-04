import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import {
  NotificationChannel,
  NotificationDeliveryStatus,
} from '../../../common/enums';

export class NotificationLogQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationDeliveryStatus })
  @IsOptional()
  @IsEnum(NotificationDeliveryStatus)
  deliveryStatus?: NotificationDeliveryStatus;

  @ApiPropertyOptional()
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
