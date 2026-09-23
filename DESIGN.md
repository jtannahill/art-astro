---
version: alpha
name: art.jt
description: Design language for art.jamestannahill.com, a static gallery of daily generative weather art with a print shop.
colors:
  bg: "#0a0a0f"
  fg: "#ffffff"
  muted: "#888888"
  border: "#2a2a2a"
  accent: "#c9a66b"
  link: "#9eb8a8"
typography:
  sans:
    fontFamily: Newsreader
  mono:
    fontFamily: JetBrains Mono
---

## Overview

art.jt publishes generated weather paintings every day, with the rationale, conditions and palette behind each piece, and sells prints of them. The interface is a dark gallery: near-black ground, a single warm gold accent, and a literary serif, so the artwork carries the color and the chrome stays quiet.

## Colors

- `bg` is the only page ground. Raised surfaces (cards, panels, drawers, inputs) are slightly lighter near-blacks set on it, separated by `border`, never by a lighter full-bleed band.
- `fg` is for titles, primary values and text inside raised panels. Long rationale and body copy inside panels steps down to a light gray rather than pure `fg`.
- `muted` is for metadata, dates, captions, form labels, nav items at rest and uppercase section labels.
- `accent` (gold) marks value and commitment: primary action buttons, prices, the selected print size, "how it works" section labels, the skip link, and hover on the search trigger. Do not spend it on ordinary links.
- `link` (sage) is for inline text links and the hover state of navigation. Links carry no underline at rest and underline on hover.
- Primary actions use a dark warm-brown gradient with `accent` text and a translucent `accent` border; hover brightens the gradient and the border. This treatment recurs on the footer subscribe button, the homepage generate button and the piece page print and checkout buttons.

## Themes

The site ships one dark theme. There is no light theme and no `prefers-color-scheme` switch.

## Typography

- `sans` (Newsreader, falling back to Georgia and Times New Roman) is the family for everything, including form controls: `input`, `select`, `textarea` and `button` inherit the page font at 1rem, so no control falls back to a system sans and iOS does not zoom on focus.
- `mono` (JetBrains Mono) is reserved for the `art.jt` wordmark, keyboard hints such as the search shortcut, and the `.mono` utility for machine-like values.
- Page titles are large with slight negative tracking and shrink one step on narrow screens. Section and eyebrow labels are small, uppercase and letter-spaced in `muted` (or `accent` for the "how it works" block).
- Italic serif is used for palette mood lines.
- Readable prose blocks (ledes, methodology) are capped at about 60 characters per line.

## Layout

- Content is a single centered column capped at 720px for both `main` and the footer, with tighter side padding under 720px.
- The header is sticky, translucent `bg` with a backdrop blur and a bottom `border`. At 720px and below it becomes wordmark, icon-only search and a menu toggle, with navigation collapsing into a vertical list behind the toggle.
- Every interactive target is at least 44px tall (nav links, crumbs, buttons, footer links, dialog close buttons). Keep this floor for new controls.
- Page chrome respects `env(safe-area-inset-*)` on the header, body sides, footer, toast and mobile drawer.
- Card grids use auto-fill columns that collapse to one column on phones; thumbnails are square and cropped with `object-fit: cover`.

## Elevation & Depth

- Depth comes from borders and small steps in surface lightness, not shadows. The search panel is the only element with a drop shadow.
- Overlays (search backdrop, print drawer overlay) dim the page; the search backdrop also blurs it.
- Motion is short and functional: color, border and opacity transitions, a small press scale on buttons, and a card lift on hover that only applies to devices with a fine hover-capable pointer.
- Under `prefers-reduced-motion: reduce`, view transitions are instant and transitions are limited to opacity and color properties, so drawers, toasts and card lifts stop moving.

## Shapes

- Artwork is always framed: a 1px dark border, rounded corners, `overflow: hidden` and a near-black placeholder background behind the image.
- Corners are softly rounded throughout; the search trigger is a pill on desktop and a rounded square on mobile. The mobile print drawer rounds only its top corners.

## Components

- **Skip link**: first focusable element on every page, hidden above the viewport until focused, gold text and border on a dark chip, targeting `#main`.
- **Search dialog**: a modal (`role="dialog"`, `aria-modal="true"`) opened by the header trigger, Cmd/Ctrl+K or `/` outside text fields. Pagefind UI loads lazily on first open and is themed with the site tokens and serif. Focus moves to the search input, Tab is trapped inside the panel, Escape or the backdrop closes it, and focus returns to the opener.
- **Print drawer**: a modal dialog that is a right-side sheet on desktop and a bottom sheet on phones. It is `inert` while closed, moves focus to its close button on open, closes on Escape or overlay click, and returns focus to the button that opened it.
- **Print size options**: each size is a real `button` with `aria-pressed`; the selected size takes the `accent` border and a warm dark fill, and sold-out sizes are disabled and dimmed with a red badge. The options region is `aria-live="polite"`. When no sizes are offered it shows a "not available yet" message instead of an empty list. The checkout button stays disabled until a size is chosen; if checkout reports the chosen size sold out, the button says so, the selection is cleared and edition counts reload so the buyer can pick again.
- **Archive filters**: artist chips are toggle buttons with `aria-pressed` mirroring the active chip, next to a minimum-quality slider whose row wraps on narrow screens. The shown count is `aria-live="polite"`, and when no pieces on the page match, a `muted` empty-state line appears.
- **Buttons**: primary actions use the gold gradient treatment described under Colors; secondary actions are neutral dark chips with a gray border that lightens on hover. Both scale down slightly while pressed. A button whose request is in flight (such as Generate) is truly `disabled` and `aria-busy="true"` alongside its loading spinner until the request settles.
- **Status messages**: transient feedback (homepage toast, footer subscribe result) lives in `aria-live="polite"` regions; success is green, errors are a soft red.
- **Cards**: dark raised surface, 1px border, square thumbnail, then a compact body with a gold date or meta line, `muted` artist and conditions lines, and optional palette swatches. Card and drawer thumbnails use empty `alt` because the adjacent title already names the piece.

## Do's and Don'ts

- Do separate page titles with `|` and end them with the `art.jt` brand.
- Don't use an em-dash in page titles; a test enforces this for piece titles.

## Open Questions

- No radius or spacing tokens exist. Corners recur at a few literal sizes and spacing is ad hoc per page; it is undecided whether to promote a scale.
- Two raised-surface families coexist as literals: neutral grays (piece page, cards) and blue-tinted near-blacks (header controls, search panel, homepage artist bar and "how it works" block). Which family is canonical is not recorded.
- The `theme-color` meta value does not match `bg` exactly.
- Success and error colors are literals, not tokens.
- Focus indication relies on browser default rings; no custom focus-visible style is defined, and whether one should exist is open.
- Headings are meant to be sentence case, but several titles and card headings apply `text-transform: capitalize` to generated slugs. The intended casing rule for generated names is unresolved.
- The print drawer relies on `inert` and focus placement but has no Tab trap like the search dialog; whether it needs one is open.
