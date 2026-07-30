// Lowercase, hyphenated slug for URLs (e.g. "Kathmandu College of Management" ->
// "kathmandu-college-of-management"). Not guaranteed unique by itself — callers
// append a short suffix on collision (see MarketplaceCollegeService/CourseService).
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
