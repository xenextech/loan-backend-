import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { GeneratedAgreementType } from '../../../common/enums';

export class CreateGeneratedAgreementDto {
  @ApiProperty()
  @IsString()
  applicationId!: string;

  @ApiProperty({ enum: GeneratedAgreementType })
  @IsEnum(GeneratedAgreementType)
  agreementType!: GeneratedAgreementType;
}

export class GeneratedAgreementQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicationId?: string;
}
