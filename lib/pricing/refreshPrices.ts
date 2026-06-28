import type { PrismaClient } from "@/app/generated/prisma/client";
import { fetchMerchantPrice } from "./fetchMerchantPrice";

export interface RefreshResult {
  offersUpdated: number;
  productsRepriced: number;
  ranAt: string;
}

/**
 * Refreshes every offer's price/stock from the merchant fetcher, then re-prices
 * each product to its cheapest in-stock offer. Shared by the CLI script and the
 * cron API route so both behave identically.
 */
export async function refreshAllPrices(
  prisma: PrismaClient
): Promise<RefreshResult> {
  const offers = await prisma.offer.findMany();

  let offersUpdated = 0;
  for (const o of offers) {
    const quote = await fetchMerchantPrice({
      merchant: o.merchant,
      url: o.url,
      price: o.price,
    });
    await prisma.offer.update({
      where: { id: o.id },
      data: {
        price: quote.price,
        inStock: quote.inStock,
        lastUpdated: new Date(),
      },
    });
    offersUpdated++;
  }

  // Re-price each product to the cheapest in-stock offer (the "prix constaté").
  const products = await prisma.product.findMany({ include: { offers: true } });
  let productsRepriced = 0;
  for (const p of products) {
    const inStock = p.offers.filter((o) => o.inStock);
    if (inStock.length === 0) continue;
    const min = Math.min(...inStock.map((o) => o.price));
    if (p.price !== min) {
      await prisma.product.update({
        where: { id: p.id },
        data: { price: min },
      });
      productsRepriced++;
    }
  }

  return {
    offersUpdated,
    productsRepriced,
    ranAt: new Date().toISOString(),
  };
}
