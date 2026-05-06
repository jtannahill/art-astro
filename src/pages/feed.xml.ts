// Backwards-compat: the legacy Jinja renderer wrote /feed.xml until the
// cutover. Old subscribers should keep getting fresh items, so this
// route serves the same RSS handler as /rss.xml.
export { GET } from "./rss.xml.ts";
