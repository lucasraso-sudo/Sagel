import type { NextConfig } from "next";

// Security headers applied to every response. These are the high-value,
// no-risk ones (they don't break the app). A full Content-Security-Policy is
// intentionally left out for now — it needs per-app tuning with Next.js inline
// scripts/styles and is easy to get wrong; add it as a dedicated follow-up.
const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains (browsers remember it).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Block MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Anti-clickjacking: disallow the site being embedded in iframes elsewhere.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Don't leak full URLs to other origins.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful browser features the site doesn't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
