import type { ZodiacSignKey } from "@/domain/models";
import { parseDateParts } from "@/lib/dateParts";

interface ZodiacRange {
  sign: ZodiacSignKey;
  /** [month, day] inclusive start */
  from: [number, number];
  /** [month, day] inclusive end */
  to: [number, number];
}

const RANGES: ZodiacRange[] = [
  { sign: "aries", from: [3, 21], to: [4, 19] },
  { sign: "taurus", from: [4, 20], to: [5, 20] },
  { sign: "gemini", from: [5, 21], to: [6, 20] },
  { sign: "cancer", from: [6, 21], to: [7, 22] },
  { sign: "leo", from: [7, 23], to: [8, 22] },
  { sign: "virgo", from: [8, 23], to: [9, 22] },
  { sign: "libra", from: [9, 23], to: [10, 22] },
  { sign: "scorpio", from: [10, 23], to: [11, 21] },
  { sign: "sagittarius", from: [11, 22], to: [12, 21] },
  { sign: "capricorn", from: [12, 22], to: [1, 19] },
  { sign: "aquarius", from: [1, 20], to: [2, 18] },
  { sign: "pisces", from: [2, 19], to: [3, 20] },
];

const isWithin = (
  month: number,
  day: number,
  from: [number, number],
  to: [number, number],
) => {
  const fromIdx = from[0] * 100 + from[1];
  const toIdx = to[0] * 100 + to[1];
  const idx = month * 100 + day;
  if (fromIdx <= toIdx) return idx >= fromIdx && idx <= toIdx;
  // Year-boundary range (Capricorn spans Dec 22 – Jan 19)
  return idx >= fromIdx || idx <= toIdx;
};

/** Derive the western zodiac sign from a date string ("YYYY-MM-DD" or ISO). */
export function getZodiacSign(value: string | Date | null): ZodiacSignKey | null {
  if (!value) return null;
  const parts = parseDateParts(value);
  if (!parts) return null;
  const { month, day } = parts;
  return RANGES.find((r) => isWithin(month, day, r.from, r.to))?.sign ?? null;
}

/** Uppercase initials used as avatar fallback. */
export function getInitials(name: string | null | undefined, fallback = "A"): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  const first = parts[0][0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + second).toUpperCase() || fallback;
}
