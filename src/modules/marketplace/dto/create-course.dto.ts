import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseCategory, DegreeLevel } from '../../../common/enums';

export class CareerOutcomeDto {
  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'NPR 40,000 – 80,000 / month' })
  @IsOptional()
  @IsString()
  salaryRange?: string;
}

export class CurriculumSemesterDto {
  @ApiProperty({ example: 'Semester 1' })
  @IsString()
  semester!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  subjects!: string[];
}

export class FeeBreakdownItemDto {
  @ApiProperty({ example: 'Tuition Fee' })
  @IsString()
  label!: string;

  @ApiProperty({ example: 350000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;
}

export class CreateCourseDto {
  @ApiProperty({ description: 'College UUID this course belongs to' })
  @IsUUID()
  collegeId!: string;

  @ApiProperty({ example: 'Bachelor of Information Management' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: CourseCategory })
  @IsEnum(CourseCategory)
  category!: CourseCategory;

  @ApiProperty({ enum: DegreeLevel })
  @IsEnum(DegreeLevel)
  degreeLevel!: DegreeLevel;

  @ApiProperty({
    example: '4 Years',
    description:
      'Must match the frontend apply form\'s fixed duration vocabulary (e.g. "6 Months", "1 Year", "1.5 Years", "2 Years", "2.5 Years", "3 Years", "4 Years", "5 Years", "6 Years")',
  })
  @IsString()
  duration!: string;

  @ApiPropertyOptional({ example: 48 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      'Long-form "About this course" content for a future richer About section',
  })
  @IsOptional()
  @IsString()
  aboutContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eligibility?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  seatsAvailable?: number;

  @ApiProperty({ example: 400000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tuitionFee!: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  admissionFee?: number;

  @ApiProperty({ example: 415000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalFee!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningOutcomes?: string[];

  @ApiPropertyOptional({ type: [CareerOutcomeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CareerOutcomeDto)
  careerOutcomes?: CareerOutcomeDto[];

  @ApiPropertyOptional({ type: [CurriculumSemesterDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurriculumSemesterDto)
  curriculum?: CurriculumSemesterDto[];

  @ApiPropertyOptional({ type: [FeeBreakdownItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeBreakdownItemDto)
  feeBreakdown?: FeeBreakdownItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industryDemand?: string;

  @ApiPropertyOptional({ example: 'Fall & Spring' })
  @IsOptional()
  @IsString()
  intake?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  credits?: number;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  medium?: string;

  @ApiPropertyOptional({ example: 'Full-time' })
  @IsOptional()
  @IsString()
  attendanceType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;
}
