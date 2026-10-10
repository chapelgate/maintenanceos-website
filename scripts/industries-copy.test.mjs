import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const slugs = [
  "landlords",
  "letting-agents",
  "property-managers",
  "maintenance-companies",
  "housing-associations",
  "facilities-management",
  "councils",
  "holiday-lets",
];

test("industries source names UK maintenance vs generic receptionist", () => {
  const src = read("src/config/industries.ts");
  assert.match(src, /ukMaintenanceVsGeneric/);
  assert.match(src, /Emergency triage vs jobs/);
  assert.match(src, /Contractor dispatch language/);
  assert.match(src, /Out-of-hours honesty/);
  assert.match(src, /No client-money/);
  assert.match(src, /never 911/);
  assert.match(src, /not a public always-on phone/);
  for (const match of src.matchAll(/\b911\b/g)) {
    const around = src.slice(Math.max(0, match.index - 12), match.index + 3);
    assert.match(around, /never 911/, "911 may appear only as never 911");
  }
  assert.doesNotMatch(src, /commercially generally available/i);
  assert.match(
    src,
    /No “we dispatch your team automatically.”/,
    "auto-dispatch may appear only as a will-not-claim",
  );
});

test("every industry role keeps 999, client-money, and no live always-on claim", () => {
  const src = read("src/config/industries.ts");
  for (const slug of slugs) {
    const start = src.indexOf(`slug: "${slug}"`);
    assert.ok(start >= 0, `missing slug ${slug}`);
    const next = slugs
      .map((s) => src.indexOf(`slug: "${s}"`))
      .filter((i) => i > start)
      .sort((a, b) => a - b)[0];
    const block = src.slice(start, next ?? src.length);
    assert.match(block, /999/, `${slug} must mention 999`);
    assert.match(block, /client-money/, `${slug} must mention client-money`);
    assert.match(
      block,
      /always-on/,
      `${slug} must mention always-on (as a non-claim)`,
    );
    assert.match(
      block,
      /under testing|Pre-launch|pilot-stage|Pilot-stage/,
      `${slug} must stay pre-launch / under testing`,
    );
  }
});

test("industry role page renders the shared UK-maintenance section", () => {
  const page = read("src/components/IndustryRolePage.tsx");
  assert.match(page, /ukMaintenanceVsGeneric/);
  assert.match(page, /UK maintenance — not a generic AI receptionist/);
  assert.match(page, /not commercial general availability/);
});

test("home industries grid lists all eight UK verticals at equal weight", () => {
  const home = read("src/app/page.tsx");
  const grid = read("src/components/HomeIndustries.tsx");
  assert.match(home, /HomeIndustries/);
  assert.match(grid, /industryRoles\.map/);
  assert.match(grid, /Equal weight/);
  assert.doesNotMatch(grid, /featured vertical|most popular industry/i);
  for (const slug of slugs) {
    assert.match(
      grid,
      /industryRoles/,
      `grid should iterate industryRoles including ${slug}`,
    );
  }
});


test("industries index contrasts UK maintenance with a generic receptionist", () => {
  const page = read("src/app/industries/page.tsx");
  assert.match(page, /emergency triage vs jobs/);
  assert.match(page, /contractor-dispatch language/);
  assert.match(page, /out-of-hours honesty/);
  assert.match(page, /no client-money/);
  assert.match(page, /not a generic AI receptionist/);
  assert.match(page, /public always-on phone is not/);
});

test("Fonio matrix records stronger PARTIAL / positioning-only for UK vertical", () => {
  const matrix = read("docs/competitive/fonio-parity-matrix.md");
  assert.match(matrix, /PARTIAL \(stronger\) \/ SUPERIOR-in-positioning-only/);
  assert.match(matrix, /emergency triage vs jobs/);
  assert.match(matrix, /Do not claim product superiority beyond positioning/);
});
