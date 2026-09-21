import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("home hero uses the orb/cloud, not the dated work-orders card", () => {
  const home = read("src/app/page.tsx");
  const orb = read("src/components/SiriOrbCloud.tsx");

  assert.match(home, /SiriOrbCloud/);
  assert.match(home, /mos-hero-dusk/);
  assert.doesNotMatch(home, /Work orders/);
  assert.doesNotMatch(home, /Placeholder ops chrome/);
  assert.match(home, /primaryHref="\/create\/"/);
  assert.match(home, /Create from website/);
  assert.match(home, /No live phone demo/);

  assert.match(orb, /["']use client["']/);
  assert.match(orb, /aria-expanded=\{open\}/);
  assert.match(orb, /aria-controls=\{panelId\}/);
  assert.match(orb, /Escape/);
  assert.match(orb, /Create from website/);
  assert.doesNotMatch(orb, /live (phone|call) demo/i);
  assert.doesNotMatch(orb, /always-on/);
});

test("create page shares the glow without importing the interactive orb", () => {
  const page = read("src/app/create/page.tsx");
  const accent = read("src/components/CreateOrbAccent.tsx");
  const form = read("src/components/CreateReceptionistForm.tsx");

  assert.match(page, /CreateOrbAccent/);
  assert.doesNotMatch(page, /SiriOrbCloud/);
  assert.doesNotMatch(accent, /["']use client["']/);
  assert.match(accent, /siri-orb--mini/);
  assert.match(form, /NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT|businessUrl|Check this website/);
  assert.match(form, /data-create-primary-action=""/);
});

test("visual system keeps reduced-motion, AA accent, and static export", () => {
  const globals = read("src/app/globals.css");
  const brand = read("BRAND_SYSTEM.md");
  const visual = read("UI_VISUAL_SYSTEM.md");
  const config = read("next.config.ts");
  const header = read("src/components/SiteHeader.tsx");

  assert.match(globals, /prefers-reduced-motion: reduce/);
  assert.match(globals, /\.siri-orb/);
  assert.match(globals, /--color-accent:\s*#b45309/i);
  assert.match(globals, /--color-accent-hover:\s*#9a3412/i);
  assert.match(globals, /outline: 2px solid var\(--color-accent\)/);
  assert.match(brand, /Brand System v0\.2/);
  assert.match(visual, /orb/);
  assert.doesNotMatch(visual, /Work orders/);
  assert.match(config, /output:\s*["']export["']/);
  assert.doesNotMatch(header, /^["']use client["']/);
});
