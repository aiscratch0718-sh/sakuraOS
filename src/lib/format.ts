/**
 * Lightweight date formatting helpers (no extra deps).
 * Uses Asia/Tokyo locale.
 */

const dateOptions: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
};

const fullDateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
};

const formatter = new Intl.DateTimeFormat("ja-JP", dateOptions);
const fullFormatter = new Intl.DateTimeFormat("ja-JP", fullDateOptions);

export function formatJpDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return formatter.format(date);
}

export function formatJpFullDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return fullFormatter.format(date);
}
