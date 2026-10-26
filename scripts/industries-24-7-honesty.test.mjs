import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/config/industries.ts"), "utf8");

const slugs = [
  "landlords",
  "letting-agents",
  "property-managers",
  "maintenance-companies",
  "housing-associations",
  "facilities-management",
  "councils",
  "holiday-lets",
];

test("industry role sub fields do not claim live 24/7 call capture", () => {
  for (const slug of slugs) {
    const start = src.indexOf(`slug: "${slug}"`);
    assert.ok(start >= 0, `missing slug ${slug}`);
    const next = slugs
      .map((s) => src.indexOf(`slug: "${s}"`))
      .filter((i) => i > start)
      .sort((a, b) => a - b)[0];
    const block = src.slice(start, next ?? src.length);
    const subMatch = block.match(/\bsub:\s*"([^"]*)"/);
    assert.ok(subMatch, `${slug} missing sub`);
    assert.doesNotMatch(
      subMatch[1],
      /24\s*\/\s*7/i,
      `${slug} sub must not claim 24/7`,
    );
    assert.doesNotMatch(
      subMatch[1],
      /always-on/i,
      `${slug} sub must not claim always-on`,
    );
  }
});

test("industries keep pre-launch always-on denial and deny live 24/7 centre", () => {
  assert.match(src, /not a public always-on phone/i);
  assert.match(src, /Is this a live 24\/7 call centre\?/);
  assert.match(
    src,
    /No\. Pre-launch and under testing; voice intake is not a live always-on phone/,
  );
  assert.doesNotMatch(src, /buy now/i);
  assert.doesNotMatch(src, /£/);
  assert.doesNotMatch(src, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
