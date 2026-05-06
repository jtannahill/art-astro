/**
 * Single source of truth for the About-page FAQ.
 * Both the FAQPage JSON-LD and the visible <details> accordion are
 * rendered from this list, so the structured data can never drift
 * from what the user sees.
 *
 * `answer` may contain inline HTML - Google's FAQPage spec allows it,
 * and the accordion uses set:html. Numeric counts come from counts.ts
 * so adding/removing a LoRA artist updates both the schema and the
 * visible answer in one diff.
 */
import { ARTISTS, LORA_METHODOLOGY } from "./artists.ts";
import {
  TOTAL_ARTISTS,
  LORA_ARTIST_COUNT,
  SCAN_POINTS,
  TOP_LOCATIONS_PER_DAY,
  MIN_LAT_LNG_SEPARATION_DEG,
  EDITION_SIZE,
  PRICE_MAX_MULTIPLIER,
  SCORE_WEIGHTS,
  SATELLITE_ALTITUDE_KM,
  asWord,
} from "./counts.ts";

const loraArtistLinks = Object.keys(LORA_METHODOLOGY)
  .map((k) => {
    const display = ARTISTS.find((a) => a.key === k)?.display ?? k;
    return `<a href="/artist/${k}/">${display}</a>`;
  })
  .join(", ");

export interface FaqEntry {
  q: string;
  a: string;
}

export const FAQ: FaqEntry[] = [
  {
    q: "Is the AI trained on these artists' work?",
    a: `For most artists, no - the AI knows them only through descriptive text prompts that capture each artist's visual philosophy. For ${asWord(LORA_ARTIST_COUNT)} artists (${loraArtistLinks}), custom FLUX.1-dev LoRA fine-tunes were trained on small sets of curated canvas reproductions. Those artists' pages document the training set, parameters, and provenance under "Model &amp; Methodology".`,
  },
  {
    q: "Is the weather data real?",
    a: `Yes. Every piece is generated from live atmospheric measurements at the time of creation - pressure, wind speed, temperature, humidity, and precipitation from NOAA's Global Forecast System via the Open-Meteo API. The raw data is archived alongside each artwork.`,
  },
  {
    q: "Can the same artwork be created twice?",
    a: `No. Each artwork is generated from a unique combination of atmospheric conditions at a specific location and moment in time. Weather never repeats exactly, so neither does the art. Every piece is a one-of-one fossil of weather that no longer exists.`,
  },
  {
    q: `How are the ${TOP_LOCATIONS_PER_DAY} daily locations chosen?`,
    a: `${SCAN_POINTS} points across the globe are scanned every day. A composite visual interest score ranks them by pressure anomaly (${SCORE_WEIGHTS.pressure_anomaly}%), wind speed (${SCORE_WEIGHTS.wind}%), temperature deviation (${SCORE_WEIGHTS.temperature_deviation}%), precipitation (${SCORE_WEIGHTS.precipitation}%), and humidity (${SCORE_WEIGHTS.humidity}%). The top ${TOP_LOCATIONS_PER_DAY} - with at least ${MIN_LAT_LNG_SEPARATION_DEG}&deg; of geographic separation - become that day's subjects.`,
  },
  {
    q: "Can I buy a print?",
    a: `Yes. Every artwork page has a print shop - just click any artwork and look for the print option. Limited edition gicl&eacute;e prints on Hahnem&uuml;hle German Etching 310gsm, edition of ${EDITION_SIZE} per size, with Certificate of Authenticity. Ships worldwide via theprintspace. <a href="/archive/">Browse the archive</a> to find your piece.`,
  },
  {
    q: "Can I suggest a new artist?",
    a: `Yes - visit the <a href="/artist/">Artists page</a> and use the suggestion form at the bottom, or email <a href="mailto:art@jamestannahill.com">art@jamestannahill.com</a>.`,
  },
  {
    q: "What are the satellite palettes?",
    a: `A parallel system captures true-color imagery from the Copernicus Sentinel-2 satellite (${SATELLITE_ALTITUDE_KM} km altitude) and extracts the dominant color palettes. Deserts, glaciers, river deltas - the actual colors of Earth as seen from orbit. Browse them at <a href="/palettes/">Palettes</a>.`,
  },
  {
    q: "What makes each artwork unique?",
    a: `Every artwork is generated from a one-time atmospheric event - a specific combination of pressure, wind, temperature, and precipitation at a specific location and moment. That weather will never occur again. Unlike digital assets where scarcity is manufactured by capping supply, the scarcity here is physical: the atmosphere produced it once, and it's gone. The atmospheric data is archived alongside every piece, timestamped and verifiable against NOAA's public records. Limited edition prints (${EDITION_SIZE} per size) add physical scarcity on top of natural scarcity.`,
  },
  {
    q: "Why do print prices vary between artworks?",
    a: `Prices reflect three signals: the AI critic's quality score (composition, color, complexity, emotional impact), the rarity of the weather conditions that produced the piece, and how many editions have already sold. Exceptional pieces from extreme weather events are priced higher - up to ${PRICE_MAX_MULTIPLIER}&times; the base price.`,
  },
  {
    q: "Can I use the artwork commercially?",
    a: `Artwork is licensed under CC BY-NC-ND 4.0 - free for personal use with attribution, no commercial use or derivatives. For commercial licensing, contact <a href="mailto:art@jamestannahill.com">art@jamestannahill.com</a>.`,
  },
];
