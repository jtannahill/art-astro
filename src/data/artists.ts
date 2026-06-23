/**
 * Single source of truth for the 16-artist roster + the 7 LoRA
 * methodology blocks. Both /artist/ and /artist/[key]/ render from here.
 */

export interface ArtistInfo {
  key: string;
  display: string;
  link: string;
}

export const ARTISTS: ArtistInfo[] = [
  { key: "sam_francis",         display: "Sam Francis",         link: "https://www.guggenheim.org/artwork/artist/sam-francis" },
  { key: "gerhard_richter",     display: "Gerhard Richter",     link: "https://www.guggenheim.org/artwork/artist/gerhard-richter" },
  { key: "hilma_af_klint",      display: "Hilma af Klint",      link: "https://www.guggenheim.org/artwork/artist/hilma-af-klint" },
  { key: "wassily_kandinsky",   display: "Wassily Kandinsky",   link: "https://www.guggenheim.org/artwork/artist/vasily-kandinsky" },
  { key: "helen_frankenthaler", display: "Helen Frankenthaler", link: "https://www.guggenheim.org/artwork/artist/helen-frankenthaler" },
  { key: "piet_mondrian",       display: "Piet Mondrian",       link: "https://www.guggenheim.org/artwork/artist/piet-mondrian" },
  { key: "yayoi_kusama",        display: "Yayoi Kusama",        link: "https://www.guggenheim.org/artwork/artist/yayoi-kusama" },
  { key: "mark_rothko",         display: "Mark Rothko",         link: "https://www.guggenheim.org/artwork/artist/mark-rothko" },
  { key: "bridget_riley",       display: "Bridget Riley",       link: "https://www.tate.org.uk/art/artists/bridget-riley-1845" },
  { key: "kazimir_malevich",    display: "Kazimir Malevich",    link: "https://www.guggenheim.org/artwork/artist/kazimir-malevich" },
  { key: "lesley_tannahill",    display: "Lesley Tannahill",    link: "https://lesleytannahill.com" },
  { key: "arshile_gorky",       display: "Arshile Gorky",       link: "https://www.guggenheim.org/artwork/artist/arshile-gorky" },
  { key: "willem_de_kooning",   display: "Willem de Kooning",   link: "https://www.guggenheim.org/artwork/artist/willem-de-kooning" },
  { key: "joan_mitchell",       display: "Joan Mitchell",       link: "https://www.guggenheim.org/artwork/artist/joan-mitchell" },
  { key: "mark_tobey",          display: "Mark Tobey",          link: "https://www.guggenheim.org/artwork/artist/mark-tobey" },
  { key: "peter_max",           display: "Peter Max",           link: "https://petermax.com" },
  { key: "norman_lewis",        display: "Norman Lewis",        link: "https://www.wikiart.org/en/norman-lewis" },
];

export const ARTISTS_BY_KEY: Record<string, ArtistInfo> = Object.fromEntries(
  ARTISTS.map((a) => [a.key, a])
);

export interface LoraMethodology {
  artist_display: string;
  source_url: string;
  source_label: string;
  /** Trailing fragment appended after the source label - may contain HTML */
  series_html: string;
  /**
   * Optional override for the captioning-method sentence. Omit to use the
   * default (hand-written title/medium/dimensions/year captions). Set it for
   * LoRAs trained with the trainer's autocaption instead.
   */
  caption_html?: string;
  training_set_count: number;
  lora_rank: number;
  steps: number;
  train_minutes: number;
  trigger_word: string;
  filed_date: string;
}

