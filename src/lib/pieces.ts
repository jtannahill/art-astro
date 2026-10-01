/**
 * Weather-piece queries and image sizing shared by pages.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";

type Weather = CollectionEntry<"weather">["data"];

/** Card fields for one artist's pieces, newest run first. */
export async function piecesFor(artistKey: string) {
  const all = await getCollection("weather");
  return all
    .filter((w) => w.data.artist === artistKey)
    .map((w) => ({
      run_id: w.data.run_id,
      slug: w.data.slug,
      lat: w.data.lat,
      lng: w.data.lng,
      temp: w.data.temp,
      wind_speed: w.data.wind_speed,
      pressure: w.data.pressure,
      quality_score: w.data.quality_score,
    }))
    .sort((a, b) => (b.run_id ?? "").localeCompare(a.run_id ?? ""));
}

// Real preview sizes probed by scripts/probe-dims.ts. Absent on a fresh
// checkout before pull-data, in which case the renderer rules below apply.
let probed: Record<string, [number, number]> = {};
try {
  probed = JSON.parse(readFileSync(resolve("src/data/generated/image-dims.json"), "utf8"));
} catch {}

// FLUX.1-dev LoRA snaps the requested canvas to its own bucket. Requests of
// 1920x1920 and 2400x1600 land in more than one bucket, so these are best
// guesses that the probe overrides.
const LORA_BUCKETS: Record<string, [number, number]> = {
  "2048x2048": [1024, 1024],
  "1920x1920": [896, 1152],
  "1440x2560": [768, 1344],
  "1024x2048": [896, 1152],
  "2048x1024": [1152, 896],
  "2560x1440": [1344, 768],
  "2400x1600": [1344, 768],
};

/** Pixel size of preview-2048.png, for width/height and JSON-LD. */
export function pieceDims(p: Pick<Weather, "run_id" | "slug" | "renderer" | "canvas_format">): [number, number] {
  const known = probed[`${p.run_id}/${p.slug}`];
  if (known) return known;
  const fmt = p.canvas_format || "2048x2048";
  if (p.renderer === "flux-1.1-pro") return [1024, 1024];
  if (p.renderer?.startsWith("flux-dev-lora:")) return LORA_BUCKETS[fmt] ?? [1024, 1024];
  // SVG renders rasterize at 2048 wide, keeping the canvas ratio.
  const [w, h] = fmt.split("x").map(Number);
  return w && h ? [2048, Math.round((2048 * h) / w)] : [2048, 2048];
}
