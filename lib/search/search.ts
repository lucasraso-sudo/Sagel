import type { Category } from "@/app/generated/prisma/enums";
import { CATEGORY_LABELS, modelName } from "@/app/types";
import { CATEGORY_KEYWORDS } from "@/lib/recommendation/recommend";

// ---------------------------------------------------------------------------
// Free-text product search (in-memory, relevance-ranked).
//
// Pure function over an already-loaded product list — no DB, no scoring engine.
// Designed for the catalog scale (~hundreds of products): a full scan per query
// is instant and behaves identically on PGlite (local) and Neon (prod).
//
// Matches, by decreasing weight: MPN ▸ brand ▸ model/name ▸ category
// (label + keywords) ▸ description. Diacritics-insensitive (French).
// ---------------------------------------------------------------------------

/** Lower-case, strip diacritics & punctuation, collapse whitespace. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a normalized string into meaningful tokens (length ≥ 2). */
function tokenize(s: string): string[] {
  return norm(s)
    .split(" ")
    .filter((t) => t.length >= 2);
}

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
  productScore?: { finalScore: number } | null;
}

export interface SearchHit<T> {
  product: T;
  relevance: number;
  matchedFields: MatchField[];
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
 * Rank `products` by textual relevance to `query`. Returns hits above the
 * inclusion floor, sorted by relevance then by final score (read-only).
 */
export function searchProducts<T extends SearchableProduct>(
  query: string,
  products: T[],
  limit = 30
): SearchHit<T>[] {
  const fullQuery = norm(query);
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const hits: SearchHit<T>[] = [];
  for (const product of products) {
    const { relevance, matchedFields } = scoreProduct(product, tokens, fullQuery);
    if (relevance >= MIN_RELEVANCE) {
      hits.push({ product, relevance, matchedFields });
    }
  }

  hits.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    const sa = a.product.productScore?.finalScore ?? 0;
    const sb = b.product.productScore?.finalScore ?? 0;
    return sb - sa;
  });

  return hits.slice(0, limit);
}
