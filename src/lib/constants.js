export const SUPPORTED_CITIES = [
  { id: "jakarta", label: "Jakarta" },
  { id: "bandung", label: "Bandung" },
  { id: "jogja", label: "Yogyakarta" },
  { id: "surabaya", label: "Surabaya" },
  { id: "bali", label: "Bali" },
  { id: "malang", label: "Malang" },
  { id: "semarang", label: "Semarang" },
  { id: "medan", label: "Medan" },
  { id: "makassar", label: "Makassar" },
];

export function cityToSlug(name) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function getCityData(slug) {
  const known = SUPPORTED_CITIES.find((c) => c.id === slug);
  if (known) return known;
  const label = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { id: slug, label };
}

export const EXCLUDED_CHAINS = [
  "starbucks",
  "kopi kenangan",
  "fore coffee",
  "janji jiwa",
  "excelso",
  "j.co",
  "chatime",
  "gong cha",
  "tiger sugar",
  "tomoro coffee",
  "flash coffee",
  "dunkin",
  "costa coffee",
  "mcdonald's",
  "kfc",
  "pizza hut",
];

export const MOOD_TAGS = [
  "Fokus",
  "Santai",
  "Social",
  "Aesthetic",
  "Sepi",
  "Ramai",
  "Cozy",
  "Industrial",
];

export const SORT_OPTIONS = [
  { id: "unique", label: "Paling Unik" },
  { id: "rating", label: "Rating Tertinggi" },
  { id: "wfc", label: "WFC Score" },
  { id: "nearest", label: "Terdekat", requiresLocation: true },
];

export const UNIQUE_WORDS = [
  "senja", "ruang", "sudut", "pojok", "sunyi", "langit",
  "gubuk", "pondok", "lost", "void", "fog", "ghost",
  "error", "blank", "still", "dim",
];

export const SCRAPE_QUERIES = [
  "cafe unik",
  "coffee shop aesthetic",
  "kedai kopi lokal",
  "cafe hidden gem",
];
