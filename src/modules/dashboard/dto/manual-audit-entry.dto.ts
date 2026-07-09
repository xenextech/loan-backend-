import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { AuditAction, AuditCategory } from '../../../common/enums';

export class ManualAuditEntryDto {
  @ApiProperty({ enum: AuditAction, default: AuditAction.MANUAL_AUDIT_ENTRY })
  @IsEnum(AuditAction)
  action!: AuditAction;

  @ApiProperty({ enum: AuditCategory })
  @IsEnum(AuditCategory)
  category!: AuditCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicationId?: string;

  @ApiPropertyOptional({ description: 'Reason / free-text details' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Arbitrary structured payload' })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
