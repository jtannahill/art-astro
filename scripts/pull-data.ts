/**
 * Pull DynamoDB → JSON snapshots for the Astro build.
 *
 * Reads the `art-generator` table once, splits items by PK prefix,
 * and writes flat arrays to src/data/generated/{weather,palettes}.json.
 * Astro Content Collections consume those files; nothing is committed.
 *
 * Run locally with ambient AWS creds:
 *   npm run pull-data
 *
 * In CI the deploy IAM user (art-astro-ci) has dynamodb:Scan on this table.
 */
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TABLE = "art-generator";
const REGION = "us-east-1";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(here, "..", "src", "data", "generated");

const client = new DynamoDBClient({ region: REGION });

async function scanAll() {
  const items: Record<string, unknown>[] = [];
  let lastKey: Record<string, unknown> | undefined;
  let calls = 0;
  do {
    const out = await client.send(
      new ScanCommand({ TableName: TABLE, ExclusiveStartKey: lastKey as never })
    );
    for (const raw of out.Items ?? []) items.push(unmarshall(raw));
    lastKey = out.LastEvaluatedKey as Record<string, unknown> | undefined;
    calls += 1;
  } while (lastKey);
  console.log(`scanned ${items.length} items in ${calls} call(s)`);
  return items;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function asNumber(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

interface WeatherRow {
  pk: string;
  sk: string;
  run_id: string;
  date: string;
  slug: string;
  artist: string;
  lat?: number;
  lng?: number;
  temp?: number;
  wind_speed?: number;
  wind_direction?: number;
  pressure?: number;
  humidity?: number;
  precipitation?: number;
  score?: number;
  quality_score?: number;
  rationale: string;
  canvas_format: string;
  created_at: string;
}

interface PaletteRow {
  pk: string;
  sk: string;
  location_slug: string;
  date: string;
  colors: string[];
  mood: string;
  season?: string;
  lat?: number;
  lng?: number;
  source_key?: string;
}

function shapeWeather(it: Record<string, unknown>): WeatherRow {
  return {
    pk: asString(it.PK),
    sk: asString(it.SK),
    run_id: asString(it.run_id),
    date: asString(it.date),
    slug: asString(it.slug ?? it.SK),
    artist: asString(it.artist),
    lat: asNumber(it.lat),
    lng: asNumber(it.lng),
    temp: asNumber(it.temp),
    wind_speed: asNumber(it.wind_speed),
    wind_direction: asNumber(it.wind_direction),
    pressure: asNumber(it.pressure),
    humidity: asNumber(it.humidity),
    precipitation: asNumber(it.precipitation),
    score: asNumber(it.score),
    quality_score: asNumber(it.quality_score),
    rationale: asString(it.rationale),
    canvas_format: asString(it.canvas_format),
    created_at: asString(it.created_at),
  };
}

function parseColors(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function shapePalette(it: Record<string, unknown>): PaletteRow {
  const pk = asString(it.PK);
  const slug = pk.startsWith("PALETTE#") ? pk.slice(8) : pk;
  return {
    pk,
    sk: asString(it.SK),
    location_slug: slug,
    date: asString(it.SK),
    colors: parseColors(it.colors),
    mood: asString(it.mood),
    season: it.season ? asString(it.season) : undefined,
    lat: asNumber(it.lat),
    lng: asNumber(it.lng),
    source_key: it.source_key ? asString(it.source_key) : undefined,
  };
}

const items = await scanAll();
const weather = items
  .filter((i) => asString(i.PK).startsWith("WEATHER"))
  .map(shapeWeather);
const palettes = items
  .filter((i) => asString(i.PK).startsWith("PALETTE"))
  .map(shapePalette);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(`${OUT_DIR}/weather.json`, JSON.stringify(weather));
writeFileSync(`${OUT_DIR}/palettes.json`, JSON.stringify(palettes));

const stats = {
  weather: weather.length,
  palettes: palettes.length,
  runs: new Set(weather.map((w) => w.run_id).filter(Boolean)).size,
  artists: new Set(weather.map((w) => w.artist).filter(Boolean)).size,
  locations: new Set(palettes.map((p) => p.location_slug)).size,
  generated_at: new Date().toISOString(),
};
writeFileSync(`${OUT_DIR}/stats.json`, JSON.stringify(stats, null, 2));
console.log(stats);
