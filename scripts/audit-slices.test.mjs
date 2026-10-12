import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const read = (rel) => fs.readFileSync(rel, "utf8");

const FIVE = "Website → Check → Choose → Configure → Review & Try";

test("home, create and demo share the five step names", () => {
  const home = read("src/components/HomeOnboardingSteps.tsx");
  const demo = read("src/app/demo/page.tsx");
  const create = read("src/components/CreateJourneyStepper.tsx");
  const strip = read("src/components/FunnelPathStrip.tsx");
  for (const src of [home, demo, create, strip]) {
    assert.match(src, /CREATE_JOURNEY_STEPS/);
    assert.doesNotMatch(src, /Review & Pack/);
    assert.doesNotMatch(src, /→ optional save/);
  }
  assert.match(read("src/lib/onboarding-create-core.ts"), /Review & Try/);
  assert.doesNotMatch(demo, /Save setup \(optional\)/);
  assert.match(FIVE, /Review & Try/);
});

test("dashboard hides implementation strings and links to the sample dashboard", () => {
  const page = read("src/app/dashboard/page.tsx");
  const panel = read("src/components/CustomerDashboard.tsx");
  for (const src of [page, panel]) {
    assert.doesNotMatch(src, /NEXT_PUBLIC_/);
    assert.doesNotMatch(src, /packages\//);
  }
  assert.match(page, /\/demo\/#sample-dashboard/);
  assert.match(panel, /\/demo\/#sample-dashboard/);
  assert.match(read("src/components/DemoProof.tsx"), /id="sample-dashboard"/);
});

test("status and dashboard are out of the sitemap and noindex", () => {
  const routes = read("src/config/routes.ts");
  assert.doesNotMatch(routes, /"\/status\/"/);
  assert.doesNotMatch(routes, /"\/dashboard\/"/);
  for (const file of ["src/app/status/page.tsx", "src/app/dashboard/page.tsx"]) {
    assert.match(read(file), /index: false/);
  }
});

test("home product tour link and video focus stay in place", () => {
  assert.match(read("src/app/page.tsx"), /ProductTourWatchLink/);
  assert.match(read("src/lib/product-tour.ts"), /watchHref: "\/how-it-works\/#product-tour"/);
  assert.match(read("src/app/globals.css"), /\.product-tour-card video:focus-visible/);
});

test("JSON-LD names Chapelgate Technologies and ReceptionistOS is gone from source", () => {
  assert.match(read("src/lib/json-ld.ts"), /name: "Chapelgate Technologies"/);
  const roots = ["src", "packages", "public"];
  const hits = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        walk(full);
      } else if (/\.(ts|tsx|js|mjs|txt|css)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        if (text.includes("ReceptionistOS")) hits.push(full);
      }
    }
  }
  for (const root of roots) walk(root);
  assert.deepEqual(hits, []);
});

test("meta descriptions stay within 160 characters and titles end with the brand", () => {
  const descriptions = [];
  function collect(rel) {
    const text = read(rel);
    for (const match of text.matchAll(/description:\s*(?:\n\s*)?(?:"([^"]+)"|`([^`]+)`)/g)) {
      descriptions.push([rel, match[1] ?? match[2]]);
    }
    for (const match of text.matchAll(/absoluteTitle:\s*"([^"]+)"/g)) {
      assert.ok(
        match[1].endsWith("| MaintenanceOS"),
        `${rel} absolute title: ${match[1]}`,
      );
    }
  }
  collect("src/lib/page-meta.ts");
  collect("src/config/site.ts");
  for (const file of fs.readdirSync("src/app", { recursive: true })) {
    if (String(file).endsWith("page.tsx")) collect(path.join("src/app", String(file)));
  }
  for (const [rel, description] of descriptions) {
    assert.ok(
      description.length <= 160,
      `${rel} description is ${description.length}: ${description}`,
    );
  }
  const intents = read("src/config/seo-intents.ts");
  for (const match of intents.matchAll(/summary: "([^"]+)"/g)) {
    const description = `${match[1]} Pre-launch, not always-on.`;
    assert.ok(description.length <= 160, description);
  }
  assert.match(read("src/lib/page-meta.ts"), /template: `%s \| MaintenanceOS`/);
});

test("static export already emits trailing slashes and cannot add a 301", () => {
  const config = read("next.config.ts");
  assert.match(config, /output: "export"/);
  assert.match(config, /trailingSlash: true/);
  assert.doesNotMatch(config, /redirects\s*[:(]/);
});

test("lead form keeps the enquiry fallback and adds field focus plus a silent honeypot", () => {
  const form = read("src/components/LeadCaptureForm.tsx");
  assert.match(form, /EnquiryUnavailable/);
  assert.match(form, /!siteConfig\.formEndpoint\.trim\(\)/);
  assert.match(form, /Enter an email address/);
  assert.match(form, /Enter a valid email address/);
  assert.match(form, /emailRef\.current\?\.focus\(\)/);
  assert.match(form, /if \(website\.trim\(\)\)/);
  assert.doesNotMatch(form, /honeypot/i);
});
