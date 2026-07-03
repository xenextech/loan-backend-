import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsPositive,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollegeInfoDto {
  @ApiProperty({ example: 'Ace Institute of Management' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  collegeName: string;

  @ApiPropertyOptional({ example: 'Kathmandu, Nepal' })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  collegeAddress?: string;

  @ApiPropertyOptional({ example: '2/059/060' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  collegeRegNo?: string;

  @ApiPropertyOptional({ example: 'Pokhara University' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  collegeAffiliation?: string;

  @ApiPropertyOptional({ example: '+977-1-XXXXXXX' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  collegePhone?: string;

  @ApiPropertyOptional({ example: 'info@college.edu.np' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  collegeEmail?: string;

  @ApiPropertyOptional({ example: 'www.college.edu.np' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  collegeWebsite?: string;

  @ApiPropertyOptional({ example: 'https://college.edu.np/logo.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class DocumentInfoDto {
  @ApiProperty({ example: 'AIM/OL/2081/0031' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  refNo: string;

  @ApiPropertyOptional({ example: '2024-09-01' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  issuedDateAD?: string;

  @ApiPropertyOptional({ example: '2081 Bhadra 16' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  issuedDateBS?: string;

  @ApiPropertyOptional({ example: '2025-09-01' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  validUntilAD?: string;

  @ApiPropertyOptional({ example: '2082 Bhadra 16' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  validUntilBS?: string;
}

export class StudentInfoDto {
  @ApiProperty({ example: 'Ram Bahadur Thapa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  studentFullName: string;

  @ApiPropertyOptional({ example: '2001-05-15' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  studentDobAD?: string;

  @ApiPropertyOptional({ example: '2058 Jestha 01' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  studentDobBS?: string;

  @ApiPropertyOptional({ example: '12-34-56789' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  citizenshipNumber?: string;

  @ApiPropertyOptional({ example: 'Hari Bahadur Thapa' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  fatherName?: string;

  @ApiPropertyOptional({ example: 'Sita Thapa' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  motherName?: string;

  @ApiPropertyOptional({ example: 'Kathmandu' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  permanentAddress?: string;

  @ApiPropertyOptional({ example: 'Kathmandu' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ example: 'Bagmati' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  province?: string;
}

export class ProgramInfoDto {
  @ApiPropertyOptional({ example: 'BBA' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  programName?: string;

  @ApiPropertyOptional({ example: 'Bachelor of Business Administration' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  programFullName?: string;

  @ApiPropertyOptional({ example: 'Pokhara University' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  programAffiliation?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  durationYears?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  totalSemesters?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  creditHours?: number;

  @ApiPropertyOptional({ example: '2081-082' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  academicYearBS?: string;

  @ApiPropertyOptional({ example: 'Bhadra 2081' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  intakeMonthBS?: string;
}

export class FeesInfoDto {
  @ApiPropertyOptional({ example: 15000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  admissionFee?: number;

  @ApiPropertyOptional({ example: 45000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tuitionPerSem?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  examFeePerSem?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  labFeePerSem?: number;

  @ApiPropertyOptional({ example: 428000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalApprox?: number;
}

export class SignatoryDto {
  @ApiProperty({ example: 'Dr. Krishna Prasad Sharma' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'Campus Chief' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  designation: string;

  @ApiPropertyOptional({ example: 'Official Stamp' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  stampAreaLabel?: string;
}

export class QrInfoDto {
  @ApiPropertyOptional({ example: 'OL-20810031' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  qrToken?: string;

  @ApiPropertyOptional({ example: 'verify.genzloan.com.np/doc/OL-20810031' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  qrVerifyUrl?: string;
}

export class CreateOfferLetterDto {
  @ApiProperty({ type: CollegeInfoDto })
  @ValidateNested()
  @Type(() => CollegeInfoDto)
  college: CollegeInfoDto;

  @ApiProperty({ type: DocumentInfoDto })
  @ValidateNested()
  @Type(() => DocumentInfoDto)
  document: DocumentInfoDto;

  @ApiProperty({ type: StudentInfoDto })
  @ValidateNested()
  @Type(() => StudentInfoDto)
  student: StudentInfoDto;

  @ApiPropertyOptional({ type: ProgramInfoDto })
  @ValidateNested()
  @Type(() => ProgramInfoDto)
  @IsOptional()
  program?: ProgramInfoDto;

  @ApiPropertyOptional({ type: FeesInfoDto })
  @ValidateNested()
  @Type(() => FeesInfoDto)
  @IsOptional()
  fees?: FeesInfoDto;

  @ApiPropertyOptional({ type: [String], example: ['Student must maintain 50% attendance'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  conditions?: string[];

  @ApiPropertyOptional({ type: [SignatoryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignatoryDto)
  @IsOptional()
  signatories?: SignatoryDto[];

  @ApiPropertyOptional({ type: QrInfoDto })
  @ValidateNested()
  @Type(() => QrInfoDto)
  @IsOptional()
  qr?: QrInfoDto;
}
