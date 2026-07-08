import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { IdentityType, Gender, Occupation } from '../../../common/enums';
import { IsBsDate } from '../../../common/validators/is-bs-date.validator';

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

  @ApiPropertyOptional({
    description: 'Full name as printed on the identity document',
  })
  @IsOptional()
  @IsString()
  identityName?: string;

  @ApiPropertyOptional({
    example: '1998-05-20',
    description:
      'Date of birth, AD/Gregorian (YYYY-MM-DD). Deprecated — use dobAd instead. ' +
      'Kept for backward compatibility; behaves identically to dobAd.',
    deprecated: true,
  })
  @Transform(({ value }: { value: unknown }) => value || undefined)
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example: '1998-05-20',
    description:
      'Date of birth, AD/Gregorian (YYYY-MM-DD). Either dobAd or dobBs may be ' +
      'supplied — the backend derives whichever one is missing and keeps both ' +
      'in sync. AD is the canonical value used for storage and age calculation.',
  })
  @Transform(({ value }: { value: unknown }) => value || undefined)
  @IsOptional()
  @IsDateString()
  dobAd?: string;

  @ApiPropertyOptional({
    example: '2055-02-06',
    description:
      'Date of birth, Bikram Sambat (YYYY-MM-DD). Either dobAd or dobBs may be ' +
      'supplied — the backend derives whichever one is missing and keeps both ' +
      'in sync. Supported years: 2000-2090 BS.',
  })
  @Transform(({ value }: { value: unknown }) => value || undefined)
  @IsOptional()
  @IsBsDate()
  dobBs?: string;

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
  @Transform(({ value }: { value: unknown }) => value || undefined)
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
