import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/brand/**" }, { pathname: "/media/**" }],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // The supplied documentation PDFs live outside public/ (served through an access check),
  // so include them explicitly in the serverless bundle.
  outputFileTracingIncludes: { "/docs/[id]": ["./storage/docs/**/*"] },
  experimental: { serverActions: { bodySizeLimit: "25mb" } },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
