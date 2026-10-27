import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const jsonLd = fs.readFileSync(path.join(ROOT, "src/lib/json-ld.ts"), "utf8");
const industries = fs.readFileSync(path.join(ROOT, "src/app/industries/page.tsx"), "utf8");
const intents = fs.readFileSync(path.join(ROOT, "src/config/seo-intents.ts"), "utf8");

test("industry JSON-LD and industries index deny phone and SLA", () => {
  assert.match(
    jsonLd,
    /\$\{seo\.summary\} Pre-launch; not a live phone; no SLA claim\./,
  );
  assert.doesNotMatch(jsonLd, /\$\{seo\.summary\} Pre-launch\./);
  assert.match(industries, /not a live phone/);
  assert.match(industries, /no SLA claim/);
  const m = industries.match(/description:\s*\n?\s*"([^"]+)"/);
  assert.ok(m, "industries page metadata description missing");
  assert.ok(m[1].length <= 160, `industries description length ${m[1].length}`);
  const summaries = [...intents.matchAll(/summary:\s*"([^"]+)"/g)].map((x) => x[1]);
  const suffix = " Pre-launch; not a live phone; no SLA claim.";
  for (const s of summaries) {
    const combined = `${s}${suffix}`;
    assert.ok(combined.length <= 160, `${combined.length}: ${combined}`);
  }
});
