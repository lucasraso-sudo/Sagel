import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const offers = await prisma.offer.findMany({ include: { product: true } });

  let totalClicks = 0;
  const merchants: Record<string, { clicks: number; offers: number }> = {};
  const products: Record<
    string,
    { name: string; brand: string; clicks: number }
  > = {};

  for (const o of offers) {
    totalClicks += o.clickCount;

    const m = (merchants[o.merchant] ??= { clicks: 0, offers: 0 });
    m.clicks += o.clickCount;
    m.offers += 1;

    const p = (products[o.productId] ??= {
      name: o.product.name,
      brand: o.product.brand,
      clicks: 0,
    });
    p.clicks += o.clickCount;
  }

  const topOffers = offers
    .filter((o) => o.clickCount > 0)
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, 10)
    .map((o) => ({
      id: o.id,
      productId: o.productId,
      product: o.product.name,
      brand: o.product.brand,
      merchant: o.merchant,
      price: o.price,
      clicks: o.clickCount,
      lastClickedAt: o.lastClickedAt,
    }));

  const topProducts = Object.entries(products)
    .map(([id, v]) => ({ id, ...v }))
    .filter((p) => p.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const byMerchant = Object.entries(merchants)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.clicks - a.clicks);

  return Response.json({
    totalClicks,
    totalOffers: offers.length,
    activeMerchants: byMerchant.length,
    byMerchant,
    topOffers,
    topProducts,
  });
}
