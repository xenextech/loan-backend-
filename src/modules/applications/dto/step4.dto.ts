import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class Step4Dto {
  @ApiProperty({ description: 'Applicant confirms all information is accurate' })
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  @IsBoolean()
  informationAccurate: boolean;

  @ApiProperty({ description: 'Applicant authorizes verification of submitted information' })
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  @IsBoolean()
  authorizeVerification: boolean;

  @ApiPropertyOptional({ description: 'Email of parent/guardian — magic link is sent directly to them' })
  @IsOptional()
  @IsEmail()
  parentContactEmail?: string;

  @ApiPropertyOptional({ description: 'Email of college/institution — magic link is sent directly to them' })
  @IsOptional()
  @IsEmail()
  collegeContactEmail?: string;
}
