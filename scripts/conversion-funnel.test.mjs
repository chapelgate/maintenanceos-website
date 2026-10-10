import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("Request an early demo remains the canonical primary conversion", () => {
  const cta = read("src/components/CtaPair.tsx");
  const header = read("src/components/SiteHeader.tsx");
  const doc = read("docs/STEP6_CONVERSION_FUNNEL.md");
  assert.match(cta, /primaryHref = "\/demo\//);
  assert.match(cta, /primaryLabel = "Request an early demo"/);
  assert.match(header, /href="\/demo\/"/);
  assert.match(doc, /primary website conversion is \*\*Create from website\*\*/);
});

test("paired CTAs visually subordinate the secondary action", () => {
  const cta = read("src/components/CtaPair.tsx");
  assert.match(cta, /bg-accent/);
  assert.match(cta, /secondaryHref/);
  assert.match(cta, /underline decoration-border/);
  assert.doesNotMatch(
    cta.split("secondaryHref")[1] ?? "",
    /border border-border bg-surface/,
  );
});

test("commercial enquiry form stays short", () => {
  const form = read("src/components/LeadCaptureForm.tsx");
  assert.match(form, /Only email is required\. Everything else is optional\./);
  assert.match(form, /Email \(required\)/);
  assert.match(form, /Name \(optional\)/);
  assert.match(form, /Organisation \(optional\)/);
  assert.match(form, /Role \(optional\)/);
  assert.match(form, /Message \(optional\)/);
  assert.equal((form.match(/required/g) ?? []).length >= 1, true);
});

test("all commercial enquiry intents still share one form and adapter", () => {
  const demo = read("src/components/DemoConversionTabs.tsx");
  const contact = read("src/app/contact/page.tsx");
  const home = read("src/app/page.tsx");
  assert.match(demo, /<LeadCaptureForm/);
  assert.match(demo, /leadType="launch_list"/);
  assert.match(demo, /leadType="early_demo"/);
  assert.match(contact, /<LeadCaptureForm/);
  assert.match(contact, /leadType="contact"/);
  assert.match(home, /<LeadCaptureForm/);
  assert.match(home, /leadType="launch_list"/);
});
