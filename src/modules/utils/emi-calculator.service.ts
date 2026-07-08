import { Injectable } from '@nestjs/common';
import { EmiCalculatorDto } from './dto/emi-calculator.dto';

@Injectable()
export class EmiCalculatorService {
  calculate(dto: EmiCalculatorDto) {
    const {
      loanAmount,
      interestRate,
      tenureMonths,
      installmentsPerYear = 12,
    } = dto;

    // tenureMonths always stays in months; installmentsPerYear only changes
    // how many periods that spans and the periodic rate — 12/4/1 (monthly/
    // quarterly/yearly) all divide 12 evenly, so this is always a whole number.
    const numberOfInstallments = Math.round(
      (tenureMonths * installmentsPerYear) / 12,
    );
    const r = interestRate / installmentsPerYear / 100;

    let monthlyEmi: number;

    if (r === 0) {
      // Interest-free edge case
      monthlyEmi = loanAmount / numberOfInstallments;
    } else {
      // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
      const pow = Math.pow(1 + r, numberOfInstallments);
      monthlyEmi = (loanAmount * r * pow) / (pow - 1);
    }

    const totalPayment = monthlyEmi * numberOfInstallments;
    const totalInterest = totalPayment - loanAmount;

    return {
      loanAmount,
      interestRate,
      tenureMonths,
      numberOfInstallments,
      monthlyEmi: Math.round(monthlyEmi * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
    };
  }
}
