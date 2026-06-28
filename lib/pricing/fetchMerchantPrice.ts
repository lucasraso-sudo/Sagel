// ⚠️ INTEGRATION POINT — replace this stub with real price retrieval.
//
// In production, fetch the live price from each merchant via:
//   - Amazon  → Product Advertising API (PA-API 5.0)
//   - Fnac / Darty / Boulanger → affiliate-network product feeds (Awin,
//     Effiliation, Kelkoo) or an official merchant API
//   - fallback → a compliant scraping service
//
// The rest of the app (DB schema, refresh job, UI) is already wired, so the
// only change needed to go live is implementing real fetches below.

export interface PriceQuote {
  price: number;
  inStock: boolean;
}

export interface OfferRef {
  merchant: string;
  url: string;
  price: number; // current stored price (used as the baseline for the stub)
}

/**
 * Stub: simulates a realistic day-to-day price movement around the current
 * price (±4%), nudged toward common ".99" endings, with an occasional
 * out-of-stock event. Deterministic enough to look alive, random enough to move.
 */
export async function fetchMerchantPrice(offer: OfferRef): Promise<PriceQuote> {
  const drift = 1 + (Math.random() * 0.08 - 0.04); // ±4%
  let next = offer.price * drift;

  // Nudge to a psychological price point (.99 / .95 / round).
  const cents = [0.99, 0.95, 0.9, 0.0];
  const pick = cents[Math.floor(Math.random() * cents.length)];
  next = Math.floor(next) + pick;

  // Keep it within a sane band of the baseline so prices don't wander off.
  const lo = offer.price * 0.8;
  const hi = offer.price * 1.2;
  next = Math.min(hi, Math.max(lo, next));

  const inStock = Math.random() > 0.05; // ~5% chance temporarily out of stock

  return { price: Math.round(next * 100) / 100, inStock };
}
