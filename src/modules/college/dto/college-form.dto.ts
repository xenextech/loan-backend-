import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollegeFormDto {
  @ApiProperty({ example: 'Tribhuvan University' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  collegeName: string;

  @ApiProperty({ example: 'admissions@tu.edu.np' })
  @IsEmail()
  @IsNotEmpty()
  collegeEmail: string;

  @ApiProperty({ example: 'Ram Prasad Sharma' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contactPerson: string;

  @ApiPropertyOptional({ example: '9801234567' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  contactPhone?: string;

  @ApiProperty({
    description:
      "Whether the college confirms the student's application/enrollment",
  })
  @IsBoolean()
  isApplicationVerified: boolean;

  @ApiPropertyOptional({ example: 'Student is enrolled in BCA 3rd semester.' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  verificationNotes?: string;
}
