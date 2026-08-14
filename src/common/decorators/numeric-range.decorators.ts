import { applyDecorators } from '@nestjs/common';
import { IsNumber, Max, Min, ValidationOptions } from 'class-validator';

// Matches a Prisma `@db.Decimal(5, 2)` percentage column (0–100 business
// range, comfortably within the column's 999.99 storage ceiling). Rejects
// out-of-range values in the ValidationPipe (400) instead of letting
// Postgres reject them at write time (numeric field overflow -> 500).
export function IsPercentage(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsNumber({ maxDecimalPlaces: 2 }, validationOptions),
    Min(0, {
      message: '$property must be between 0 and 100',
      ...validationOptions,
    }),
    Max(100, {
      message: '$property must be between 0 and 100',
      ...validationOptions,
    }),
  );
}

// For ratios expressed as a percentage of INCOME (DSGIR, Loan-to-Income) —
// unlike IsPercentage's fields (interest rate, LTV-against-collateral, a
// 0-100 scoring engine output), these are not bounded above by their own
// definition. A large facility on a short tenure, or a loan bigger than the
// applicant's annual income, produces a value over 100 — that's a real
// "this is unaffordable" signal the underwriter needs to see and record, not
// invalid input. Only floors at 0; the ceiling is a sanity check against
// fat-fingered entry, not a business rule.
export function IsRatioPercentage(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsNumber({ maxDecimalPlaces: 2 }, validationOptions),
    Min(0, { message: '$property cannot be negative', ...validationOptions }),
    Max(9999.99, {
      message: '$property is unrealistically large',
      ...validationOptions,
    }),
  );
}

// Matches a Prisma `@db.Decimal(18, 2)` monetary column. The cap is set well
// below the column's actual ceiling (~10^16) to stay within JS's safe-integer
// precision while remaining far larger than any realistic loan/asset figure.
export function IsMoneyAmount(validationOptions?: ValidationOptions) {
  return applyDecorators(
    IsNumber({ maxDecimalPlaces: 2 }, validationOptions),
    Min(0, { message: '$property cannot be negative', ...validationOptions }),
    Max(999_999_999_999.99, {
      message: '$property exceeds the maximum storable amount',
      ...validationOptions,
    }),
  );
}
