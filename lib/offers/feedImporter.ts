import type { PrismaClient } from "@/app/generated/prisma/client";

// Normalized row from a merchant/affiliate product feed (Awin, Effiliation,
// Amazon, direct CSV…). The importer matches each row to a product by EAN/GTIN
// first, then by (brand, MPN), and upserts the corresponding offer.
export interface FeedRow {
  ean?: string | null;
  brand?: string | null;
  mpn?: string | null;
  merchant: string;
  price: number;
  currency?: string;
  inStock?: boolean;
  url: string; // canonical product URL / affiliate deeplink
  sku?: string | null; // merchant SKU / ASIN
  urlIsAffiliate?: boolean; // true when `url` is already an affiliate deeplink
}

export interface ImportResult {
  total: number;
  matched: number;
  upserted: number;
  unmatched: { row: FeedRow; reason: string }[];
}

export async function importFeedRows(
  prisma: PrismaClient,
  rows: FeedRow[]
): Promise<ImportResult> {
  let matched = 0;
  let upserted = 0;
  const unmatched: ImportResult["unmatched"] = [];

  for (const row of rows) {
    if (!row.merchant || !row.url || !Number.isFinite(row.price)) {
      unmatched.push({ row, reason: "missing merchant/url/price" });
      continue;
    }

    let product = null;
    if (row.ean) {
      product = await prisma.product.findUnique({ where: { ean: row.ean } });
    }
    if (!product && row.brand && row.mpn) {
      product = await prisma.product.findUnique({
        where: { brand_mpn: { brand: row.brand, mpn: row.mpn } },
      });
    }
    if (!product) {
      unmatched.push({ row, reason: "no product match (EAN / brand+MPN)" });
      continue;
    }
    matched++;

    await prisma.offer.upsert({
      where: {
        productId_merchant: { productId: product.id, merchant: row.merchant },
      },
      create: {
        productId: product.id,
        merchant: row.merchant,
        url: row.url,
        isAffiliateUrl: row.urlIsAffiliate ?? false,
        merchantSku: row.sku ?? null,
        price: row.price,
        currency: row.currency ?? "EUR",
        inStock: row.inStock ?? true,
      },
      update: {
        url: row.url,
        isAffiliateUrl: row.urlIsAffiliate ?? false,
        merchantSku: row.sku ?? null,
        price: row.price,
        currency: row.currency ?? "EUR",
        inStock: row.inStock ?? true,
        lastUpdated: new Date(),
      },
    });
    upserted++;
  }

  return { total: rows.length, matched, upserted, unmatched };
}
