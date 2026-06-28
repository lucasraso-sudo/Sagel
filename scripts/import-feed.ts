import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { importFeedRows, type FeedRow } from "../lib/offers/feedImporter";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Minimal CSV parser (handles quoted fields and escaped quotes).
function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = (cells[i] ?? "").trim()));
    return obj;
  });
}

function toBool(v: string | undefined): boolean {
  if (v === undefined || v === "") return true; // default in stock
  return v === "1" || /^(true|yes|oui|y|o)$/i.test(v);
}

// Maps CSV columns → FeedRow. Adjust the column names here to fit a given
// network's feed schema (Awin, Effiliation…). Expected headers:
//   ean, brand, mpn, merchant, price, currency, in_stock, url, sku
function rowToFeed(r: Record<string, string>): FeedRow {
  return {
    ean: r.ean || null,
    brand: r.brand || null,
    mpn: r.mpn || null,
    merchant: r.merchant,
    price: parseFloat((r.price || "").replace(",", ".")),
    currency: r.currency || "EUR",
    inStock: toBool(r.in_stock),
    url: r.url,
    sku: r.sku || null,
  };
}

async function loadSource(src: string): Promise<string> {
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Feed fetch failed: HTTP ${res.status}`);
    return res.text();
  }
  return readFileSync(src, "utf8");
}

async function main() {
  const src = process.argv[2];
  if (!src) {
    console.error("Usage: npm run import:feed -- <fichier.csv | URL>");
    process.exit(1);
  }

  console.log(`📥 Importing merchant feed from ${src}`);
  const text = await loadSource(src);
  const rows = parseCsv(text).map(rowToFeed);
  const result = await importFeedRows(prisma, rows);

  console.log(
    `✅ ${result.upserted}/${result.total} offers imported · ${result.matched} matched`
  );
  if (result.unmatched.length > 0) {
    console.log(`⚠️  ${result.unmatched.length} unmatched:`);
    for (const u of result.unmatched.slice(0, 10)) {
      console.log(
        `   - ${u.row.brand ?? "?"} ${u.row.mpn ?? u.row.ean ?? "?"} (${u.reason})`
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
