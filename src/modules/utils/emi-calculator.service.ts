import { Injectable } from '@nestjs/common';
import { EmiCalculatorDto } from './dto/emi-calculator.dto';

@Injectable()
export class EmiCalculatorService {
  calculate(dto: EmiCalculatorDto) {
    const { loanAmount, interestRate, tenureMonths } = dto;

    // Monthly interest rate
    const r = interestRate / 12 / 100;

    let monthlyEmi: number;

    if (r === 0) {
      // Interest-free edge case
      monthlyEmi = loanAmount / tenureMonths;
    } else {
      // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
      const pow = Math.pow(1 + r, tenureMonths);
      monthlyEmi = (loanAmount * r * pow) / (pow - 1);
    }

    const totalPayment = monthlyEmi * tenureMonths;
    const totalInterest = totalPayment - loanAmount;

    return {
      loanAmount,
      interestRate,
      tenureMonths,
      monthlyEmi: Math.round(monthlyEmi * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
    };
  }
}
