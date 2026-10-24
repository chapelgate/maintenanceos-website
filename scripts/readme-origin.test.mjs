import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("readme fallback names worksmartos.co.uk", () => {
  const readme = read("README.md");
  const siteUrl = read("src/lib/site-url.ts");
  assert.match(readme, /https:\/\/worksmartos\.co\.uk/);
  assert.match(
    siteUrl,
    /export const FALLBACK_SITE_URL =\s*"https:\/\/worksmartos\.co\.uk";/,
  );
});

test("readme does not say site-url falls back to the DigitalOcean staging host", () => {
  const readme = read("README.md");
  const siteUrl = read("src/lib/site-url.ts");
  assert.doesNotMatch(readme, /falls back to the DigitalOcean staging host/);
  assert.match(
    siteUrl,
    /export const FALLBACK_SITE_URL =\s*"https:\/\/worksmartos\.co\.uk";/,
  );
});
