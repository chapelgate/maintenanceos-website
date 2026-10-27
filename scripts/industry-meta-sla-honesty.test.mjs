import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const meta = fs.readFileSync(path.join(ROOT, "src/lib/page-meta.ts"), "utf8");
const intents = fs.readFileSync(path.join(ROOT, "src/config/seo-intents.ts"), "utf8");

test("industry SEO meta suffix denies live phone and SLA", () => {
  assert.match(
    meta,
    /\$\{seo\.summary\} Pre-launch; not a live phone; no SLA claim\./,
  );
  assert.doesNotMatch(meta, /\$\{seo\.summary\} Pre-launch, not always-on\./);
  const summaries = [...intents.matchAll(/summary:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(summaries.length >= 8, `expected ≥8 industry summaries, got ${summaries.length}`);
  const suffix = " Pre-launch; not a live phone; no SLA claim.";
  for (const s of summaries) {
    const combined = `${s}${suffix}`;
    assert.ok(combined.length <= 160, `${combined.length}: ${combined}`);
  }
});
