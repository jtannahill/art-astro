import { getCollection } from "astro:content";

const PROD = "https://art.jamestannahill.com";

export async function GET() {
  const all = await getCollection("palettes");
  const byLocation = new Map<string, (typeof all)[number]>();
  for (const p of all) {
    const cur = byLocation.get(p.data.location_slug);
    if (!cur || (p.data.date ?? "").localeCompare(cur.data.date ?? "") > 0) {
      byLocation.set(p.data.location_slug, p);
    }
  }
  const locations = [...byLocation.values()]
    .sort((a, b) => (b.data.date ?? "").localeCompare(a.data.date ?? ""))
    .map((p) => ({
      location_slug: p.data.location_slug,
      latest_date: p.data.date,
      lat: p.data.lat,
      lng: p.data.lng,
      colors: p.data.colors,
      mood: p.data.mood,
      sample_count: all.filter((x) => x.data.location_slug === p.data.location_slug).length,
      thumb_url: `${PROD}/palettes/${p.data.date}/${p.data.location_slug}/source-thumb.jpg`,
      page_url: `${PROD}/palettes/${p.data.location_slug}/`,
    }));

  return new Response(JSON.stringify({ count: locations.length, locations }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
