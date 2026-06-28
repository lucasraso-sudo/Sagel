import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { explainScore } from "@/lib/explain/explainScore";
import { buildAffiliateUrl } from "@/lib/affiliate";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const found = await prisma.product.findUnique({
    where: { id },
    include: {
      specifications: true,
      productScore: true,
      expertScores: true,
      reviewAggregates: { include: { source: true } },
      offers: { orderBy: { price: "asc" } },
    },
  });

  if (!found) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  // Attach the affiliate-wrapped click-through URL to each offer (server-side,
  // so the affiliate config never reaches the client).
  const product = {
    ...found,
    offers: found.offers.map((o) => ({
      ...o,
      affiliateUrl: buildAffiliateUrl(o.merchant, o.url),
    })),
  };

  const explanation =
    product.productScore
      ? explainScore(
          {
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: product.price,
            specifications: product.specifications,
          },
          product.productScore
        )
      : null;

  return Response.json({ product, explanation });
}
