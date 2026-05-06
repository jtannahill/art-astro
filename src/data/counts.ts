/**
 * Single source of truth for every site-wide count and configuration
 * constant referenced in copy. Pages import these instead of hardcoding
 * digits, so adding an artist (or changing the scan grid) updates every
 * meta description, schema, and body paragraph in one diff.
 */
import { ARTISTS, LORA_METHODOLOGY } from "./artists.ts";

// Derived from data - change automatically when the roster changes.
export const TOTAL_ARTISTS = ARTISTS.length;
export const LORA_ARTIST_COUNT = Object.keys(LORA_METHODOLOGY).length;

// Pipeline configuration. Keep in sync with art-weather-ingest /
// art-satellite-ingest Lambdas - these are doctrine numbers, not data.
export const SCAN_POINTS = 54;
export const LATITUDE_BANDS = 10;
export const TOP_LOCATIONS_PER_DAY = 10;
export const MIN_LAT_LNG_SEPARATION_DEG = 15;
export const SATELLITE_ALTITUDE_KM = 786;
export const CANVAS_FORMAT_COUNT = 7;

// Print shop policy.
export const EDITION_SIZE = 5;
export const PRICE_MAX_MULTIPLIER = 2;

// Composite visual interest weights (must sum to 100).
export const SCORE_WEIGHTS = {
  pressure_anomaly: 30,
  wind: 25,
  temperature_deviation: 20,
  precipitation: 15,
  humidity: 10,
};

/** Spell out small integers for prose. Falls back to digits beyond 20. */
const WORDS = [
  "zero", "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];
export function asWord(n: number): string {
  return n >= 0 && n < WORDS.length ? WORDS[n] : String(n);
}
