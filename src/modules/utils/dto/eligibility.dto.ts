import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { StudyType } from '../../../common/enums';

export class EligibilityDto {
  @ApiProperty({ enum: StudyType, example: StudyType.PROGRAM })
  @IsEnum(StudyType)
  studyType: StudyType;

  @ApiProperty({
    description: 'Expected monthly salary after course (NPR)',
    example: 50000,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  expectedSalary: number;

  @ApiProperty({ description: 'Requested loan amount (NPR)', example: 300000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @Max(1_000_000)
  loanAmount: number;
}
