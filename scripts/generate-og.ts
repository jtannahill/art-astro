/**
 * Per-piece Open Graph cards via satori + resvg.
 *
 * Reads src/data/generated/weather.json, renders a 1200×630 PNG for
 * each piece into dist/og/{run_id}/{slug}.png. Skips files that already
 * exist locally — so on a CI run that pre-pulls existing OG images
 * from S3, only new pieces get rendered.
 *
 * Inter Regular + Bold are pulled once from rsms.me (the official Inter
 * site) and cached in .cache/.
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const OUT_DIR = join(ROOT, "dist", "og");
const CACHE_DIR = join(ROOT, ".cache");

function loadFontFromNodeModules(weight: 400 | 700): ArrayBuffer {
  // @fontsource/inter ships WOFF (and WOFF2) for every Latin/Cyrillic/Greek
  // subset. We use the latin WOFF subset — satori accepts WOFF (but not WOFF2)
  // and the Latin alphabet covers everything we render.
  const path = join(
    ROOT,
    "node_modules/@fontsource/inter/files",
    `inter-latin-${weight}-normal.woff`
  );
  const buf = readFileSync(path);
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer;
}

interface Piece {
  run_id: string;
  slug: string;
  artist: string;
  date: string;
  lat?: number;
  lng?: number;
  temp?: number;
  wind_speed?: number;
  pressure?: number;
  quality_score?: number;
}

function fmtTitle(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
function fmtArtist(slug: string) {
  return slug
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
function fmtCoords(lat?: number, lng?: number) {
  if (lat == null || lng == null) return "";
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(0)}°${ns}, ${Math.abs(lng).toFixed(0)}°${ew}`;
}

// Build a satori-compatible element tree (React-element shape).
function card(p: Piece) {
  const title = fmtTitle(p.slug);
  const artist = fmtArtist(p.artist);
  const coords = fmtCoords(p.lat, p.lng);
  const stats = [
    p.temp != null && `${p.temp.toFixed(1)}°C`,
    p.wind_speed != null && `${p.wind_speed.toFixed(1)} m/s`,
    p.pressure != null && `${p.pressure.toFixed(0)} hPa`,
  ].filter(Boolean);

  return {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        background: "linear-gradient(135deg, #0a0a0f 0%, #14142a 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "60px 72px",
        color: "#fff",
        fontFamily: "Inter",
        position: "relative",
      },
      children: [
        // Top bar
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "20px",
              color: "#888",
              letterSpacing: "0.05em",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { fontFamily: "Inter", fontWeight: 700, color: "#fff" },
                  children: "art.jt",
                },
              },
              {
                type: "div",
                props: {
                  style: { textTransform: "uppercase", letterSpacing: "0.18em" },
                  children: "Generative weather art",
                },
              },
            ],
          },
        },
        // Spacer
        { type: "div", props: { style: { flex: 1, display: "flex" } } },
        // Title block
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "20px",
                    color: "#c4b5fd",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  },
                  children: artist,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "78px",
                    fontWeight: 700,
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                    maxWidth: "1000px",
                  },
                  children: title,
                },
              },
            ],
          },
        },
        // Spacer
        { type: "div", props: { style: { flex: 1, display: "flex" } } },
        // Stat strip + footer
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              borderTop: "1px solid #2a2a3e",
              paddingTop: "22px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { fontSize: "18px", color: "#888" },
                        children: coords ? `${coords}  ·  ${p.date}` : p.date,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "22px",
                          color: "#ddd",
                          fontFamily: "Inter",
                          letterSpacing: "0.02em",
                        },
                        children: stats.join("   ·   "),
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: { fontSize: "18px", color: "#888" },
                  children: "art.jamestannahill.com",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

(async () => {
  const regular = loadFontFromNodeModules(400);
  const bold = loadFontFromNodeModules(700);

  const weather = JSON.parse(
    readFileSync(join(ROOT, "src/data/generated/weather.json"), "utf8")
  ) as Piece[];

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of weather) {
    if (!p.run_id || !p.slug) continue;
    const out = join(OUT_DIR, p.run_id, `${p.slug}.png`);
    if (existsSync(out)) {
      skipped++;
      continue;
    }
    try {
      const svg = await satori(card(p) as unknown as Parameters<typeof satori>[0], {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Inter", data: regular, weight: 400, style: "normal" },
          { name: "Inter", data: bold, weight: 700, style: "normal" },
        ],
      });
      const png = new Resvg(svg).render().asPng();
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, png);
      generated++;
    } catch (e) {
      failed++;
      if (failed <= 3) console.warn(`${p.run_id}/${p.slug}:`, e);
    }
  }

  console.log(
    `og: generated ${generated}, skipped ${skipped} (already present), failed ${failed}`
  );
})();
