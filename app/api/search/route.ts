import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import { searchProducts } from "@/lib/search/search";

// Free-text catalog search. Returns products ranked by textual relevance
// (name/brand/model/MPN/category). Distinct from /api/recommend, which is the
// intent-based recommendation engine.
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query?.trim()) {
    return Response.json({ query: "", results: [] });
  }

  const products = await prisma.product.findMany({
    include: {
      specifications: true,
      productScore: true,
      offers: { orderBy: { price: "asc" } },
    },
  });

  const { hits, intents } = searchProducts(query, products);

  return Response.json({
    query,
    intents,
    results: hits.map(({ product, relevance, matchedFields, intentScore }) => ({
      product,
      relevance,
      matchedFields,
      intentScore,
    })),
  });
}
