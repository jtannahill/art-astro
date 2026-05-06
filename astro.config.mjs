import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// Preview deploys land at art.jamestannahill.com/next/* via the existing
// CloudFront distro (origin path /site/, S3 bucket art-generator-216890068001).
// Once we cut over, drop `base` and `site` becomes the apex.
//
// Note: Tailwind 4 + Astro 6 (rolldown) don't yet ship a compatible vite
// plugin. We'll add it back at the first real page migration.
export default defineConfig({
  site: 'https://art.jamestannahill.com',
  base: '/next',
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
