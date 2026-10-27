import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const meta = fs.readFileSync(path.join(ROOT, "src/lib/page-meta.ts"), "utf8");
const intents = fs.readFileSync(path.join(ROOT, "src/config/seo-intents.ts"), "utf8");

test("industry SEO meta uses denial-bearing seo.summary", () => {
  assert.match(meta, /description:\s*seo \? seo\.summary : role\.metaDescription/);
  assert.doesNotMatch(
    meta,
    /\$\{seo\.summary\} Pre-launch; not a live phone; no SLA claim\./,
  );
  const summaries = [...intents.matchAll(/summary:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(summaries.length >= 8, `expected ≥8 industry summaries, got ${summaries.length}`);
  for (const s of summaries) {
    assert.ok(s.length <= 160, `${s.length}: ${s}`);
    assert.match(s, /pre-launch/i);
    assert.match(s, /not a live phone|not always-on/i);
    assert.match(s, /no SLA claim/i);
  }
});
