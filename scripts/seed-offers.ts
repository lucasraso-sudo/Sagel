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
  active: boolean; // false = offer exists in DB but UI shows it as unavailable
}[] = [
  {
    name: "Amazon",
    factor: 0.97,
    url: (q) => `https://www.amazon.fr/s?k=${encodeURIComponent(q)}`,
    active: true,
  },
  {
    name: "Cdiscount",
    factor: 0.96,
    url: (q) => `https://www.cdiscount.com/search/10/${encodeURIComponent(q)}.html`,
    active: false,
  },
  {
    name: "Fnac",
    factor: 1.0,
    url: (q) =>
      `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${encodeURIComponent(q)}`,
    active: false,
  },
  {
    name: "Darty",
    factor: 1.03,
    url: (q) => `https://www.darty.com/nav/recherche?text=${encodeURIComponent(q)}`,
    active: false,
  },
  {
    name: "Rue du Commerce",
    factor: 1.02,
    url: (q) => `https://www.rueducommerce.fr/recherche?q=${encodeURIComponent(q)}`,
    active: false,
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
    const query = p.ean ?? `${p.brand} ${p.mpn}`;

    // Amazon is on every product. Other merchants are rotated (2–3 per product)
    // but kept inactive until affiliate programs are approved.
    const amazon = MERCHANTS[0];
    const others = MERCHANTS.slice(1);
    const n = 2 + (p.name.length % 3); // 2..4 (but capped at others.length)
    const start = p.brand.length % others.length;
    const rotated = Array.from(
      { length: Math.min(n, others.length) },
      (_, i) => others[(start + i) % others.length]
    );
    const merchants = [amazon, ...rotated];

    for (const m of merchants) {
      const price = priceWithNiceEnding(base * m.factor);
      const url = m.url(query);
      const inStock = m.active;

      await prisma.offer.upsert({
        where: { productId_merchant: { productId: p.id, merchant: m.name } },
        create: { productId: p.id, merchant: m.name, url, price, inStock },
        update: { url, price, inStock, lastUpdated: new Date() },
      });
      count++;
    }
  }

  console.log(`✅ ${count} offers seeded across ${products.length} products`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
