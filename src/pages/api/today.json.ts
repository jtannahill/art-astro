import { getCollection } from "astro:content";
import { ARTISTS_BY_KEY } from "../../data/artists.ts";

const PROD = "https://art.jamestannahill.com";

export async function GET() {
  const all = await getCollection("weather");
  const runs = [...new Set(all.map((w) => w.data.run_id).filter(Boolean))].sort(
    (a, b) => b.localeCompare(a)
  );
  const latestRun = runs[0] ?? "";
  const pieces = all
    .filter((w) => w.data.run_id === latestRun)
    .map((w) => ({
      run_id: w.data.run_id,
      slug: w.data.slug,
      artist: w.data.artist,
      artist_name:
        ARTISTS_BY_KEY[w.data.artist]?.display ?? w.data.artist.replace(/_/g, " "),
      lat: w.data.lat,
      lng: w.data.lng,
      date: w.data.date,
      temp: w.data.temp,
      wind_speed: w.data.wind_speed,
      pressure: w.data.pressure,
      humidity: w.data.humidity,
      precipitation: w.data.precipitation,
      score: w.data.score,
      quality_score: w.data.quality_score,
      rationale: w.data.rationale,
      preview_url: `${PROD}/weather/${w.data.run_id}/${w.data.slug}/preview-2048.png`,
      page_url: `${PROD}/weather/${w.data.run_id}/${w.data.slug}/`,
    }))
    .sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0));

  return new Response(JSON.stringify({ run_id: latestRun, pieces }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
}
