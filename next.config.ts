import type { NextConfig } from "next";

function publicFlag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

/** Companion client islands stay off the default DigitalOcean first-load graph. */
const createCompanionsEnabled =
  publicFlag(process.env.NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED) ||
  publicFlag(process.env.NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED);

const githubPages = publicFlag(process.env.GITHUB_PAGES);
const pagesBase = githubPages ? "/maintenanceos-website" : "";

const nextConfig: NextConfig = {
  // Static export for DigitalOcean App Platform / GitHub Pages.
  // Do not add `headers()` — Next ignores it with `output: "export"`.
  // Browser-honored baseline: src/lib/static-security-headers.ts
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(pagesBase
    ? {
        basePath: pagesBase,
        assetPrefix: pagesBase,
      }
    : {}),
  ...(createCompanionsEnabled
    ? {
        turbopack: {
          resolveAlias: {
            "@/components/create-funnel-islands":
              "./src/components/create-funnel-islands.enabled.tsx",
          },
        },
      }
    : {}),
};

export default nextConfig;
