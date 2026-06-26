import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { IdentityType, Gender, Occupation } from '../../../common/enums';

export class Step2Dto {
  // Identity
  @ApiPropertyOptional({ enum: IdentityType })
  @IsOptional()
  @IsEnum(IdentityType)
  identityType?: IdentityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  identityNumber?: string;

  @ApiPropertyOptional({ description: 'Full name as printed on the identity document' })
  @IsOptional()
  @IsString()
  identityName?: string;

  @ApiPropertyOptional({ example: '1998-05-20' })
  @Transform(({ value }) => value || undefined)
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: Occupation })
  @IsOptional()
  @IsEnum(Occupation)
  occupation?: Occupation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuedDistrict?: string;

  @ApiPropertyOptional({ example: '2015-03-10' })
  @Transform(({ value }) => value || undefined)
  @IsOptional()
  @IsDateString()
  issuedDate?: string;

  // Address
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  municipality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ward?: string;
}
