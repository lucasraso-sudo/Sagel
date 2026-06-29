// Affiliate link builder. Wraps a raw merchant URL with the affiliate
// identifier when one is configured (via env vars), otherwise returns the URL
// unchanged. This keeps the app honest today and revenue-ready later: fill in
// the env vars and every "Voir l'offre" button becomes a tracked affiliate link.
//
// Two common schemes are supported:
//   - "param":  append a query parameter (e.g. Amazon ?tag=xxx-21)
//   - "deeplink": wrap the destination in an affiliate-network redirect
//                 (e.g. Awin/Effiliation used by Fnac, Darty, Boulanger)

type AffiliateScheme =
  | { kind: "param"; param: string; tag?: string }
  | { kind: "deeplink"; template?: string }; // template must contain {URL}

const AFFILIATE_CONFIG: Record<string, AffiliateScheme> = {
  Amazon: { kind: "param", param: "tag", tag: process.env.AMAZON_AFFILIATE_TAG },
  Fnac: { kind: "deeplink", template: process.env.FNAC_AFFILIATE_DEEPLINK },
  Darty: { kind: "deeplink", template: process.env.DARTY_AFFILIATE_DEEPLINK },
  Cdiscount: {
    kind: "deeplink",
    template: process.env.CDISCOUNT_AFFILIATE_DEEPLINK,
  },
  "Rue du Commerce": {
    kind: "deeplink",
    template: process.env.RUEDUCOMMERCE_AFFILIATE_DEEPLINK,
  },
};

/** Returns the click-through URL for an offer, affiliate-wrapped if configured. */
export function buildAffiliateUrl(merchant: string, url: string): string {
  const cfg = AFFILIATE_CONFIG[merchant];
  if (!cfg) return url;

  if (cfg.kind === "param") {
    if (!cfg.tag) return url;
    try {
      const u = new URL(url);
      u.searchParams.set(cfg.param, cfg.tag);
      return u.toString();
    } catch {
      return url;
    }
  }

  // deeplink
  if (!cfg.template || !cfg.template.includes("{URL}")) return url;
  return cfg.template.replace("{URL}", encodeURIComponent(url));
}
