import type { Category } from "@/app/generated/prisma/enums";
import { CATEGORY_LABELS, modelName } from "@/app/types";
import { CATEGORY_KEYWORDS } from "@/lib/recommendation/recommend";
import { norm, tokenize } from "./normalize";
import {
  parseQualifiers,
  stripQualifiers,
  resolveIntentValue,
  type IntentDef,
} from "./intent";

// ---------------------------------------------------------------------------
// Free-text product search (in-memory, relevance-ranked).
//
// Pure function over an already-loaded product list — no DB, no scoring engine.
// Designed for the catalog scale (~hundreds of products): a full scan per query
// is instant and behaves identically on PGlite (local) and Neon (prod).
//
// Matches, by decreasing weight: MPN ▸ brand ▸ model/name ▸ category
// (label + keywords) ▸ description. Diacritics-insensitive (French).
//
// On top of text matching, a qualitative-intent layer (lib/search/intent.ts)
// re-ranks results when the query expresses a preference ("peu bruyant",
// "consomme peu"…), sorting by the relevant characteristic. Read-only over
// existing spec values — the scoring engine is untouched.
// ---------------------------------------------------------------------------

export type MatchField =
  | "mpn"
  | "brand"
  | "name"
  | "category"
  | "description";

/** Minimal shape the search needs; callers may pass richer Product objects. */
export interface SearchableProduct {
  name: string;
  brand: string;
  category: Category;
  mpn: string;
  description?: string | null;
  price?: number | null;
  specifications?: Array<{ key: string; value: string; unit?: string | null }>;
  productScore?: { finalScore: number } | null;
}

export interface SearchHit<T> {
  product: T;
  relevance: number;
  matchedFields: MatchField[];
  /** 0–1 fit to the detected qualitative intents (0 when none detected). */
  intentScore: number;
}

/** A qualitative intent applied to the ranking, for UI display. */
export interface AppliedIntent {
  id: string;
  label: string;
  arrow: "↑" | "↓";
}

export interface SearchResponse<T> {
  hits: SearchHit<T>[];
  intents: AppliedIntent[];
}

// Inclusion floor: filters out incidental single-word description hits while
// keeping any real brand / name / category / MPN match.
const MIN_RELEVANCE = 3;

function scoreProduct<T extends SearchableProduct>(
  product: T,
  tokens: string[],
  fullQuery: string
): { relevance: number; matchedFields: MatchField[] } {
  const brandN = norm(product.brand);
  const brandWords = new Set(brandN.split(" "));
  const nameN = norm(product.name);
  const nameWords = new Set(nameN.split(" "));
  const modelN = norm(modelName(product.brand, product.name));
  const mpnN = norm(product.mpn).replace(/\s+/g, "");
  const labelN = norm(CATEGORY_LABELS[product.category] ?? "");
  const labelWords = new Set(labelN.split(" "));
  const keywordsN = (CATEGORY_KEYWORDS[product.category] ?? []).map(norm);
  const descN = norm(product.description ?? "");

  const queryNoSpaces = fullQuery.replace(/\s+/g, "");
  const matched = new Set<MatchField>();
  let relevance = 0;

  // Whole-query MPN reference match (e.g. typing "PAC EX105" or "TP10").
  if (mpnN.length >= 3 && queryNoSpaces.length >= 3) {
    if (mpnN === queryNoSpaces || mpnN.includes(queryNoSpaces)) {
      relevance += 25;
      matched.add("mpn");
    }
  }

  // Whole-query category phrase match (e.g. "cave à vin", "lave-vaisselle").
  for (const kw of keywordsN) {
    if (kw.length >= 3 && fullQuery.includes(kw)) {
      relevance += 5;
      matched.add("category");
      break;
    }
  }

  // Per-token weighted matching.
  for (const t of tokens) {
    if (mpnN.length >= 3 && t.length >= 3 && mpnN.includes(t)) {
      relevance += 7;
      matched.add("mpn");
    }
    if (brandWords.has(t)) {
      relevance += 8;
      matched.add("brand");
    } else if (brandN.includes(t)) {
      relevance += 4;
      matched.add("brand");
    }
    if (nameWords.has(t)) {
      relevance += 6;
      matched.add("name");
    } else if (nameN.includes(t) || modelN.includes(t)) {
      relevance += 3;
      matched.add("name");
    }
    if (labelWords.has(t)) {
      relevance += 5;
      matched.add("category");
    } else if (keywordsN.some((kw) => kw.split(" ").includes(t))) {
      relevance += 5;
      matched.add("category");
    }
    if (descN.includes(t)) {
      relevance += 1;
      matched.add("description");
    }
  }

  return { relevance, matchedFields: [...matched] };
}

/**
 * Score each hit 0–1 against the detected intents and attach it as
 * `intentScore`. Each intent's target characteristic is normalized across the
 * candidate set (missing value → 0). Returns the intents that actually had data.
 */
function applyIntentRanking<T extends SearchableProduct>(
  hits: SearchHit<T>[],
  intents: IntentDef[]
): IntentDef[] {
  const stats = intents.map((def) => {
    const values: number[] = [];
    for (const h of hits) {
      const r = resolveIntentValue(h.product, def);
      if (r) values.push(r.value);
    }
    return {
      def,
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
      hasData: values.length > 0,
    };
  });

  const active = stats.filter((s) => s.hasData);

  for (const h of hits) {
    let sum = 0;
    let count = 0;
    for (const s of active) {
      const r = resolveIntentValue(h.product, s.def);
      let unit: number;
      if (r == null) unit = 0; // lacks the characteristic → ranked last for it
      else if (s.max === s.min) unit = 0.5;
      else {
        const t = (r.value - s.min) / (s.max - s.min); // 0..1, higher raw value
        unit = r.dir === "max" ? t : 1 - t;
      }
      sum += unit;
      count++;
    }
    h.intentScore = count > 0 ? sum / count : 0;
  }

  return active.map((s) => s.def);
}

/**
 * Rank `products` by relevance to `query`. When the query expresses qualitative
 * intents ("peu bruyant"…), results are sorted primarily by fit to those
 * intents, with text relevance and final score as tie-breakers. Returns the
 * applied intents alongside the hits (for UI display).
 */
export function searchProducts<T extends SearchableProduct>(
  query: string,
  products: T[],
  limit = 30
): SearchResponse<T> {
  const intents = parseQualifiers(query);
  // Strip recognized modifiers so text relevance focuses on the product nouns.
  const textQuery = intents.length > 0 ? stripQualifiers(query) : norm(query);
  const fullQuery = norm(textQuery);
  const tokens = tokenize(textQuery);
  if (tokens.length === 0) return { hits: [], intents: [] };

  const hits: SearchHit<T>[] = [];
  for (const product of products) {
    const { relevance, matchedFields } = scoreProduct(product, tokens, fullQuery);
    if (relevance >= MIN_RELEVANCE) {
      hits.push({ product, relevance, matchedFields, intentScore: 0 });
    }
  }

  const applied =
    intents.length > 0 ? applyIntentRanking(hits, intents) : [];

  hits.sort((a, b) => {
    if (applied.length > 0 && b.intentScore !== a.intentScore) {
      return b.intentScore - a.intentScore;
    }
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    const sa = a.product.productScore?.finalScore ?? 0;
    const sb = b.product.productScore?.finalScore ?? 0;
    return sb - sa;
  });

  return {
    hits: hits.slice(0, limit),
    intents: applied.map((d) => ({ id: d.id, label: d.label, arrow: d.arrow })),
  };
}
