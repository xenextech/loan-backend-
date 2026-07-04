import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class ParentVerificationDto {
  @ApiPropertyOptional({ example: 'Ram Prasad Sharma' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+9779801234567' })
  @IsOptional()
  @Matches(/^(\+977)?[0-9]{10}$/, { message: 'Invalid phone number' })
  phone?: string;

  @ApiPropertyOptional({
    example: '+9779809876543',
    description: 'Alternate contact number',
  })
  @IsOptional()
  @Matches(/^(\+977)?[0-9]{10}$/, { message: 'Invalid contact number' })
  contact?: string;

  @ApiPropertyOptional({
    example: '12-34-56789',
    description: 'Citizenship certificate number',
  })
  @IsOptional()
  @IsString()
  citizenshipNumber?: string;

  @ApiPropertyOptional({
    example: 'Nepal Bank Limited',
    description: 'Bank where salary is deposited',
  })
  @IsOptional()
  @IsString()
  salaryBankName?: string;

  @ApiPropertyOptional({
    example: '0123456789012',
    description: 'Bank account number',
  })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;
}
