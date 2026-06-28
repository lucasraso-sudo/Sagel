// ⚠️ INTEGRATION POINT — resolve the EXACT merchant listing for a product.
//
// Goal: turn a precise search URL into a direct product URL + merchant SKU, so
// affiliate links land on the right page and conversions are attributable.
//
// Production implementation per merchant (keyed by EAN/GTIN, falling back to
// brand + MPN):
//   - Amazon    → PA-API 5.0 GetItems / SearchItems → ASIN → https://www.amazon.fr/dp/{ASIN}
//   - Fnac      → Awin / Effiliation product feed → canonical URL + deeplink
//   - Darty     → Effiliation / Kwanko product feed
//   - Boulanger → Awin product feed
//
// Until an API key/feed is configured, this returns the current (search) URL
// unchanged and leaves the SKU null — honest, and a safe no-op.

export interface CanonicalListing {
  url: string;
  merchantSku: string | null;
}

export interface ResolveInput {
  merchant: string;
  brand: string;
  mpn: string;
  ean?: string | null;
  /** The URL currently stored on the offer (precise EAN/MPN search). */
  currentUrl: string;
}

export async function resolveCanonicalListing(
  input: ResolveInput
): Promise<CanonicalListing> {
  // No external catalog configured → keep the precise search URL, SKU unknown.
  return { url: input.currentUrl, merchantSku: null };
}
