import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "src/content/compare");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).sort();

test("compare pages do not claim live Companies House integration or audit export", () => {
  assert.ok(files.length >= 8, `expected >=8 compare files, got ${files.length}`);
  for (const name of files) {
    const body = fs.readFileSync(path.join(dir, name), "utf8");
    assert.match(
      body,
      /Pre-launch planned: Companies House lookup, UK regulations not live on this static site/,
      `${name} missing planned UK-features table row`,
    );
    assert.match(
      body,
      /audit trail for every decision documented in source only/,
      `${name} missing audit source-only wording`,
    );
    assert.match(
      body,
      /Pre-launch planned: Companies House lookup, UK postcode validation/,
      `${name} missing planned UK helpers detail`,
    );
    assert.match(
      body,
      /not live on this static site/,
      `${name} missing not-live qualifier on UK helpers`,
    );
    assert.doesNotMatch(
      body,
      /\| \*\*UK-specific features\*\* \| Companies House integration, UK regulations \|/,
      `${name} still claims live Companies House integration in table`,
    );
    assert.doesNotMatch(
      body,
      /Human clearance required\. Audit trail for every decision\./,
      `${name} still claims live audit trail for every decision`,
    );
    assert.doesNotMatch(body, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  }
});
