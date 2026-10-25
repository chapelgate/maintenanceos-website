import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const llms = fs.readFileSync(path.join(ROOT, "public/llms.txt"), "utf8");
const robots = fs.readFileSync(path.join(ROOT, "src/app/robots.ts"), "utf8");

test("llms.txt stays a pre-launch claims-safe summary", () => {
  assert.match(llms, /not commercially generally available/i);
  assert.match(llms, /Not a public always-on phone line/i);
  assert.match(llms, /pre-launch/i);
  assert.match(llms, /ReceptionistOS is coming soon/);
  assert.match(
    llms,
    /not a Google Analytics \/ PECR \/ GDPR compliance certification/,
  );
  assert.doesNotMatch(llms, /WCAG 2\.2 AA verified/);
  assert.doesNotMatch(llms, /£/);
  assert.doesNotMatch(llms, /buy now/i);
  assert.doesNotMatch(llms, /99\.9%/);
  assert.doesNotMatch(llms, /always-on receptionist is live/i);
});

test("robots keeps dashboard out of the crawl map", () => {
  assert.match(robots, /"\/dashboard\/"/);
  assert.match(robots, /"\/api\/"/);
  assert.doesNotMatch(robots, /allow:\s*"\/dashboard/);
});
