import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// The apply wizard has 4 pages (About You / Identity / Family & Education /
// Review & Submit) — kept in lockstep with ApplicationWizard.tsx.
export class UpdateStepDto {
  @ApiProperty({ minimum: 1, maximum: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  currentStep: number;
}
