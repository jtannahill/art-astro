/**
 * Which built URLs belong in sitemap-0.xml.
 * Keep hubs + the last WEATHER_DAYS of pieces. Drop search, empty studies,
 * archive pagination, JSON endpoints, and older weather URLs that were
 * burning crawl budget (3,038 URLs, today's piece unknown to Google).
 */
export const WEATHER_DAYS = 14;

export function shouldIncludeInSitemap(url, now = Date.now()) {
  let path;
  try {
    path = new URL(url).pathname;
  } catch {
    path = url;
  }

  if (/\.json\/?$/.test(path)) return false;
  if (path === "/search/" || path.startsWith("/search/")) return false;
  if (path === "/studies/" || path.startsWith("/studies/")) return false;
  if (/^\/archive\/\d+\/$/.test(path)) return false;

  const piece = path.match(/^\/weather\/([^/]+)\/([^/]+)\/$/);
  if (piece) return isRecentRun(piece[1], now);

  const run = path.match(/^\/weather\/([^/]+)\/$/);
  if (run) return isRecentRun(run[1], now);

  return true;
}

function isRecentRun(runId, now) {
  const ms = Date.parse(`${runId.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(ms)) return false;
  return now - ms <= WEATHER_DAYS * 86400000;
}
