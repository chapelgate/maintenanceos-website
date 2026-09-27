import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (p) => fs.readFileSync(p, "utf8");

test("machine-readable public summaries track current positioning and gates", () => {
  const llms = read("public/llms.txt");
  const full = read("public/llms-full.txt");
  const combined = llms + "\n" + full;

  assert.match(
    llms,
    /helps UK property and maintenance teams turn incoming repair reports into structured work/,
  );
  assert.match(combined, /Public staging website scan is not enabled|public staging scan is not enabled/i);
  assert.match(full, /Controlled carrier call proven on the current canonical runtime/);
  assert.doesNotMatch(combined, /Gemini/i);
  assert.doesNotMatch(combined, /Fonio/i);
  assert.doesNotMatch(combined, /owner-blocked/i);
  assert.doesNotMatch(combined, /Chapelgate Technologies/i);
});

test("SEO description is provider-neutral and outcome-led", () => {
  const site = read("src/config/site.ts");
  const meta = read("src/lib/page-meta.ts");
  assert.match(site, /turns incoming repair reports into structured work/);
  assert.match(meta, /turning repair reports into structured work/);
  assert.doesNotMatch(site + meta, /Gemini|Fonio|Chapelgate Technologies/i);
});

test("machine surfaces retain the pre-launch no-live-phone boundary", () => {
  const combined = read("public/llms.txt") + "\n" + read("public/llms-full.txt");
  assert.match(combined, /pre-launch/i);
  assert.match(combined, /not a public always-on phone/i);
  assert.match(combined, /not commercially|not general availability/i);
});
