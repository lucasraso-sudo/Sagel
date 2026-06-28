import { gunzipSync } from "node:zlib";
import { parseDelimited } from "./csv";
import type { FeedRow } from "./feedImporter";

// Awin "Create-a-Feed" integration.
//
// A publisher generates a product feed in the Awin UI; the columns below are
// requested in the download URL. Docs: https://wiki.awin.com/index.php/Product_Feeds
//
// Required env:
//   AWIN_FEED_API_KEY  — the *datafeed* API key (Account > Toolbox > Create-a-Feed)
//   AWIN_FEED_IDS      — comma-separated feed ids (one per advertiser: Fnac, Darty…)
// Optional:
//   AWIN_FEED_LANGUAGE — default "fr"

// Awin column names we request, in order.
const AWIN_COLUMNS = [
  "aw_deep_link",
  "merchant_product_id",
  "merchant_name",
  "brand_name",
  "mpn",
  "ean",
  "search_price",
  "currency",
  "in_stock",
  "product_name",
] as const;

export function buildAwinFeedUrl(): string {
  const apiKey = process.env.AWIN_FEED_API_KEY;
  const fids = process.env.AWIN_FEED_IDS;
  const lang = process.env.AWIN_FEED_LANGUAGE || "fr";
  if (!apiKey || !fids) {
    throw new Error(
      "AWIN_FEED_API_KEY and AWIN_FEED_IDS must be set to download the Awin feed."
    );
  }
  const columns = AWIN_COLUMNS.join(",");
  // delimiter %2C = comma, gzip-compressed CSV
  return (
    `https://productdata.awin.com/datafeed/download/apikey/${apiKey}` +
    `/language/${lang}/fid/${fids}` +
    `/columns/${columns}` +
    `/format/csv/delimiter/%2C/compression/gzip/`
  );
}

/** Maps Awin CSV rows → internal FeedRow. */
export function parseAwinCsv(text: string): FeedRow[] {
  return parseDelimited(text, ",")
    .map((r) => ({
      ean: r.ean || null,
      brand: r.brand_name || null,
      mpn: r.mpn || null,
      merchant: r.merchant_name,
      price: parseFloat((r.search_price || "").replace(",", ".")),
      currency: r.currency || "EUR",
      inStock: r.in_stock === "1",
      url: r.aw_deep_link, // already an affiliate-tracked deeplink
      sku: r.merchant_product_id || null,
      urlIsAffiliate: true,
    }))
    .filter((row) => row.merchant && row.url && Number.isFinite(row.price));
}

/** Downloads the live Awin feed (gzip CSV) and returns parsed rows. */
export async function fetchAwinFeed(): Promise<FeedRow[]> {
  const url = buildAwinFeedUrl();
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Awin feed download failed: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  // Gzip magic bytes 0x1f 0x8b — decompress if present.
  const text =
    buf[0] === 0x1f && buf[1] === 0x8b
      ? gunzipSync(buf).toString("utf8")
      : buf.toString("utf8");
  return parseAwinCsv(text);
}
