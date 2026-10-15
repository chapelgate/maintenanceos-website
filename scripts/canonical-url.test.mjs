import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANONICAL_ORIGIN = "https://worksmartos.co.uk";
const OLD_ORIGIN = "https://maintenanceos.chapelgatetechnologies.com";

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("source fallback and default NEXT_PUBLIC_SITE_URL use the new canonical origin", () => {
  const siteUrl = read("src/lib/site-url.ts");
  const env = read(".env.example");
  assert.match(
    siteUrl,
    /export const FALLBACK_SITE_URL =\s*"https:\/\/worksmartos\.co\.uk";/,
  );
  assert.match(
    siteUrl,
    /export const INTENDED_PRODUCTION_SITE_URL =\s*"https:\/\/worksmartos\.co\.uk";/,
  );
  assert.match(
    env,
    /^NEXT_PUBLIC_SITE_URL=https:\/\/worksmartos\.co\.uk$/m,
  );
  assert.doesNotMatch(
    env,
    /^NEXT_PUBLIC_SITE_URL=https:\/\/maintenanceos\.chapelgatetechnologies\.com$/m,
  );
  assert.doesNotMatch(
    env,
    /NEXT_PUBLIC_SITE_URL=https:\/\/seahorse-app-4oasq\.ondigitalocean\.app/,
  );
});

test("built canonical link, sitemap, robots, and JSON-LD origins use the new canonical origin", () => {
  const sitemapPath = path.join(ROOT, "out", "sitemap.xml");
  const robotsPath = path.join(ROOT, "out", "robots.txt");
  const indexPath = path.join(ROOT, "out", "index.html");

  if (fs.existsSync(sitemapPath)) {
    const sitemap = fs.readFileSync(sitemapPath, "utf8");
    assert.match(sitemap, new RegExp(`<loc>${CANONICAL_ORIGIN}/</loc>`));
    assert.match(sitemap, new RegExp(`<loc>${CANONICAL_ORIGIN}/how-it-works/</loc>`));
    assert.doesNotMatch(sitemap, /seahorse-app-4oasq\.ondigitalocean\.app/);
    assert.doesNotMatch(sitemap, /maintenanceos\.chapelgatetechnologies\.com/);
  }

  if (fs.existsSync(robotsPath)) {
    const robots = fs.readFileSync(robotsPath, "utf8");
    assert.match(robots, new RegExp(`Host: ${CANONICAL_ORIGIN}`));
    assert.match(robots, new RegExp(`Sitemap: ${CANONICAL_ORIGIN}/sitemap\\.xml`));
    assert.doesNotMatch(robots, /seahorse-app-4oasq\.ondigitalocean\.app/);
    assert.doesNotMatch(robots, /maintenanceos\.chapelgatetechnologies\.com/);
    assert.doesNotMatch(robots, new RegExp(`Host: ${OLD_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    assert.doesNotMatch(robots, new RegExp(`Sitemap: ${OLD_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  }

  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, "utf8");
    assert.match(html, new RegExp(`<link rel="canonical" href="${CANONICAL_ORIGIN}/"/>`));
    assert.match(html, new RegExp(`<meta property="og:url" content="${CANONICAL_ORIGIN}/"/>`));
    assert.match(html, new RegExp(`"@id":"${CANONICAL_ORIGIN}/#organization"`));
    assert.match(html, new RegExp(`"@id":"${CANONICAL_ORIGIN}/#website"`));
    assert.doesNotMatch(html, /seahorse-app-4oasq\.ondigitalocean\.app/);
    assert.doesNotMatch(html, /maintenanceos\.chapelgatetechnologies\.com/);
  }
});
