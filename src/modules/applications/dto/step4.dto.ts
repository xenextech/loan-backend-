import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
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
}
