import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsUUID,
  ValidateNested,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrollCollegeDto {
  @ApiProperty({ example: 'Ace Institute of Management' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  collegeName: string;

  @ApiPropertyOptional({
    example: 'AIM',
    description: 'Short code used in ref number prefix',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  collegeCode?: string;

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

export class EnrollDocumentDto {
  @ApiProperty({
    example: 'AIM/ENROLL/2081/0031',
    description: 'Format: [CODE]/ENROLL/[BS_YEAR]/[4-DIGIT]',
  })
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

export class EnrollStudentDto {
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

export class EnrollCertificationsDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isEnrolled: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  hasBacklogs: boolean;

  @ApiProperty({ example: false })
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

export class EnrollQrDto {
  @ApiPropertyOptional({ example: 'ENR-20810031' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  qrToken?: string;

  @ApiPropertyOptional({ example: 'verify.Unnati.com.np/doc/ENR-20810031' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  qrVerifyUrl?: string;
}

export class CreateEnrollmentCertificateDto {
  @ApiPropertyOptional({
    description:
      "Optional Loan Application UUID to link this enrollment certificate to. When set, the linked application's student and staff participants (initiator/supporter/checker/approver) are notified and the document becomes visible in the student's Document Vault.",
    example: 'b3e1c2a4-1234-4a5b-9c8d-abcdef123456',
  })
  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @ApiProperty({ type: EnrollCollegeDto })
  @ValidateNested()
  @Type(() => EnrollCollegeDto)
  college: EnrollCollegeDto;

  @ApiProperty({ type: EnrollDocumentDto })
  @ValidateNested()
  @Type(() => EnrollDocumentDto)
  document: EnrollDocumentDto;

  @ApiProperty({ type: EnrollStudentDto })
  @ValidateNested()
  @Type(() => EnrollStudentDto)
  student: EnrollStudentDto;

  @ApiProperty({ type: EnrollCertificationsDto })
  @ValidateNested()
  @Type(() => EnrollCertificationsDto)
  certifications: EnrollCertificationsDto;

  @ApiPropertyOptional({ type: EnrollQrDto })
  @ValidateNested()
  @Type(() => EnrollQrDto)
  @IsOptional()
  qr?: EnrollQrDto;
}
