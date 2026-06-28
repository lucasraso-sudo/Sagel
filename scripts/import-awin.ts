import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { importFeedRows } from "../lib/offers/feedImporter";
import { fetchAwinFeed, parseAwinCsv } from "../lib/offers/awinFeed";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Live:   npm run import:awin            (downloads via AWIN_FEED_* env vars)
// Test:   npm run import:awin -- --file feeds/sample-awin.csv
async function main() {
  const fileArg = process.argv.indexOf("--file");
  const rows =
    fileArg !== -1
      ? parseAwinCsv(readFileSync(process.argv[fileArg + 1], "utf8"))
      : await fetchAwinFeed();

  console.log(`📥 Awin feed: ${rows.length} rows parsed`);
  const result = await importFeedRows(prisma, rows);

  console.log(
    `✅ ${result.upserted}/${result.total} offers imported · ${result.matched} matched (affiliate deeplinks)`
  );
  if (result.unmatched.length > 0) {
    console.log(`⚠️  ${result.unmatched.length} unmatched (not in catalog):`);
    for (const u of result.unmatched.slice(0, 10)) {
      console.log(
        `   - ${u.row.brand ?? "?"} ${u.row.mpn ?? u.row.ean ?? "?"} @ ${u.row.merchant}`
      );
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
