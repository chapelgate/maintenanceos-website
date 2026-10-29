import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = fs.readFileSync(path.join(ROOT, "src/lib/site-url.ts"), "utf8");
const siteConfig = fs.readFileSync(path.join(ROOT, "src/config/site.ts"), "utf8");

test("site URL fallback and intended production origin stay aligned", () => {
  assert.match(siteUrl, /FALLBACK_SITE_URL\s*=\s*\n?\s*["']https:\/\/worksmartos\.co\.uk["']/);
  assert.match(siteUrl, /INTENDED_PRODUCTION_SITE_URL\s*=\s*\n?\s*["']https:\/\/worksmartos\.co\.uk["']/);
});

test("canonical URL strips one trailing slash", () => {
  assert.match(siteUrl, /origin\.replace\(\/\\\/\$\/, ["']["']\)/);
});

test("absolute URL adds leading and trailing slashes to marketing paths", () => {
  assert.match(siteUrl, /path\.startsWith\(["']\/["']\)/);
  assert.match(siteUrl, /prefixed\.endsWith\(["']\/["']\)/);
});

test("site config keeps the public launch gate closed by default", () => {
  assert.match(siteConfig, /publicLaunch:\s*envFlag\(process\.env\.NEXT_PUBLIC_PUBLIC_LAUNCH, false\)/);
});