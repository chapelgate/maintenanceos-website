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
  assert.match(jsonLd, /description:\s*seo\.summary,/);
  assert.doesNotMatch(
    jsonLd,
    /\$\{seo\.summary\} Pre-launch; not a live phone; no SLA claim\./,
  );
  assert.match(industries, /not a live phone/);
  assert.match(industries, /no SLA claim/);
  const m = industries.match(/description:\s*\n?\s*"([^"]+)"/);
  assert.ok(m, "industries page metadata description missing");
  assert.ok(m[1].length <= 160, `industries description length ${m[1].length}`);
  const summaries = [...intents.matchAll(/summary:\s*"([^"]+)"/g)].map((x) => x[1]);
  for (const s of summaries) {
    assert.ok(s.length <= 160, `${s.length}: ${s}`);
    assert.match(s, /pre-launch/i);
    assert.match(s, /not a live phone|not always-on/i);
    assert.match(s, /no SLA claim/i);
  }
});
