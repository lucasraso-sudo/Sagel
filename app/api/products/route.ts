import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/client";
import type { Category } from "@/app/generated/prisma/enums";

const VALID_CATEGORIES: Category[] = [
  "FAN",
  "AIR_COOLER",
  "MOBILE_AC",
  "AIR_PURIFIER",
  "DEHUMIDIFIER",
  "HEATER",
  "RADIATOR",
  "HUMIDIFIER",
  "THERMOSTAT",
  "WASHING_MACHINE",
  "DISHWASHER",
  "FRIDGE",
  "TUMBLE_DRYER",
  "FREEZER",
  "OVEN",
  "COOKTOP",
  "HOOD",
  "WINE_CELLAR",
  "COFFEE_MACHINE",
  "AIR_FRYER",
  "COOKING_ROBOT",
  "KETTLE",
  "TOASTER",
  "BLENDER",
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") as Category | null;
  const brand = searchParams.get("brand");
  const minScore = searchParams.get("minScore");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "score";

  const where = {
    ...(category && VALID_CATEGORIES.includes(category) ? { category } : {}),
    ...(brand ? { brand: { contains: brand, mode: "insensitive" as const } } : {}),
    ...(maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {}),
    ...(minScore
      ? { productScore: { finalScore: { gte: parseFloat(minScore) } } }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      specifications: true,
      productScore: true,
      reviewAggregates: { include: { source: true } },
      offers: { orderBy: { price: "asc" } },
    },
    orderBy:
      sort === "price"
        ? { price: "asc" }
        : sort === "name"
          ? { name: "asc" }
          : { productScore: { finalScore: "desc" } },
  });

  return Response.json({ products });
}
