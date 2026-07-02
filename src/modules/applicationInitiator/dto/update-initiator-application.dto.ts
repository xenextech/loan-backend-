import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInitiatorApplicationDto {
  // =========================
  // 1. Basic Information
  // =========================

  @ApiPropertyOptional({ description: 'Name of the customer', example: 'John Doe' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Start date of banking relationship', example: '2023-01-15' })
  @IsOptional()
  @IsDateString()
  relationshipStartDate?: string;

  @ApiPropertyOptional({ description: 'Group name if the customer belongs to a corporate group', example: 'ABC Group' })
  @IsOptional()
  @IsString()
  customerGroup?: string;

  @ApiPropertyOptional({ description: 'Unique obligor number assigned to the customer', example: 102938 })
  @IsOptional()
  @IsNumber()
  obligorNo?: number;

  @ApiPropertyOptional({ description: 'Permanent residential or registered address', example: 'Kathmandu, Nepal' })
  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @ApiPropertyOptional({ description: 'Mailing or correspondence address', example: 'Lalitpur, Nepal' })
  @IsOptional()
  @IsString()
  correspondenceAddress?: string;

  @ApiPropertyOptional({ description: 'Primary contact phone number', example: '+977-9801234567' })
  @IsOptional()
  @IsString()
  contactNo?: string;

  @ApiPropertyOptional({ description: 'Profession or line of business', example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({ description: 'Primary source of loan repayment', example: 'Salary / Business Revenue' })
  @IsOptional()
  @IsString()
  repaymentSource?: string;

  @ApiPropertyOptional({ description: 'Citizenship certificate number', example: '12-34-56-7890' })
  @IsOptional()
  @IsString()
  citizenshipNo?: string;

  @ApiPropertyOptional({ description: 'Date of citizenship issuance', example: '2015-05-20' })
  @IsOptional()
  @IsDateString()
  citizenshipIssuedDate?: string;

  @ApiPropertyOptional({ description: 'District where citizenship was issued', example: 'Kathmandu' })
  @IsOptional()
  @IsString()
  citizenshipIssuedPlace?: string;

  @ApiPropertyOptional({ description: 'National Identity Card (NID) number', example: '9876543210' })
  @IsOptional()
  @IsString()
  nidNo?: string;

  @ApiPropertyOptional({ description: 'Permanent Account Number (PAN)', example: '601234567' })