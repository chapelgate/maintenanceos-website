import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const flat = (s) => s.replace(/\{" "\}/g, " ").replace(/<[^>]+>/g, "").replace(/&apos;/g, "'").replace(/\s+/g, " ").replace(/ ([.,])/g, "$1");

const strip = read("src/components/GasSafetyStrip.tsx");
const block = read("src/components/GasSafetyBlock.tsx");
const rulebook = read("src/app/how-we-keep-control/page.tsx");
const layout = read("src/app/layout.tsx");
const role = read("src/components/IndustryRolePage.tsx");
const home = read("src/app/page.tsx");

test("site-wide strip carries the exact approved wording and tel links", () => {
  assert.ok(
    flat(strip).includes(
      "Smell gas? Get out, don't use switches or flames, and call the National Gas Emergency Service on 0800 111 999. If someone is unwell or in danger, call 999.",
    ),
  );
  assert.match(strip, /href="tel:0800111999"/);
  assert.match(strip, /href="tel:999"/);
  assert.match(strip, /min-h-11/);
  assert.doesNotMatch(strip, /"use client"|useState|onClick/);
  assert.match(layout, /<GasSafetyStrip \/>/);
});

test("rulebook opens with the gas section, NI number and CO signs", () => {
  const first = rulebook.indexOf("<section");
  assert.ok(rulebook.slice(first, first + 200).includes('id="gas"'));
  assert.match(rulebook, /If you smell gas right now/);
  assert.match(rulebook, /tel:0800002001/);
  assert.match(rulebook, /Carbon monoxide: know the signs/);
});

test("sector pages and hero point to the public gas steps", () => {
  for (const slug of ["landlords", "letting-agents", "housing-associations", "councils"]) {
    assert.ok(role.includes(`"${slug}"`), slug);
  }
  assert.match(block, /tel:0800002001/);
  assert.match(block, /not a MaintenanceOS service/);
  assert.match(home, /href="\/how-we-keep-control\/#gas"/);
});

test("gas copy makes no product or always-on claim", () => {
  for (const src of [strip, block, rulebook]) {
    assert.doesNotMatch(src, /24\/7|24 hours|round the clock|always[- ]on/i);
    assert.doesNotMatch(flat(src), /MaintenanceOS (handles|answers|routes|takes) gas/i);
  }
});

test("og:image points at the static file without a trailing slash", () => {
  const meta = read("src/lib/page-meta.ts");
  assert.doesNotMatch(meta, /absoluteUrl\("\/og-image\.png"\)/);
  assert.match(meta, /\/og-image\.png`/);
});
