import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { ARTISTS_BY_KEY } from "../data/artists.ts";

export async function GET(context: { site: URL | undefined }) {
  const site = context.site?.toString() ?? "https://art.jamestannahill.com/";
  const all = await getCollection("weather");
  // Newest 50 by run_id; skip pieces missing run_id (filtered out elsewhere too)
  const items = [...all]
    .filter((w) => w.data.run_id && w.data.slug)
    .sort((a, b) => (b.data.run_id ?? "").localeCompare(a.data.run_id ?? ""))
    .slice(0, 50);

  return rss({
    title: "art.jt — generative weather art",
    description:
      "Daily generative artwork from real atmospheric data, interpreted through 16 artist lenses (7 with custom FLUX.1-dev LoRA fine-tunes).",
    site,
    customData:
      "<language>en-us</language>" +
      "<copyright>CC BY-NC-ND 4.0 — James Tannahill</copyright>",
    items: items.map((w) => {
      const artistName =
        ARTISTS_BY_KEY[w.data.artist]?.display ?? w.data.artist.replace(/_/g, " ");
      const title = w.data.slug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
      return {
        title: `${title} — ${artistName}`,
        link: `/weather/${w.data.run_id}/${w.data.slug}/`,
        pubDate: new Date(w.data.created_at || w.data.date || Date.now()),
        description:
          w.data.rationale ||
          `Generative weather art at ${title} on ${w.data.date}.`,
        categories: [artistName, "generative", "weather"],
      };
    }),
  });
}
