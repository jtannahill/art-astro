/**
 * Record each piece's real preview size → src/data/generated/image-dims.json.
 *
 * canvas_format is the requested canvas, not the delivered file: Flux 1.1
 * Pro always returns 1024x1024, and the FLUX.1-dev LoRA snaps to its own
 * bucket sizes (a "1920x1920" request can come back 896x1152 or 1344x768).
 * Pages need the true aspect for width/height, so read it from the PNG
 * header (first 32 bytes via a Range request).
 *
 * Incremental: sizes already in the file are kept, so a local rebuild only
 * probes new pieces. Never fails the build; a missing entry falls back to
 * the renderer rules in src/lib/pieces.ts.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROD = "https://art.jamestannahill.com";
const CONCURRENCY = 32;

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(here, "..", "src", "data", "generated");
const OUT = `${OUT_DIR}/image-dims.json`;

type Dims = Record<string, [number, number]>;

const weather: { run_id: string; slug: string }[] = JSON.parse(
  readFileSync(`${OUT_DIR}/weather.json`, "utf8")
);
let dims: Dims = {};
if (existsSync(OUT)) {
  try {
    dims = JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    dims = {};
  }
}

async function probe(runId: string, slug: string): Promise<[number, number] | null> {
  try {
    const r = await fetch(`${PROD}/weather/${runId}/${slug}/preview-2048.png`, {
      headers: { Range: "bytes=0-31" },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return null;
    const b = Buffer.from(await r.arrayBuffer());
    if (b.length < 24 || b.toString("ascii", 1, 4) !== "PNG") return null;
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  } catch {
    return null;
  }
}

const todo = weather.filter((w) => w.run_id && w.slug && !dims[`${w.run_id}/${w.slug}`]);
let found = 0;
for (let i = 0; i < todo.length; i += CONCURRENCY) {
  await Promise.all(
    todo.slice(i, i + CONCURRENCY).map(async (w) => {
      const d = await probe(w.run_id, w.slug);
      if (d) {
        dims[`${w.run_id}/${w.slug}`] = d;
        found += 1;
      }
    })
  );
}

writeFileSync(OUT, JSON.stringify(dims));
console.log(`image dims: ${found}/${todo.length} probed, ${Object.keys(dims).length} known`);
