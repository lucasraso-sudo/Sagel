import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveCanonicalListing } from "../lib/offers/resolveCanonical";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Resolves each offer to its canonical merchant URL + SKU via the integration
// point. With no merchant API configured this is a safe no-op (keeps the
// precise search URL). Once a feed is wired in, run this to upgrade every
// search link into a direct product link.
async function main() {
  console.log("🔗 Resolving canonical merchant listings...");

  const offers = await prisma.offer.findMany({ include: { product: true } });
  let resolved = 0;

  for (const o of offers) {
    const listing = await resolveCanonicalListing({
      merchant: o.merchant,
      brand: o.product.brand,
      mpn: o.product.mpn,
      ean: o.product.ean,
      currentUrl: o.url,
    });

    if (listing.url !== o.url || listing.merchantSku !== o.merchantSku) {
      await prisma.offer.update({
        where: { id: o.id },
        data: { url: listing.url, merchantSku: listing.merchantSku },
      });
      resolved++;
    }
  }

  console.log(
    `✅ ${resolved}/${offers.length} offers updated` +
      (resolved === 0 ? " (no merchant feed configured — links unchanged)" : "")
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
