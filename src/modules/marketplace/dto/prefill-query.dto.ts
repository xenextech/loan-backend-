import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class PrefillQueryDto {
  @ApiProperty({ description: 'College UUID selected in the marketplace' })
  @IsUUID()
  collegeId!: string;

  @ApiProperty({ description: 'Course UUID selected in the marketplace' })
  @IsUUID()
  courseId!: string;
}
