/**
 * Astro Content Collections backed by the JSON snapshots
 * `scripts/pull-data.ts` writes into `src/data/generated/`.
 *
 * Zod schemas double as build-time validation: a missing `slug` or a
 * non-numeric `temp` fails the build instead of rendering an empty card.
 */
import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";

const weatherSchema = z.object({
  pk: z.string(),
  sk: z.string(),
  run_id: z.string(),
  date: z.string(),
  slug: z.string(),
  artist: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  temp: z.number().optional(),
  temp_anomaly: z.number().optional(),
  wind_speed: z.number().optional(),
  wind_direction: z.number().optional(),
  pressure: z.number().optional(),
  pressure_gradient: z.number().optional(),
  humidity: z.number().optional(),
  precipitation: z.number().optional(),
  score: z.number().optional(),
  quality_score: z.number().optional(),
  rationale: z.string().default(""),
  canvas_format: z.string().default(""),
  created_at: z.string().default(""),
  renderer: z.string().default(""),
  has_8k: z.boolean().default(false),
  has_svg: z.boolean().default(false),
});

const paletteSchema = z.object({
  pk: z.string(),
  sk: z.string(),
  location_slug: z.string(),
  date: z.string(),
  colors: z.array(z.string()),
  mood: z.string().default(""),
  season: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  source_key: z.string().optional(),
});

export const collections = {
  weather: defineCollection({
    loader: file("src/data/generated/weather.json", {
      // Use pk + sk as the stable id (slug alone collides across runs).
      parser: (text) =>
        JSON.parse(text).map((row: Record<string, unknown>) => ({
          ...row,
          id: `${row.pk}_${row.sk}`,
        })),
    }),
    schema: weatherSchema,
  }),
  palettes: defineCollection({
    loader: file("src/data/generated/palettes.json", {
      parser: (text) =>
        JSON.parse(text).map((row: Record<string, unknown>) => ({
          ...row,
          id: `${row.location_slug}_${row.date}`,
        })),
    }),
    schema: paletteSchema,
  }),
};
