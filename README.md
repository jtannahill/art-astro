# art-astro

Astro 6 staging build for [art.jamestannahill.com](https://art.jamestannahill.com).
Lives at `art.jamestannahill.com/next/` while the legacy Jinja2 + Lambda
renderer (`art-generator/lambdas/site_rebuild`) is still source of truth
for the apex.

## Why this repo

Production rendering is a single Python Lambda that times out at 15 minutes
and has no component reuse, no responsive images, and no build-time type
safety on DynamoDB rows. This repo is the parallel migration target. Pages
move over one at a time, served at `/next/` until parity is reached.

## How it deploys

`/next/*` is served by the existing CloudFront distribution
(`E1ZBBUI25FIV7`, origin path `/site/`). This repo's GitHub Action
syncs `dist/` to `s3://art-generator-216890068001/site/next/` and
invalidates `/next/*`. **No CloudFront or DNS changes are required.**

Astro is configured with `base: '/next'` so URLs are emitted as
`/next/about/` etc.

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321/next/
npm run build    # static output in ./dist/
npm run preview
```

## CI deploy

`.github/workflows/deploy.yml` runs on push to `main` and on
`workflow_dispatch`. Required repo secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

The IAM principal needs:

- `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`
  on `art-generator-216890068001/site/next/*`
- `cloudfront:CreateInvalidation` on `E1ZBBUI25FIV7`

## Known gaps

- **Tailwind 4 / Astro 6 (rolldown) integration** is not yet shipped: the
  current `@tailwindcss/vite` plugin throws on rolldown's resolver bindings.
  Scaffold uses vanilla CSS for now. Re-add Tailwind at the first real page
  migration — by then upstream will have a fix, or we drop to PostCSS.

## Migration order

1. Deploy plumbing (this commit) ✅
2. `/about/` — mostly static, validates layout + SEO
3. Data adapter: DynamoDB scan → `src/content/{weather,palettes,artists}/`
4. `/archive/` paginated (biggest UX win)
5. Artist galleries + methodology blocks
6. Single weather pages
7. Homepage
8. Comparison, studies, map, palettes

## Cutover (later)

When parity is reached: drop `base` from `astro.config.mjs`, change the
S3 prefix to `site/`, point the CloudFront default behavior here, and
delete `art-site-rebuild` + the Jinja2 templates.
