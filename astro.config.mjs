import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Per-URL lastmod for the sitemap. Looked up from the build-time data
// snapshot. Falls back to today's date if a URL isn't tracked.
function lastmodForUrl(url) {
  try {
    const weatherPath = resolve('src/data/generated/weather.json');
    const palettesPath = resolve('src/data/generated/palettes.json');
    const weather = JSON.parse(readFileSync(weatherPath, 'utf8'));
    const palettes = JSON.parse(readFileSync(palettesPath, 'utf8'));

    // /weather/{run_id}/{slug}/
    const wMatch = url.match(/\/weather\/([^/]+)\/([^/]+)\//);
    if (wMatch) {
      const piece = weather.find((w) => w.run_id === wMatch[1] && w.slug === wMatch[2]);
      if (piece?.created_at) return piece.created_at.slice(0, 10);
    }
    // /palettes/{slug}/
    const pMatch = url.match(/\/palettes\/([^/]+)\/?$/);
    if (pMatch) {
      const samples = palettes.filter((p) => p.location_slug === pMatch[1]);
      if (samples.length) return samples.sort((a, b) => b.date.localeCompare(a.date))[0].date;
    }
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

// art.jamestannahill.com is now served entirely from this Astro build.
// CloudFront distro E1ZBBUI25FIV7 with origin path /site/ — we publish
// to s3://art-generator-216890068001/site/.
//
// Note: Tailwind 4 + Astro 6 (rolldown) don't yet ship a compatible vite
// plugin. Will add it back when the upstream incompat is resolved.
export default defineConfig({
  site: 'https://art.jamestannahill.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    assets: '_astro',
  },
  // Hover/viewport prefetch on every internal link.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = lastmodForUrl(item.url);
        return item;
      },
    }),
    mdx(),
  ],
  image: {
    responsiveStyles: true,
  },
  // Schema-validated env vars. astro:env enforces these at build.
  env: {
    schema: {
      PUBLIC_MAPBOX_TOKEN: envField.string({
        context: 'client',
        access: 'public',
        default: '',
      }),
    },
  },
});
