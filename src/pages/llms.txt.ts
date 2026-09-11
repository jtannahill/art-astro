// Generated at build time so artist and LoRA counts track src/data
// instead of drifting in a hand-edited static file.
import { ARTISTS, LORA_METHODOLOGY } from "../data/artists.ts";
import {
  TOTAL_ARTISTS, LORA_ARTIST_COUNT, SCAN_POINTS, LATITUDE_BANDS,
  TOP_LOCATIONS_PER_DAY, EDITION_SIZE,
} from "../data/counts.ts";

function list(names: string[]): string {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

export function GET() {
  const allNames = list(ARTISTS.map((a) => a.display));
  const loraNames = list(ARTISTS.filter((a) => a.key in LORA_METHODOLOGY).map((a) => a.display));
  const body = `# art.jamestannahill.com

> Daily generative art from real atmospheric data, inspired by abstract expressionism. Limited edition prints available.

## About
art.jt is a generative art project by James Tannahill. Every day, the system scans ${SCAN_POINTS} global weather points across ${LATITUDE_BANDS} latitude bands, identifies the ${TOP_LOCATIONS_PER_DAY} most visually dramatic atmospheric conditions, and generates original digital artwork - high-resolution PNG via Flux 1.1 Pro (or per-artist FLUX.1-dev LoRA fine-tunes for ${LORA_ARTIST_COUNT} artists) and a parallel vector SVG via Claude on Amazon Bedrock. Most artists are rendered from descriptive text prompts capturing their visual philosophy; for ${LORA_ARTIST_COUNT} artists (${loraNames}) a private LoRA fine-tune trained on hand-curated canvas reproductions is used instead. A parallel system extracts color palettes from Copernicus Sentinel-2 satellite imagery. The visual language draws from ${TOTAL_ARTISTS} artists: ${allNames}.

## Pages
- [Homepage](https://art.jamestannahill.com/) - Today's weather art with generate button and artist selector
- [Artists](https://art.jamestannahill.com/artist/) - Browse by artist inspiration (${TOTAL_ARTISTS} artists, infinite scroll galleries; ${LORA_ARTIST_COUNT} with custom FLUX.1-dev LoRA fine-tunes)
- [Archive](https://art.jamestannahill.com/archive/) - All past generations, browsable by run
- [World Map](https://art.jamestannahill.com/map/) - Interactive Mapbox globe with artwork and palette markers
- [Satellite Palettes](https://art.jamestannahill.com/palettes/) - Color palettes from Sentinel-2 orbital imagery
- [Compare](https://art.jamestannahill.com/comparison/) - Same weather data interpreted through ${TOTAL_ARTISTS} different artistic lenses
- [About](https://art.jamestannahill.com/about/) - About the project, methodology, weather data, and the artist

## Print Shop
Limited edition giclée prints available on every artwork page. Printed on Hahnemühle German Etching 310gsm with Certificate of Authenticity. Edition of ${EDITION_SIZE} per size. Ships worldwide via theprintspace.

## How It Works
Weather data from Open-Meteo API (GFS/NOAA model, 54 scan points, 6 variables per point) → scored for visual interest (pressure anomaly 30%, wind 25%, temperature deviation 20%, precipitation 15%, humidity 10%) → top 10 with 15° geographic separation → Flux 1.1 Pro (or the artist's FLUX.1-dev LoRA) renders the PNG while Claude on Amazon Bedrock generates a parallel vector SVG (CairoSVG render is the fallback if Flux fails) → AI art critic scores quality 1-10 (composition, color, complexity, impact) → archived permanently in S3 → static HTML gallery on CloudFront. Satellite imagery from Copernicus Sentinel-2 → color quantization → mood briefs via Bedrock.

## ML Models
- **Art Critic**: Bedrock Haiku vision evaluates each artwork on composition, color harmony, complexity, and emotional impact (1-10 scale). Scores influence print pricing and archive curation.
- **Weather Drama Forecaster**: Runs daily at 20:00 UTC, fetches 24h GFS forecast for all 54 points, predicts tomorrow's most visually dramatic locations.
- **Dynamic Pricing**: Print prices reflect quality score + weather rarity + edition scarcity. Base price can increase up to 2× for exceptional pieces from rare atmospheric events.

## Natural Scarcity
Every artwork is generated from a one-time atmospheric event. The weather data is archived, timestamped, and verifiable against NOAA public records. Unlike manufactured digital scarcity (minted supply caps), the scarcity is physical - the atmosphere produced it once and it's gone. Limited edition prints (${EDITION_SIZE} per size) add a physical layer on top. When the last print sells, the edition is closed permanently.

## API
Paid API at api.art.jamestannahill.com with three endpoints:
- Art Critic (POST /v1/critique): Score any image 1-10 on composition, color, complexity, impact. $0.02/req.
- Weather Drama (GET /v1/weather/rankings): Ranked global atmospheric drama locations. $0.005/req.
- Dynamic Pricing (POST /v1/price): Scarcity-based price multiplier from quality + rarity + demand. $0.005/req.
Free tier: 50 critiques + 100 weather + 100 pricing per month. Starter: $29/mo.
Docs: https://art.jamestannahill.com/api/

## Subscribe
- [RSS Feed](https://art.jamestannahill.com/feed.xml) - Latest artworks in RSS 2.0 format
- Newsletter signup available on every page - daily art digest via email

## Licensing
Artwork: CC BY-NC-ND 4.0 (attribution required, no commercial use, no derivatives)
Code: All Rights Reserved
Contact: art@jamestannahill.com
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
