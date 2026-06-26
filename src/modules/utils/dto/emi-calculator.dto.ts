import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';
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
}
