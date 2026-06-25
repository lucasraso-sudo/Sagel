import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { explainScore } from "@/lib/explain/explainScore";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      specifications: true,
      productScore: true,
      expertScores: true,
      reviewAggregates: { include: { source: true } },
    },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

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
