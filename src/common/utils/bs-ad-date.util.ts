import NepaliDate from 'nepali-date-converter';

// nepali-date-converter supports BS years 2000–2090 (see its dateConfigMap).
export const BS_MIN_YEAR = 2000;
export const BS_MAX_YEAR = 2090;

const BS_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidBsDateString(value: string): boolean {
  if (!BS_DATE_REGEX.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 32) return false;

  try {
    // The library silently rolls invalid month/day values over into the next
    // month/year (like the native Date constructor) instead of throwing —
    // comparing the parsed fields back against the input catches that.
    const nepaliDate = new NepaliDate(value);
    return (
      nepaliDate.getYear() === year &&
      nepaliDate.getMonth() === month - 1 &&
      nepaliDate.getDate() === day
    );
  } catch {
    return false;
  }
}

// Re-anchors a Date's calendar fields onto local midnight so nepali-date-converter
// (which reads local getters internally) sees the intended day regardless of
// which fields (UTC vs local) the source Date was built from.
function toLocalMidnight(year: number, monthIndex: number, date: number): Date {
  return new Date(year, monthIndex, date);
}

// Converts a BS date string ("YYYY-MM-DD") to the equivalent AD calendar day,
// returned as a UTC-midnight Date — safe to persist in a Prisma DateTime column
// regardless of the server process's local timezone.
export function convertBsToAd(bsDate: string): Date {
  const nepaliDate = new NepaliDate(bsDate);
  const ad = nepaliDate.getAD(); // { year, month (0-indexed), date }
  return new Date(Date.UTC(ad.year, ad.month, ad.date));
}

// Converts an AD Date (assumed to represent a pure calendar day, e.g. stored as
// UTC midnight by Prisma) to a BS date string ("YYYY-MM-DD") — safe regardless
// of the server process's local timezone.
export function convertAdToBs(adDate: Date): string {
  const localSafe = toLocalMidnight(
    adDate.getUTCFullYear(),
    adDate.getUTCMonth(),
    adDate.getUTCDate(),
  );
  return NepaliDate.fromAD(localSafe).format('YYYY-MM-DD');
}

// Computes whole-years age from a date of birth (AD), as of `asOf` (defaults to
// now). Both are treated as pure calendar days via UTC fields.
export function calculateAge(
  dateOfBirth: Date,
  asOf: Date = new Date(),
): number {
  let age = asOf.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  const birthdayHasOccurredThisYear =
    asOf.getUTCMonth() > dateOfBirth.getUTCMonth() ||
    (asOf.getUTCMonth() === dateOfBirth.getUTCMonth() &&
      asOf.getUTCDate() >= dateOfBirth.getUTCDate());
  if (!birthdayHasOccurredThisYear) age -= 1;
  return age;
}
