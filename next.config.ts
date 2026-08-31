import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Typed routes (stable in Next.js 16)
  typedRoutes: true,

  // Security headers
  // Note: HSTS is intentionally omitted — it will be added once the HTTPS
  //       deployment domain is decided with Blaise.
  // Note: CSP is deferred to a dedicated security lot to avoid breaking
  //       Next.js internal scripts with an improvised policy.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Deny framing — prevents clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Limit referrer information in cross-origin requests
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict access to browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // X-XSS-Protection is intentionally omitted: modern browsers ignore
          // it and it can introduce vulnerabilities in IE-era browsers.
          // The decision is documented in DECISIONS.md [DECISION-008].
        ],
      },
    ];
  },
};

export default nextConfig;
