import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const helper = () => read("src/lib/page-meta.ts");

test("shared funnel SEO copy names the real public path", () => {
  const src = helper();
  assert.match(src, /FUNNEL_PATH_LABEL/);
  assert.match(
    src,
    /Website → Check → Choose → Configure → Review & Try/,
  );
  assert.match(src, /funnelPageCopy/);
  assert.match(src, /funnelPageMetadata/);
  assert.match(src, /not a live phone/);
  assert.match(src, /not always-on/);
  assert.match(src, /not general availability/);
  assert.doesNotMatch(src, /Create your AI receptionist/);
  assert.doesNotMatch(src, /Property maintenance operations for UK landlords/);
  assert.doesNotMatch(src, /24\/7/);
});

test("root fallback title no longer lags as generic operations copy", () => {
  const src = helper();
  assert.match(src, /siteConfig\.publicBrand/);
  assert.match(src, /const defaultTitle = siteConfig\.publicBrand;/);
  assert.match(src, /template: `%s \| \$\{siteConfig\.publicBrand\}`/);
  assert.doesNotMatch(
    src,
    /defaultTitle = `\$\{siteConfig\.name\} — Property maintenance operations`/,
  );
});

test("funnel pages use the shared helper for title / description / OG", () => {
  const pages = {
    "src/app/[locale]/page.tsx": "home",
    "src/app/[locale]/create/page.tsx": "create",
    "src/app/[locale]/demo/page.tsx": "demo",
    "src/app/[locale]/how-it-works/page.tsx": "howItWorks",
    "src/app/[locale]/features/page.tsx": "features",
    "src/app/[locale]/property-maintenance-software/page.tsx": "propertyMaintenanceSoftware",
  };
  for (const [file, key] of Object.entries(pages)) {
    const src = read(file);
    assert.match(
      src,
      new RegExp(`funnelPageMetadata\\("${key}"\\)`),
      `${file} should export funnelPageMetadata("${key}")`,
    );
    assert.doesNotMatch(src, /Create your AI receptionist/);
  }
});

test("contentPageMetadata keeps OG and Twitter titles aligned", () => {
  const src = helper();
  assert.match(src, /absoluteTitle/);
  assert.match(src, /ogTitle = opts\.absoluteTitle \?\? `\$\{opts\.title\} \| \$\{siteConfig\.publicBrand\}`/);
  assert.match(src, /siteName: siteConfig\.publicBrand/);
  assert.match(src, /openGraph: \{/);
  assert.match(src, /twitter: \{/);
  assert.match(src, /title: ogTitle/);
  assert.match(src, /description: opts\.description/);
});

test("sitemap and robots already list the funnel routes", () => {
  const routes = read("src/config/routes.ts");
  const sitemap = read("src/app/[locale]/sitemap.ts");
  const robots = read("src/app/[locale]/robots.ts");
  for (const route of ["/", "/how-it-works/", "/features/", "/property-maintenance-software/", "/create/", "/demo/"]) {
    assert.ok(routes.includes(`"${route}"`), `marketingPaths missing ${route}`);
  }
  assert.match(sitemap, /marketingPaths/);
  assert.match(robots, /allow: "\/"/);
  assert.match(robots, /sitemap: `\$\{origin\}\/sitemap\.xml`/);
  assert.match(
    robots,
    /website URL → check → review → pack → optional scripted sandbox → early access/,
  );
  assert.match(robots, /Customer website crawl is retired/);
});