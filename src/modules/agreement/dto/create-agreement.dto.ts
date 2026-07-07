import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  ValidateNested,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgreementCollegeDto {
  @ApiProperty({ example: 'Ace Institute of Management' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  collegeName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(300)
  collegeAddress?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  collegeRegNo?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  collegeAffiliation?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(30)
  collegePhone?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(150)
  collegeEmail?: string;
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  collegeWebsite?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() logoUrl?: string;
}

export class AgreementDocumentDto {
  @ApiProperty({ example: 'AIM/BON/2081/0031' })
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
}

export class AgreementStudentDto {
  @ApiProperty({ example: 'Ram Bahadur Thapa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  studentFullName: string;

  @ApiPropertyOptional({ example: '1234567' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  tuRollNo?: string;

  @ApiPropertyOptional({ example: 'AIM-BBA-2081-0041' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  enrollmentNo?: string;

  @ApiPropertyOptional({ example: 'BBA' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  programName?: string;

  @ApiPropertyOptional({ example: '2nd' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  currentYear?: string;

  @ApiPropertyOptional({ example: '3' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currentSemester?: string;

  @ApiPropertyOptional({ example: '2081-082' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  academicYearBS?: string;

  @ApiPropertyOptional({
    example: 'Active',
    enum: ['Active', 'On Leave', 'Suspended'],
  })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  studentStatus?: string;
}

export class AgreementCertificationsDto {
  @ApiProperty({ example: true, description: 'Student is currently enrolled' })
  @IsBoolean()
  isEnrolled: boolean;

  @ApiProperty({ example: false, description: 'Student has academic backlogs' })
  @IsBoolean()
  hasBacklogs: boolean;

  @ApiProperty({
    example: false,
    description: 'Disciplinary hold placed on student',
  })
  @IsBoolean()
  disciplinaryHold: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Pending fee dues in NPR (0 = no dues)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  feeDueRs?: number;
}

export class AgreementQrDto {
  @ApiPropertyOptional({ example: 'BON-20810031' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  qrToken?: string;

  @ApiPropertyOptional({ example: 'verify.Unnati.com.np/doc/BON-20810031' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  qrVerifyUrl?: string;
}

export class CreateAgreementDto {
  @ApiProperty({ type: AgreementCollegeDto })
  @ValidateNested()
  @Type(() => AgreementCollegeDto)
  college: AgreementCollegeDto;

  @ApiProperty({ type: AgreementDocumentDto })
  @ValidateNested()
  @Type(() => AgreementDocumentDto)
  document: AgreementDocumentDto;

  @ApiProperty({ type: AgreementStudentDto })
  @ValidateNested()
  @Type(() => AgreementStudentDto)
  student: AgreementStudentDto;

  @ApiProperty({ type: AgreementCertificationsDto })
  @ValidateNested()
  @Type(() => AgreementCertificationsDto)
  certifications: AgreementCertificationsDto;

  @ApiPropertyOptional({ type: AgreementQrDto })
  @ValidateNested()
  @Type(() => AgreementQrDto)
  @IsOptional()
  qr?: AgreementQrDto;
}
