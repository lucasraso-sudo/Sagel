// Simple deduplication & matching system.
// Priority: EAN match → normalized name+brand fuzzy match.

export interface ProductCandidate {
  id: string;
  name: string;
  brand: string;
  ean?: string | null;
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Jaccard similarity on word sets
function similarity(a: string, b: string): number {
  const setA = new Set(normalize(a).split(" "));
  const setB = new Set(normalize(b).split(" "));
  const intersection = new Set([...setA].filter((w) => setB.has(w)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

const MATCH_THRESHOLD = 0.75;

export function findMatch(
  candidate: Omit<ProductCandidate, "id">,
  existing: ProductCandidate[]
): ProductCandidate | null {
  // EAN match takes absolute priority
  if (candidate.ean) {
    const byEan = existing.find(
      (p) => p.ean && p.ean === candidate.ean
    );
    if (byEan) return byEan;
  }

  // Fuzzy match on brand + name combined
  const candidateKey = `${candidate.brand} ${candidate.name}`;
  let bestScore = 0;
  let bestMatch: ProductCandidate | null = null;

  for (const p of existing) {
    const existingKey = `${p.brand} ${p.name}`;
    const score = similarity(candidateKey, existingKey);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = p;
    }
  }

  return bestScore >= MATCH_THRESHOLD ? bestMatch : null;
}

export function deduplicateCandidates(
  candidates: Omit<ProductCandidate, "id">[]
): Omit<ProductCandidate, "id">[] {
  const result: Omit<ProductCandidate, "id">[] = [];

  for (const c of candidates) {
    const withIds = result.map((r, i) => ({ ...r, id: String(i) }));
    const match = findMatch(c, withIds);
    if (!match) result.push(c);
  }

  return result;
}
