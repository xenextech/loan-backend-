import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationChannel } from '../../../common/enums';

export class CreateNotificationTemplateDto {
  @ApiProperty({ example: 'EMI due reminder' })
  @IsString()
  name: string;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiPropertyOptional({ example: 'EMI due soon' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    example:
      'Dear {name}, your EMI of Rs {amount} is due on {date}. Pay via {link}. — Unnati Loan',
  })
  @IsString()
  body: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateNotificationTemplateDto extends PartialType(
  CreateNotificationTemplateDto,
) {}
