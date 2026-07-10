import { Prisma } from '@prisma/client';

// The global ClassSerializerInterceptor (see main.ts) walks every response
// object and doesn't recognize Prisma's Decimal type, mangling it into its
// internal {s, e, d} representation instead of a plain number by the time it
// reaches JSON. Any top-level Decimal-typed column must be converted to a
// plain number before a raw Prisma record leaves a service. Shallow only —
// callers with Decimal fields nested inside relations/JSON should convert
// those separately.
export function serializeDecimals(
  record: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...record };
  for (const [key, value] of Object.entries(result)) {
    if (value instanceof Prisma.Decimal) {
      result[key] = value.toNumber();
    }
  }
  return result;
}
