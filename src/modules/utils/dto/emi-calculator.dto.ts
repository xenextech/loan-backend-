import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class EmiCalculatorDto {
  @ApiProperty({ description: 'Loan amount in NPR', example: 500000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @Max(1_000_000)
  loanAmount: number;

  @ApiProperty({ description: 'Annual interest rate (%)', example: 10.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(50)
  interestRate: number;

  @ApiProperty({ description: 'Loan tenure in months', example: 60 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(360)
  tenureMonths: number;

  @ApiPropertyOptional({
    description:
      'Installments per year (12 = monthly, 4 = quarterly, 1 = yearly). Defaults to monthly — tenureMonths always stays in months regardless of this value.',
    example: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([1, 4, 12])
  installmentsPerYear?: number;
}
