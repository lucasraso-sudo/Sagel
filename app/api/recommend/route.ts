import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { recommend } from "@/lib/recommendation/recommend";
import { explainScore } from "@/lib/explain/explainScore";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query?.trim()) {
    return Response.json({ error: "Query is required" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    include: {
      specifications: true,
      productScore: true,
    },
  });

  const results = recommend(query, products);

  const enriched = results.map(({ product, score, matchedCriteria, relevanceBoost }) => {
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

    return { product, score, matchedCriteria, relevanceBoost, explanation };
  });

  return Response.json({ query, results: enriched });
}
