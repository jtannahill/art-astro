import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

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
  integrations: [
    sitemap(),
    mdx(),
  ],
  image: {
    responsiveStyles: true,
  },
});
