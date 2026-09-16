import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldIncludeInSitemap } from "../../sitemap-policy.mjs";
import {
  artistSeoTitle,
  lastName,
  paletteDisplayName,
  paletteSeoTitle,
  pieceH1,
  pieceSeoTitle,
  placeFromSlug,
  sanitizeRationale,
} from "./seo.ts";

describe("placeFromSlug", () => {
  it("splits region and coords", () => {
    assert.deepEqual(placeFromSlug("central-asia-30n-70e"), {
      region: "Central Asia",
      coords: "30°N, 70°E",
    });
  });

  it("title-cases named events without a grid suffix", () => {
    assert.equal(placeFromSlug("nz-coast-rothko-8k").region, "Nz Coast Rothko 8k");
  });
});

describe("pieceSeoTitle", () => {
  it("stays under 60 chars and leads with the artist", () => {
    const t = pieceSeoTitle("Helen Frankenthaler", "central-asia-30n-70e", "2026-09-16");
    assert.ok(t.length <= 60, t);
    assert.match(t, /Frankenthaler/);
    assert.match(t, /Central Asia/);
    assert.match(t, /art\.jt$/);
  });

  it("handles long artist names", () => {
    const t = pieceSeoTitle("Wassily Kandinsky", "western-pacific-15n-120e", "2026-09-16");
    assert.ok(t.length <= 60, t);
    assert.match(t, /Kandinsky/);
  });
});

describe("palette titles", () => {
  it("uses the real place name", () => {
    assert.equal(paletteDisplayName("namib"), "Namib Desert");
    const t = paletteSeoTitle("namib");
    assert.ok(t.length <= 60, t);
    assert.match(t, /Namib Desert/);
    assert.match(t, /Sentinel-2/);
  });
});

describe("artistSeoTitle", () => {
  it("names the artist and piece count", () => {
    const t = artistSeoTitle("Yayoi Kusama", 142);
    assert.ok(t.length <= 60, t);
    assert.match(t, /Kusama/);
    assert.match(t, /142/);
  });
});

describe("lastName", () => {
  it("keeps particles", () => {
    assert.equal(lastName("Willem de Kooning"), "de Kooning");
    assert.equal(lastName("Hilma af Klint"), "af Klint");
    assert.equal(lastName("Helen Frankenthaler"), "Frankenthaler");
  });
});

describe("sanitizeRationale", () => {
  it("rewrites the Hindu Kush unit errors", () => {
    const out = sanitizeRationale(
      "pressure of 830 Pa ... frigid temperature of 27.8 K (-245°C) and low humidity",
    );
    assert.match(out, /830 hPa/);
    assert.match(out, /27\.8°C/);
    assert.doesNotMatch(out, /-245/);
  });
});

describe("shouldIncludeInSitemap", () => {
  const now = Date.parse("2026-09-16T12:00:00Z");
  const u = (p: string) => `https://art.jamestannahill.com${p}`;

  it("keeps hubs", () => {
    assert.equal(shouldIncludeInSitemap(u("/"), now), true);
    assert.equal(shouldIncludeInSitemap(u("/about/"), now), true);
    assert.equal(shouldIncludeInSitemap(u("/palettes/"), now), true);
    assert.equal(shouldIncludeInSitemap(u("/palettes/namib/"), now), true);
    assert.equal(shouldIncludeInSitemap(u("/artist/yayoi_kusama/"), now), true);
    assert.equal(shouldIncludeInSitemap(u("/archive/"), now), true);
    assert.equal(shouldIncludeInSitemap(u("/comparison/"), now), true);
    assert.equal(shouldIncludeInSitemap(u("/api/"), now), true);
  });

  it("drops search, studies, archive pagination, json", () => {
    assert.equal(shouldIncludeInSitemap(u("/search/"), now), false);
    assert.equal(shouldIncludeInSitemap(u("/studies/"), now), false);
    assert.equal(shouldIncludeInSitemap(u("/archive/2/"), now), false);
    assert.equal(shouldIncludeInSitemap(u("/api/artists.json"), now), false);
  });

  it("keeps only the last 14 days of weather pieces", () => {
    assert.equal(
      shouldIncludeInSitemap(u("/weather/2026-09-16-060044/central-asia-30n-70e/"), now),
      true,
    );
    assert.equal(
      shouldIncludeInSitemap(u("/weather/2026-08-30-060044/western-pacific-15n-120e/"), now),
      false,
    );
    assert.equal(shouldIncludeInSitemap(u("/weather/2026-09-16-060044/"), now), true);
    assert.equal(shouldIncludeInSitemap(u("/weather/2026-03-25-8k-test/"), now), false);
  });
});

describe("pieceH1", () => {
  it("is the human region, not the grid code", () => {
    assert.equal(pieceH1("central-asia-30n-70e"), "Central Asia");
  });
});
