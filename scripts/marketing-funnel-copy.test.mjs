import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("how-it-works matches the /create stepper labels", () => {
  const flow = read("src/components/HowItWorksFlow.tsx");
  const page = read("src/app/how-it-works/page.tsx");
  const create = [
    read("src/lib/onboarding-create.ts"),
    read("src/lib/onboarding-create-core.ts"),
  ].join("\n");

  assert.match(create, /label: "Website"/);
  assert.match(create, /label: "Check"/);
  assert.match(create, /label: "Review"/);
  assert.match(create, /label: "Pack"/);

  assert.match(flow, /CREATE_JOURNEY_STEPS/);
  assert.match(flow, /Website → Check → Review → Pack/);
  assert.match(flow, /do not invent extracted hours/);
  assert.match(flow, /scripted sandbox demo is under testing/);
  assert.match(flow, /not a live customer call/i);
  assert.doesNotMatch(flow, /always-on service/);

  assert.match(page, /Website → Check → Review → Pack/);
  assert.match(page, /scripted sandbox/);
  assert.match(page, /live phone number/);
  assert.match(page, /Create from website/);
  assert.match(page, /funnelPageMetadata\("howItWorks"\)/);
  assert.doesNotMatch(page, /commercially generally available/i);
});

test("features cards separate HAVE / UNDER TEST / COMING", () => {
  const page = read("src/app/features/page.tsx");
  assert.match(page, /heading: "HAVE"/);
  assert.match(page, /heading: "UNDER TEST"/);
  assert.match(page, /heading: "COMING"/);
  assert.match(page, /Website → Check → Review → Pack/);
  assert.match(page, /Pack-aware scripted sandbox/);
  assert.match(page, /Calendar connect/);
  assert.match(page, /Live always-on customer phone/);
  assert.match(page, /Not a live receptionist or a 30-second phone number/);
  assert.match(page, /funnelPageMetadata\("features"\)/);
  assert.doesNotMatch(page, /commercially generally available/i);
});

test("static export setting is unchanged", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
});

test("home CTA strip names the website-to-pack path", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /website URL/);
  assert.match(page, /knowledge pack/);
  assert.match(page, /scripted sandbox/);
  assert.match(page, /Create from website/);
  assert.match(page, /No live phone demo/);
  assert.match(page, /funnelPageMetadata\("home"\)/);
  assert.doesNotMatch(page, /Property maintenance operations for UK landlords/);
});

test("Fonio matrix notes marketing pages had lagged the create funnel", () => {
  const matrix = read("docs/competitive/fonio-parity-matrix.md");
  assert.match(matrix, /Were lagging/);
  assert.match(matrix, /Website → Check → Review → Pack/);
  assert.match(matrix, /HAVE \/ UNDER TEST \/ COMING/);
  assert.match(matrix, /narrative aligned; still not a live phone/);
  assert.match(matrix, /Demo \/ “see it live” CTAs vs `\/create` funnel/);
  assert.match(matrix, /demo CTAs aligned; still not a live phone/);
  assert.match(matrix, /SEO titles \/ descriptions \/ OG vs `\/create` funnel/);
  assert.match(matrix, /SEO meta aligned; still not a live phone/);
});

test("demo page names the website-to-pack path and does not book a live phone", () => {
  const page = read("src/app/demo/page.tsx");
  const tabs = read("src/components/DemoConversionTabs.tsx");
  const create = [
    read("src/lib/onboarding-create.ts"),
    read("src/lib/onboarding-create-core.ts"),
  ].join("\n");

  assert.match(create, /label: "Website"/);
  assert.match(page, /CREATE_JOURNEY_STEPS/);
  assert.match(page, /Website → Check → Review → Pack/);
  assert.match(page, /website URL → check → review draft → knowledge pack/);
  assert.match(page, /optional scripted sandbox/);
  assert.match(page, /Create from website/);
  assert.match(page, /live number/);
  assert.match(page, /funnelPageMetadata\("demo"\)/);
  assert.doesNotMatch(page, /See MaintenanceOS/);
  assert.doesNotMatch(page, /Book a product walkthrough/);
  assert.doesNotMatch(page, /Book a MaintenanceOS/);
  assert.doesNotMatch(page, /commercially generally available/i);

  assert.match(tabs, /Request early access/);
  assert.match(tabs, /not live number provisioning/);
  assert.match(tabs, /leadType="early_demo"/);
});

test("create page metadata comes from the shared funnel helper", () => {
  const page = read("src/app/create/page.tsx");
  assert.match(page, /funnelPageMetadata\("create"\)/);
  assert.doesNotMatch(page, /Create your AI receptionist/);
});

test("primary conversion CTAs point at /create, not a live phone demo", () => {
  const pair = read("src/components/CtaPair.tsx");
  const header = read("src/components/SiteHeader.tsx");
  const home = read("src/app/page.tsx");
  const industries = read("src/components/IndustryRolePage.tsx");

  assert.match(pair, /primaryHref = "\/create\/"/);
  assert.match(pair, /secondaryHref = "\/demo\/#demo"/);
  assert.match(header, /href="\/create\/"/);
  assert.match(header, /Create from website/);
  assert.match(header, /Early access/);
  assert.doesNotMatch(header, /See it live/i);
  assert.match(home, /primaryHref="\/create\/"/);
  assert.match(industries, /primaryHref="\/create\/"/);
  assert.match(industries, /secondaryHref="\/demo\/#demo"/);
});
