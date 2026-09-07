import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsBoolean,
  Max,
  Min,
} from 'class-validator';
import { IsMoneyAmount } from '../../../common/decorators/numeric-range.decorators';

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
  @IsInt()
  @Min(0)
  @Max(2147483647, { message: 'obligorNumber must not exceed 2147483647' })
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
  nidNumber?: string;

  @ApiPropertyOptional({ description: 'PAN No.' })
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiPropertyOptional({ description: 'License No.' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'Banking Relationship' })
  @IsOptional()
  @IsString()
  bankingRelationship?: string;

  // Collected only when bankingRelationship is "EXISTING".
  @ApiPropertyOptional({
    description: 'Name of the bank for the existing account',
  })
  @IsOptional()
  @IsString()
  existingBankName?: string;

  @ApiPropertyOptional({ description: 'Existing account number' })
  @IsOptional()
  @IsString()
  existingBankAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Existing savings account balance' })
  @IsOptional()
  @IsMoneyAmount()
  existingBankSavingsAmount?: number;

  @ApiPropertyOptional({
    description: 'Existing outstanding loan amount at the bank',
  })
  @IsOptional()
  @IsMoneyAmount()
  existingBankLoanAmount?: number;

  @ApiPropertyOptional({ description: 'Is Blacklisted' })
  @IsOptional()
  @IsBoolean()
  isBlacklisted?: boolean;
}
