import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Merchant search-URL builders. These point to the merchant's product search
// for the item — an honest placeholder until real per-product deep links (and
// affiliate wrapping) are wired in. Swap for canonical product URLs when known.
const MERCHANTS: {
  name: string;
  factor: number; // price relative to the product reference price
  url: (q: string) => string;
}[] = [
  {
    name: "Cdiscount",
    factor: 0.96,
    url: (q) => `https://www.cdiscount.com/search/10/${encodeURIComponent(q)}.html`,
  },
  {
    name: "Fnac",
    factor: 1.0,
    url: (q) =>
      `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${encodeURIComponent(q)}`,
  },
  {
    name: "Darty",
    factor: 1.03,
    url: (q) => `https://www.darty.com/nav/recherche?text=${encodeURIComponent(q)}`,
  },
  {
    name: "Rue du Commerce",
    factor: 1.02,
    url: (q) => `https://www.rueducommerce.fr/recherche?q=${encodeURIComponent(q)}`,
  },
];

function priceWithNiceEnding(value: number): number {
  return Math.max(1, Math.floor(value)) - 0.01; // → .99 ending
}

async function main() {
  console.log("🛒 Seeding merchant offers...");

  const products = await prisma.product.findMany();
  let count = 0;

  for (const p of products) {
    const base = p.price ?? 100;
    // Deterministic 2–4 merchants per product, rotated so every merchant is
    // used across the catalog (stable across runs).
    const n = 2 + (p.name.length % 3); // 2..4
    const start = p.brand.length % MERCHANTS.length;
    const merchants = Array.from(
      { length: n },
      (_, i) => MERCHANTS[(start + i) % MERCHANTS.length]
    );

    // Precise query: EAN/GTIN when known, else brand + manufacturer reference.
    // Far more reliable across merchants than the full marketing name.
    const query = p.ean ?? `${p.brand} ${p.mpn}`;

    for (const m of merchants) {
      const price = priceWithNiceEnding(base * m.factor);
      const url = m.url(query);

      await prisma.offer.upsert({
        where: { productId_merchant: { productId: p.id, merchant: m.name } },
        create: {
          productId: p.id,
          merchant: m.name,
          url,
          price,
          inStock: true,
        },
        update: { url, price, inStock: true, lastUpdated: new Date() },
      });
      count++;
    }
  }

  console.log(`✅ ${count} offers seeded across ${products.length} products`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
