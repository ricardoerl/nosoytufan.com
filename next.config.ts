import type { NextConfig } from "next";

// Static export: no API routes, server actions or middleware.
// The CSP ships as a <meta> in app/layout.tsx because `headers()` does not apply with `output: "export"`.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
