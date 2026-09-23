/**
 * Title, place-name, and rationale helpers shared by weather / palette /
 * artist pages and the RSS feed. Keep titles under 60 characters so they
 * don't truncate in SERPs.
 */

export const PALETTE_NAMES: Record<string, string> = {
  sahara: "Sahara Desert",
  "new-england": "New England Coast",
  "norwegian-fjords": "Norwegian Fjords",
  "great-barrier-reef": "Great Barrier Reef",
  patagonia: "Patagonian Glaciers",
  tuscany: "Tuscany",
  namib: "Namib Desert",
  maldives: "Maldives Atolls",
  iceland: "Iceland Highlands",
  richat: "Richat Structure",
  amazon: "Amazon Rainforest",
  yellowstone: "Grand Prismatic Spring",
  danakil: "Danakil Depression",
  "aral-sea": "Aral Sea",
  atacama: "Atacama Desert",
  "dutch-tulips": "Dutch Tulip Fields",
  svalbard: "Svalbard",
  "lake-natron": "Lake Natron",
  bonneville: "Bonneville Salt Flats",
  "zhangye-danxia": "Zhangye Danxia",
  lofoten: "Lofoten Islands",
  uluru: "Uluru",
  okavango: "Okavango Delta",
  "bora-bora": "Bora Bora",
  uyuni: "Salar de Uyuni",
  provence: "Provence Lavender",
  galapagos: "Galapagos",
  "wadi-rum": "Wadi Rum",
  everglades: "South Florida Everglades",
  santorini: "Santorini Caldera",
};

const COORD_RE = /-(\d+)([ns])-(\d+)([ew])$/i;

export function titleCase(words: string): string {
  return words
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

/** "central-asia-30n-70e" → { region: "Central Asia", coords: "30°N, 70°E" } */
export function placeFromSlug(slug: string): { region: string; coords: string } {
  const m = slug.match(COORD_RE);
  if (!m) {
    return { region: titleCase(slug), coords: "" };
  }
  const region = titleCase(slug.slice(0, m.index));
  const coords = `${m[1]}°${m[2].toUpperCase()}, ${m[3]}°${m[4].toUpperCase()}`;
  return { region: region || titleCase(slug), coords };
}

export function paletteDisplayName(slug: string): string {
  return PALETTE_NAMES[slug] ?? titleCase(slug);
}

export function lastName(display: string): string {
  const particles = new Set(["de", "da", "van", "von", "af", "del", "della"]);
  const parts = display.trim().split(/\s+/);
  if (parts.length < 2) return display;
  if (particles.has(parts[parts.length - 2].toLowerCase())) {
    return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
  }
  return parts[parts.length - 1];
}

function fitTitle(candidates: string[]): string {
  for (const c of candidates) {
    if (c.length <= 60) return c;
  }
  const last = candidates[candidates.length - 1];
  return last.length <= 60 ? last : `${last.slice(0, 57).trimEnd()}…`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** SERP title for a single weather piece. */
export function pieceSeoTitle(artistDisplay: string, slug: string, date: string): string {
  const { region } = placeFromSlug(slug);
  const when = formatDateShort(date);
  return fitTitle([
    `${artistDisplay} Weather Art: ${region} | art.jt`,
    `${lastName(artistDisplay)} Weather Art: ${region} | art.jt`,
    `${lastName(artistDisplay)}: ${region} | art.jt`,
    `${lastName(artistDisplay)}: ${region} ${when} | art.jt`,
  ]);
}

export function pieceH1(slug: string): string {
  // Unnamed grid cells come through as the placeholder "Region"; name them by their coordinates.
  const p = placeFromSlug(slug);
  return p.region === "Region" && p.coords ? `Region ${p.coords}` : p.region;
}

export function pieceMetaDescription(rationale: string, artistDisplay: string, slug: string, date: string): string {
  const clean = sanitizeRationale(rationale).replace(/\s+/g, " ").trim();
  if (clean.length >= 70) {
    return clean.length <= 160 ? clean : `${clean.slice(0, 157).trimEnd()}...`;
  }
  const { region } = placeFromSlug(slug);
  return `Weather art after ${artistDisplay} from live atmospheric data over ${region} on ${formatDateShort(date)}.`;
}

export function paletteSeoTitle(slug: string): string {
  const name = paletteDisplayName(slug);
  return fitTitle([
    `${name} Colors from Sentinel-2 | art.jt`,
    `${name} Satellite Palette | art.jt`,
    `${name} Palette | art.jt`,
  ]);
}

export function paletteSeoDescription(slug: string, sampleCount: number): string {
  const name = paletteDisplayName(slug);
  return `Color palettes extracted from Copernicus Sentinel-2 imagery of ${name}. ${sampleCount} samples archived.`;
}

export function artistSeoTitle(display: string, pieceCount: number): string {
  const n = `${pieceCount} ${pieceCount === 1 ? "Piece" : "Pieces"}`;
  return fitTitle([
    `${display} Weather Art: ${n} | art.jt`,
    `${lastName(display)} Weather Art: ${n} | art.jt`,
    `${display} Weather Art | art.jt`,
  ]);
}

export function artistIndexTitle(total: number): string {
  return fitTitle([
    `${total} Artist Lenses on Live Weather Data | art.jt`,
    `Artist Lenses on Weather Data | art.jt`,
  ]);
}

export function palettesIndexTitle(): string {
  return "Satellite Color Palettes from Sentinel-2 | art.jt";
}

const C_MIN = -90;
const C_MAX = 60;
const HPA_MIN = 300;
const HPA_MAX = 1100;

/** Fix Kelvin/Pascal mislabels in stored rationale (same rules as the Lambda). */
export function sanitizeRationale(text: string): string {
  if (!text) return text;
  let out = text.replace(
    /(\d+(?:\.\d+)?)\s*(?:K|Kelvin)\s*\([^)]*\)/gi,
    "$1°C",
  );
  out = out.replace(/(\d+(?:\.\d+)?)\s*(?:K|Kelvin)\b/gi, (full, n: string) => {
    const v = Number(n);
    return v >= C_MIN && v <= C_MAX ? `${n}°C` : full;
  });
  out = out.replace(/(\d+(?:\.\d+)?)\s*Pa\b/g, (full, n: string) => {
    const v = Number(n);
    return v >= HPA_MIN && v <= HPA_MAX ? `${n} hPa` : full;
  });
  return out.replace(/\s{2,}/g, " ").trim();
}
