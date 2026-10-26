import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "src/content/compare");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).sort();

test("compare pages mark subprocessors as draft/planned, not live website processing", () => {
  assert.ok(files.length >= 8, `expected >=8 compare files, got ${files.length}`);
  for (const name of files) {
    const body = fs.readFileSync(path.join(dir, name), "utf8");
    assert.match(body, /Pre-launch draft processing stance/,
      `${name} missing draft processing stance`);
    assert.match(body, /Planned product subprocessors \(not live claims on this static site\)/,
      `${name} missing planned product wording`);
    assert.match(body, /pending legal review/i, `${name} missing legal-review note`);
    assert.doesNotMatch(
      body,
      /UK-only processing\. Subprocessors: DigitalOcean \(hosting\), Cloudflare \(CDN\/WAF\), Twilio \(voice\), Google \(Gemini\/Piper\), SendGrid \(email\)\. Published at \/subprocessors\//,
      `${name} still has live subprocessor claim`,
    );
    assert.doesNotMatch(body, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  }
});
