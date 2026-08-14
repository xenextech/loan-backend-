import * as crypto from 'crypto';

// Excludes visually-ambiguous characters (0/O, 1/I/L) so a human reading the
// code aloud or copying it by hand doesn't mistype it.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Cryptographically secure verification token for the URL — this is the
 * actual security boundary. Never derived from application/student ID,
 * email, or timestamp.
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashVerificationToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Human-facing verification ID, e.g. UNATI-PAR-8F4K92 — an identifier for
 * the recipient to quote/compare, NOT an auth mechanism on its own (the
 * hashed token is). Uniqueness is enforced by the caller via a DB retry.
 */
export function generateVerificationCode(
  recipientType: 'PARENT' | 'COLLEGE',
): string {
  const suffix = Array.from({ length: 6 }, () => {
    const idx = crypto.randomInt(0, CODE_ALPHABET.length);
    return CODE_ALPHABET[idx];
  }).join('');
  const infix = recipientType === 'PARENT' ? 'PAR' : 'COL';
  return `UNATI-${infix}-${suffix}`;
}
