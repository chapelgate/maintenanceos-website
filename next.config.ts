import type { NextConfig } from "next";
import path from "node:path";

function publicFlag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

/** Companion client islands stay off the default DigitalOcean first-load graph. */
const createCompanionsEnabled =
  publicFlag(process.env.NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED) ||
  publicFlag(process.env.NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED);

const enabledCreateIslands = path.join(
  process.cwd(),
  "src/components/create-funnel-islands.enabled.tsx",
);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { webpack }) => {
    if (!createCompanionsEnabled) {
      return config;
    }
    // Replace after resolve so `@/` path mapping cannot skip the swap.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /[/\\]create-funnel-islands\.tsx$/,
        enabledCreateIslands,
      ),
    );
    return config;
  },
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
