import type { NextConfig } from "next";

// Export estático: sin API routes, server actions ni middleware.
// La CSP va como <meta> en app/layout.tsx porque `headers()` no aplica con `output: "export"`.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
