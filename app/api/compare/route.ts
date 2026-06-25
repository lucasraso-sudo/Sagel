import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { explainScore } from "@/lib/explain/explainScore";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.getAll("id");

  if (ids.length < 2 || ids.length > 3) {
    return Response.json(
      { error: "Provide 2 or 3 product ids" },
      { status: 400 }
    );
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: {
      specifications: true,
      productScore: true,
      expertScores: true,
      reviewAggregates: { include: { source: true } },
    },
  });

  const enriched = products.map((product: typeof products[number]) => {
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

    return { product, explanation };
  });

  return Response.json({ products: enriched });
}
