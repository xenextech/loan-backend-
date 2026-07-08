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
