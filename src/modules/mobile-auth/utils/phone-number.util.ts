// Nepali mobile numbers only — 10 digits starting with 9 (covers NTC, Ncell,
// and Smart Cell ranges without hardcoding individual operator prefixes,
// which shift over time). Canonical storage form is the bare 10-digit local
// number (e.g. "9812345678") — callers strip any +977/977/0 prefix and
// separators before it ever reaches Prisma, so a lookup by phoneNumber never
// has to guess which format was typed.
const NEPAL_LOCAL_REGEX = /^9\d{9}$/;

/** Validation regex for DTOs — accepts an optional +977/977/0 prefix on input. */
export const NEPAL_PHONE_INPUT_REGEX = /^(?:\+977|977|0)?9\d{9}$/;

/**
 * Strips separators and any country/trunk prefix, returning the bare
 * 10-digit local number. Throws only if the result isn't a valid Nepali
 * mobile number — callers should validate with NEPAL_PHONE_INPUT_REGEX at
 * the DTO layer first so this never surfaces a raw error to a request.
 */
export function normalizePhoneNumber(input: string): string {
  const digitsOnly = input.replace(/[\s-]/g, '');
  const stripped = digitsOnly
    .replace(/^\+977/, '')
    .replace(/^977/, '')
    .replace(/^0/, '');

  if (!NEPAL_LOCAL_REGEX.test(stripped)) {
    throw new Error(`Invalid Nepali mobile number: ${input}`);
  }
  return stripped;
}

/** E.164 form, for dispatching SMS via Twilio — never persisted. */
export function toE164(localNumber: string): string {
  return `+977${localNumber}`;
}
