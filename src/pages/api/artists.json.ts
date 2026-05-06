import { getCollection } from "astro:content";
import { ARTISTS, hasLora } from "../../data/artists.ts";

export async function GET() {
  const all = await getCollection("weather");
  const counts = new Map<string, number>();
  for (const w of all) counts.set(w.data.artist, (counts.get(w.data.artist) ?? 0) + 1);

  const artists = ARTISTS.map((a) => ({
    key: a.key,
    display: a.display,
    has_lora: hasLora(a.key),
    piece_count: counts.get(a.key) ?? 0,
    page_url: `https://art.jamestannahill.com/artist/${a.key}/`,
    external_link: a.link,
  }));

  return new Response(JSON.stringify({ count: artists.length, artists }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
