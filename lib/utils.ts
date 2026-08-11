import { type ClassValue, clsx } from 'clsx';

// Minimal cn utility — no external dependency needed
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/** Format a year: negative → BCE, positive → CE */
export function formatYear(year: number | null | undefined): string {
  if (year == null) return 'לא ידוע';
  if (year < 0) return `${Math.abs(year)} לפנה״ס`;
  return `${year} לספירה`;
}

/** Format a year range with confidence */
export function formatYearRange(
  start: number | null | undefined,
  end: number | null | undefined
): string {
  if (!start && !end) return 'לא ידוע';
  if (start && end && start === end) return formatYear(start);
  if (start && end) return `${formatYear(start)} – ${formatYear(end)}`;
  if (start) return `≈ ${formatYear(start)}`;
  return `≈ ${formatYear(end)}`;
}

/** Slugify a Hebrew string */
export function slugify(text: string): string {
  return text
    .trim()
    .replace(/[^\w\s\u0590-\u05FF-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}
