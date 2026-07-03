import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateInitiatorApplicationDto {
  @ApiPropertyOptional({ description: 'Name of the Customer' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Relationship Start Date',
    example: '2020-01-15',
  })
  @IsOptional()
  @IsDateString()
  relationshipStartDate?: string;

  @ApiPropertyOptional({ description: 'Group' })
  @IsOptional()
  @IsString()
  customerGroup?: string;

  @ApiPropertyOptional({ description: 'Obligor No.' })
  @IsOptional()
  @IsNumber()
  obligorNumber?: number;

  @ApiPropertyOptional({ description: 'Permanent Address' })
  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @ApiPropertyOptional({ description: 'Correspondence Address' })
  @IsOptional()
  @IsString()
  correspondenceAddress?: string;

  @ApiPropertyOptional({ description: 'Contact No.' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Profession' })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({ description: 'Repayment Source' })
  @IsOptional()
  @IsString()
  repaymentSource?: string;

  @ApiPropertyOptional({ description: 'Citizenship No.' })
  @IsOptional()
  @IsString()
  citizenshipNumber?: string;

  @ApiPropertyOptional({
    description: 'Citizenship Issued Date',
    example: '2010-06-01',
  })
  @IsOptional()
  @IsDateString()
  citizenshipIssuedDate?: string;

  @ApiPropertyOptional({ description: 'Citizenship Issued Place' })
  @IsOptional()
  @IsString()
  citizenshipIssuedPlace?: string;

  @ApiPropertyOptional({ description: 'NID No.' })
  @IsOptional()
  @IsString()
  nidNo?: string;

  @ApiPropertyOptional({ description: 'PAN No.' })
  @IsOptional()
  @IsString()
  panNo?: string;

  @ApiPropertyOptional({ description: 'License No.' })
  @IsOptional()
  @IsString()
  licenseNo?: string;

  @ApiPropertyOptional({ description: 'Banking Relationship' })
  @IsOptional()
  @IsString()
  bankingRelationship?: string;

  @ApiPropertyOptional({ description: 'Is Blacklisted' })
  @IsOptional()
  @IsBoolean()
  isBlacklisted?: boolean;
}