export const LORA_METHODOLOGY: Record<string, LoraMethodology> = {
  lesley_tannahill: {
    artist_display: "Lesley Tannahill",
    source_url: "https://lesleytannahill.com",
    source_label: "lesleytannahill.com",
    series_html:
      ', spanning the <em>Selected Self-Portraits</em> series: ' +
      '<a href="https://lesleytannahill.com/selected-self-portraits/fictions/" target="_blank" rel="noopener"><em>Fictions</em></a>, ' +
      '<a href="https://lesleytannahill.com/selected-self-portraits/making-up-my-minds/" target="_blank" rel="noopener"><em>Making Up My Minds</em></a>, ' +
      'and <a href="https://lesleytannahill.com/selected-self-portraits/process-of-discovery/" target="_blank" rel="noopener"><em>Process of Discovery</em></a>',
    training_set_count: 28,
    lora_rank: 32,
    steps: 1500,
    train_minutes: 12,
    trigger_word: "lesley_tannahill_style",
    filed_date: "2026-05-05",
  },
  sam_francis: {
    artist_display: "Sam Francis",
    source_url: "https://samfrancis.com",
    source_label: "samfrancis.com",
    series_html:
      ", drawn from his <em>Works on Canvas</em> catalog (1946-1992), " +
      "including oil and acrylic paintings across his action-painting and color-field periods",
    training_set_count: 31,
    lora_rank: 32,
    steps: 1500,
    train_minutes: 12,
    trigger_word: "sam_francis_style",
    filed_date: "2026-05-05",
  },
  hilma_af_klint: {
    artist_display: "Hilma af Klint",
    source_url: "https://www.wikiart.org/en/hilma-af-klint",
    source_label: "WikiArt catalog",
    series_html:
      ", covering the <em>Paintings for the Temple</em> body of work (1906-1920) " +
      "including <em>The Ten Largest</em>, <em>The Swan</em>, <em>The Dove</em>, " +
      "<em>Atom Series</em>, and the <em>Altarpieces</em>",
    training_set_count: 27,
    lora_rank: 32,
    steps: 1500,
    train_minutes: 12,
    trigger_word: "hilma_af_klint_style",
    filed_date: "2026-05-05",
  },
  joan_mitchell: {
    artist_display: "Joan Mitchell",
    source_url: "https://www.wikiart.org/en/joan-mitchell",
    source_label: "WikiArt catalog",
    series_html:
      ", spanning her New York and Vetheuil periods (1951-1992) - " +
      "gestural abstractions and color-field landscapes built from dense " +
      "clusters of expressive brushwork",
    training_set_count: 60,
    lora_rank: 32,
    steps: 1500,
    train_minutes: 12,
    trigger_word: "joan_mitchell_style",
    filed_date: "2026-05-05",
  },
  willem_de_kooning: {
    artist_display: "Willem de Kooning",
    source_url: "https://www.dekooning.org/the-artist/artworks/view/paintings",
    source_label: "Willem de Kooning Foundation archive",
    series_html:
      ", drawn from his full painted oeuvre (1916-1988) - the <em>Women</em> series, " +
      "abstract urban landscapes, and late ribbon paintings",
    training_set_count: 66,
    lora_rank: 32,
    steps: 1500,
    train_minutes: 12,
    trigger_word: "willem_de_kooning_style",
    filed_date: "2026-05-05",
  },
  helen_frankenthaler: {
    artist_display: "Helen Frankenthaler",
    source_url: "https://www.wikiart.org/en/helen-frankenthaler",
    source_label: "WikiArt catalog",
    series_html:
      ", spanning her soak-stain breakthroughs and color-field works (1952-2004) - " +
      "thinned acrylic poured onto unprimed canvas, atmospheric color washes",
    training_set_count: 60,
    lora_rank: 32,
    steps: 1500,
    train_minutes: 12,
    trigger_word: "helen_frankenthaler_style",
    filed_date: "2026-05-05",
  },
  gerhard_richter: {
    artist_display: "Gerhard Richter",
    source_url: "https://www.wikiart.org/en/gerhard-richter",
    source_label: "WikiArt catalog",
    series_html:
      ", covering his photorealist canvases and the squeegee <em>Abstrakte Bilder</em> " +
      "(1962-2017) - dragged-paint surfaces, color-strip compositions, blurred photo paintings",
    training_set_count: 60,
    lora_rank: 32,
    steps: 1500,
    train_minutes: 12,
    trigger_word: "gerhard_richter_style",
    filed_date: "2026-05-05",
  },
  arshile_gorky: {
    artist_display: "Arshile Gorky",
    source_url: "https://www.wikiart.org/en/arshile-gorky",
    source_label: "WikiArt catalog",
    series_html:
      ", drawn from his mature biomorphic abstractions (1940-1948) - fluid " +
      "organic forms, thinned washes, and linear armatures that bridge " +
      "Surrealism and Abstract Expressionism",
    caption_html:
      "Images were auto-captioned by the trainer with the trigger word " +
      "prepended, binding it to the artist's visual language rather than a " +
      "generic style label.",
    training_set_count: 27,
    lora_rank: 16,
    steps: 1000,
    train_minutes: 10,
    trigger_word: "arshile_gorky_style",
    filed_date: "2026-06-22",
  },
  norman_lewis: {
    artist_display: "Norman Lewis",
    source_url: "https://www.wikiart.org/en/norman-lewis",
    source_label: "WikiArt catalog",
    series_html:
      ", drawn from his mature abstract period (1945-1979) - calligraphic " +
      "processions of small marks, glyphs, and crowds dissolving across deep " +
      "atmospheric grounds",
    caption_html:
      "Images were auto-captioned by the trainer with the trigger word " +
      "prepended, binding it to the artist's visual language rather than a " +
      "generic style label.",
    training_set_count: 14,
    lora_rank: 16,
    steps: 1000,
    train_minutes: 20,
    trigger_word: "norman_lewis_style",
    filed_date: "2026-06-22",
  },
};

export function hasLora(key: string): boolean {
  return key in LORA_METHODOLOGY;
}
