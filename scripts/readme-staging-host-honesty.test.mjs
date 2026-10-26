import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
const siteUrl = fs.readFileSync(path.join(ROOT, "src/lib/site-url.ts"), "utf8");

test("readme marks seahorse staging as historical evidence only", () => {
  assert.match(readme, /Recorded DigitalOcean App Platform staging host \(historical evidence only; not a release claim\)/);
  assert.match(readme, /canonical public origin falls back to `https:\/\/worksmartos\.co\.uk` via `FALLBACK_SITE_URL`/);
  assert.match(readme, /seahorse-app-4oasq\.ondigitalocean\.app/);
  assert.doesNotMatch(
    readme,
    /^- DigitalOcean App Platform static staging: `https:\/\/seahorse-app-4oasq\.ondigitalocean\.app`$/m,
  );
  assert.match(siteUrl, /FALLBACK_SITE_URL\s*=\s*[\s\S]*https:\/\/worksmartos\.co\.uk/);
});
