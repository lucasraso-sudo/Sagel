import { norm } from "./normalize";

// ---------------------------------------------------------------------------
// Qualitative intent layer for search ("peu bruyant", "consomme peu"…).
//
// A curated French lexicon maps modifier phrases to an abstract intent, and
// each intent maps to an ordered list of candidate spec keys + direction. The
// first spec a product actually carries is used, so the same modifier resolves
// to the right characteristic per category (e.g. "puissant" → airflow for a
// fan, cooling_power for an AC). Re-ranks search hits; does NOT touch scoring.
// ---------------------------------------------------------------------------

export type Direction = "min" | "max";

export interface IntentDef {
  id: string;
  /** Short FR label for the UI banner. */
  label: string;
  arrow: "↑" | "↓";
  /** Normalized trigger phrases (diacritics-free). */
  triggers: string[];
  /** Ordered candidate keys; pseudo keys: "price", "finalScore", "energy_class". */
  specs: Array<{ key: string; dir: Direction }>;
}

export const INTENTS: IntentDef[] = [
  {
    id: "quiet",
    label: "silence",
    arrow: "↓",
    triggers: [
      "peu bruyant",
      "silencieux",
      "silencieuse",
      "pas bruyant",
      "sans bruit",
      "peu de bruit",
      "faible bruit",
      "discret",
    ],
    specs: [{ key: "noise_level", dir: "min" }],
  },
  {
    id: "low_consumption",
    label: "consommation",
    arrow: "↓",
    triggers: [
      "qui consomme peu",
      "consomme peu",
      "basse consommation",
      "faible consommation",
      "econome",
      "peu energivore",
      "moins energivore",
      "classe a",
    ],
    specs: [
      { key: "consumption", dir: "min" },
      { key: "energy_class", dir: "max" },
      { key: "energy_rating", dir: "max" },
      { key: "power", dir: "min" },
      { key: "max_power", dir: "min" },
    ],
  },
  {
    id: "powerful",
    label: "puissance",
    arrow: "↑",
    triggers: [
      "puissant",
      "puissante",
      "performant",
      "performante",
      "haute puissance",
      "gros debit",
      "tres efficace",
    ],
    specs: [
      { key: "airflow", dir: "max" },
      { key: "cooling_power", dir: "max" },
      { key: "heating_power", dir: "max" },
      { key: "cadr", dir: "max" },
      { key: "extraction_rate", dir: "max" },
      { key: "extraction", dir: "max" },
      { key: "pressure", dir: "max" },
      { key: "spin_speed", dir: "max" },
      { key: "coverage_area", dir: "max" },
    ],
  },
  {
    id: "large",
    label: "capacité",
    arrow: "↑",
    triggers: [
      "grande capacite",
      "grand volume",
      "grande contenance",
      "spacieux",
      "familial",
      "gros volume",
    ],
    specs: [
      { key: "capacity", dir: "max" },
      { key: "volume", dir: "max" },
      { key: "tank_size", dir: "max" },
      { key: "bowl_capacity", dir: "max" },
      { key: "place_settings", dir: "max" },
      { key: "bottles", dir: "max" },
    ],
  },
  {
    id: "compact",
    label: "compacité",
    arrow: "↓",
    triggers: [
      "compact",
      "compacte",
      "peu encombrant",
      "gain de place",
      "pour petit espace",
      "petit format",
    ],
    specs: [
      { key: "volume", dir: "min" },
      { key: "capacity", dir: "min" },
      { key: "tank_size", dir: "min" },
    ],
  },
  {
    id: "cheap",
    label: "prix",
    arrow: "↓",
    triggers: [
      "pas cher",
      "abordable",
      "economique",
      "bon marche",
      "petit prix",
      "moins cher",
    ],
    specs: [{ key: "price", dir: "min" }],
  },
  {
    id: "premium",
    label: "haut de gamme",
    arrow: "↑",
    triggers: [
      "haut de gamme",
      "premium",
      "tres bonne qualite",
      "qualite superieure",
    ],
    specs: [
      { key: "price", dir: "max" },
      { key: "finalScore", dir: "max" },
    ],
  },
];

// Small filler set left over after stripping modifier phrases.
const STOPWORDS = new Set([
  "qui",
  "peu",
  "tres",
  "plus",
  "est",
  "pour",
  "avec",
  "des",
  "les",
  "une",
  "un",
]);

/** Minimal product shape needed to resolve an intent's value. */
export interface IntentProduct {
  price?: number | null;
  specifications?: Array<{ key: string; value: string }>;
  productScore?: { finalScore: number } | null;
}

export interface ResolvedValue {
  value: number;
  dir: Direction;
}

/** Energy class letter (A–G, with optional "+") → higher-is-better score. */
function energyClassScore(raw: string): number | null {
  const m = norm(raw).toUpperCase().match(/[A-G]/);
  if (!m) return null;
  const base = "GFEDCBA".indexOf(m[0]); // G=0 … A=6
  if (base < 0) return null;
  const plus = (raw.match(/\+/g) || []).length;
  return base + plus * 0.3;
}

/** Detect which intents the query expresses. */
export function parseQualifiers(query: string): IntentDef[] {
  const q = norm(query);
  return INTENTS.filter((def) =>
    def.triggers.some((t) => q.includes(norm(t)))
  );
}

/**
 * Remove recognized modifier phrases (and trailing fillers) from the query so
 * text relevance focuses on the product nouns. Falls back to the original if
 * stripping leaves nothing.
 */
export function stripQualifiers(query: string): string {
  let q = norm(query);
  const phrases = INTENTS.flatMap((d) => d.triggers.map(norm)).sort(
    (a, b) => b.length - a.length
  );
  for (const p of phrases) q = q.split(p).join(" ");
  const rest = q
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
    .join(" ")
    .trim();
  return rest.length > 0 ? rest : norm(query);
}

/** Resolve an intent to a comparable numeric value for a product, or null. */
export function resolveIntentValue(
  product: IntentProduct,
  def: IntentDef
): ResolvedValue | null {
  for (const cand of def.specs) {
    if (cand.key === "price") {
      if (product.price != null && Number.isFinite(product.price)) {
        return { value: product.price, dir: cand.dir };
      }
      continue;
    }
    if (cand.key === "finalScore") {
      const s = product.productScore?.finalScore;
      if (s != null) return { value: s, dir: cand.dir };
      continue;
    }
    const spec = (product.specifications ?? []).find((s) => s.key === cand.key);
    if (!spec) continue;
    if (cand.key === "energy_class") {
      const v = energyClassScore(spec.value);
      if (v != null) return { value: v, dir: cand.dir };
      continue;
    }
    const v = parseFloat(String(spec.value).replace(",", "."));
    if (Number.isFinite(v)) return { value: v, dir: cand.dir };
  }
  return null;
}
