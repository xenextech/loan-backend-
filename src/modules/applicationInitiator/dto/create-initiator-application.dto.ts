import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateInitiatorApplicationDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsDateString()
  relationshipStartDate?: string;

  @IsOptional()
  @IsString()
  customerGroup?: string;

  @IsOptional()
  @IsNumber()
  obligorNo?: number;

  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  correspondenceAddress?: string;

  @IsOptional()
  @IsString()
  contactNo?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  repaymentSource?: string;

  @IsOptional()
  @IsString()
  citizenshipNo?: string;

  @IsOptional()
  @IsDateString()
  citizenshipIssuedDate?: string;

  @IsOptional()
  @IsString()
  citizenshipIssuedPlace?: string;

  @IsOptional()
  @IsString()
  nidNo?: string;

  @IsOptional()
  @IsString()
  panNo?: string;

  @IsOptional()
  @IsString()
  licenseNo?: string;

  @IsOptional()
  @IsString()
  bankingRelationship?: string;

  @IsOptional()
  @IsBoolean()
  isBlacklisted?: boolean;
}
