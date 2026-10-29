import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * CSP tylko na produkcji (dev potrzebuje eval dla HMR). `unsafe-inline` jest
 * konieczne, dopóki nie wdrożymy nonce'ów (inline JSON-LD i bootstrap Next).
 * Reszta dyrektyw ogranicza źródła do własnej domeny.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: {
    // Panel przyjmuje zdjęcia z telefonu (do 5 plików naraz, każdy do 10 MB).
    serverActions: { bodySizeLimit: "55mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/icon.svg", permanent: true }];
  },
  async headers() {
    return [
      {
        // Service worker musi być zawsze świeży, inaczej aktualizacje panelu utkną w cache.
        source: "/admin/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/admin/" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains",
                },
                { key: "Content-Security-Policy", value: contentSecurityPolicy },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
