import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/compare/page.tsx"), "utf8");
const compareDir = path.join(ROOT, "src/content/compare");
const mdxFiles = fs
  .readdirSync(compareDir)
  .filter((name) => name.endsWith(".mdx"))
  .map((name) => path.join(compareDir, name));

test("compare index keeps WorkSmartOS claims pre-launch honest", () => {
  assert.match(page, /not commercially generally available/i);
  assert.match(page, /no live phone in a plan/i);
  assert.match(page, /Pre-launch\. Informational purposes only/);
  assert.match(page, /not an offer to sell/i);
});

test("compare index does not present pre-launch WorkSmartOS as buyable", () => {
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /Add to cart/i);
  assert.doesNotMatch(page, /is commercially generally available/i);
  assert.doesNotMatch(page, /call today/i);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("every compare MDX keeps WorkSmartOS availability as pre-launch", () => {
  assert.ok(mdxFiles.length >= 5, "expected compare MDX files");
  for (const file of mdxFiles) {
    const src = fs.readFileSync(file, "utf8");
    const base = path.basename(file);
    assert.match(
      src,
      /\| \*\*Availability\*\* \| Pre-launch, early access only \|/,
      `${base} Availability row must say Pre-launch, early access only`,
    );
    assert.match(
      src,
      /Not commercially generally available/,
      `${base} must deny commercial GA`,
    );
    assert.match(
      src,
      /WorkSmartOS claims reflect pre-launch status/,
      `${base} footer must keep pre-launch status`,
    );
    assert.doesNotMatch(src, /buy now/i);
    const availRow = src.match(
      /\| \*\*Availability\*\* \| ([^|]+) \| ([^|]+) \|/,
    );
    assert.ok(availRow, `${base} missing Availability row`);
    assert.match(availRow[1], /Pre-launch/i, `${base} WSOS Availability cell`);
    assert.doesNotMatch(
      availRow[1],
      /Generally available/i,
      `${base} WSOS Availability must not say Generally available`,
    );
    const availSection = src.slice(src.indexOf("### Availability"));
    const wsosBullet = availSection.match(
      /- \*\*WorkSmartOS MaintenanceOS\*\*: ([^\n]+)/,
    );
    assert.ok(wsosBullet, `${base} missing WSOS Availability bullet`);
    assert.match(wsosBullet[1], /Pre-launch/i);
    assert.doesNotMatch(wsosBullet[1], /Generally available/i);
  }
});
