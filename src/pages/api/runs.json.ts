import { getCollection } from "astro:content";

export async function GET() {
  const all = await getCollection("weather");
  const groups = new Map<string, typeof all>();
  for (const w of all) {
    const id = w.data.run_id;
    if (!id) continue;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push(w);
  }
  const runs = [...groups.entries()]
    .map(([run_id, items]) => ({
      run_id,
      date: items[0].data.date,
      piece_count: items.length,
      artists: [...new Set(items.map((w) => w.data.artist))],
      avg_quality_score:
        items.reduce((acc, w) => acc + (w.data.quality_score ?? 0), 0) /
        items.length,
    }))
    .sort((a, b) => b.run_id.localeCompare(a.run_id));

  return new Response(JSON.stringify({ count: runs.length, runs }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=600",
    },
  });
}
