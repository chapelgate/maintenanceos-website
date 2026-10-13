import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("canonical production host is the live canonical origin", () => {
  const siteUrl = read("src/lib/site-url.ts");
  const env = read(".env.example");
  assert.match(
    siteUrl,
    /export const INTENDED_PRODUCTION_SITE_URL =\r?\n\s*"https:\/\/maintenanceos\.chapelgatetechnologies\.com";/,
  );
  assert.match(
    siteUrl,
    /export const FALLBACK_SITE_URL =\r?\n\s*"https:\/\/maintenanceos\.chapelgatetechnologies\.com";/,
  );
  assert.match(
    env,
    /^NEXT_PUBLIC_SITE_URL=https:\/\/maintenanceos\.chapelgatetechnologies\.com$/m,
  );
  assert.match(env, /maintenanceos\.chapelgatetechnologies\.com/);
});

test("create hero is a repair-intake preview, not a general receptionist", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /Turn your business website into a repair-intake preview/);
  assert.doesNotMatch(page, /Turn your business website into an AI receptionist/);
  assert.match(page, /does not change your live telephone service/);
  assert.match(page, /book viewings/);
  assert.match(page, /write into a CRM/);
});

test("cookies page no longer says measurement is sent to Railway", () => {
  const page = read("src/app/cookies/page.tsx");
  assert.match(page, /cookieless operational measurement/);
  assert.match(page, /uses no cookies/);
  assert.match(page, /persistent visitor identifier/);
  assert.match(page, /the beacon does not post/);
  assert.match(page, /events are not sent there/);
  assert.match(page, /Application not[\s\r\n]+found/);
  assert.doesNotMatch(
    page,
    /sends only bounded event type and pathname data to the[\s\S]{0,80}Railway/,
  );
});

test("accessibility note stays voluntary and is on the sitemap", () => {
  const page = read("src/app/accessibility/page.tsx");
  const routes = read("src/config/routes.ts");
  const site = read("src/config/site.ts");
  assert.match(page, /SI 2018\/952/);
  assert.match(page, /not that statement/);
  assert.match(page, /does not claim compliance with the\s+Equality Act 2010/);
  assert.match(page, /not a certification/);
  assert.match(page, /assistive technology/);
  assert.match(page, /physical iPhone or Mac Safari/);
  assert.match(page, /axe-core 4\.10\.3/);
  assert.match(page, /Playwright WebKit 26\.6/);
  assert.match(page, /reported no violations on those seven routes/);
  assert.doesNotMatch(page, /AXE_RESULT_PLACEHOLDER/);
  assert.match(routes, /"\/accessibility\/"/);
  assert.match(site, /href: "\/accessibility\/", label: "Accessibility"/);
  assert.doesNotMatch(page, /PSBAR statement is published|WCAG compliant|accessibility certified/i);
});
