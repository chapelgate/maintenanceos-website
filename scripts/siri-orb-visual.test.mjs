import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("home hero keeps locked CTAs primary; orb is secondary intake listening", () => {
  const home = read("src/app/page.tsx");
  const orb = read("src/components/SiriOrbCloud.tsx");
  const pair = read("src/components/CtaPair.tsx");

  assert.match(home, /SiriOrbCloud/);
  assert.match(home, /primaryHref="\/create\/"/);
  assert.match(home, /Create from website/);
  assert.match(home, /Request early access/);
  assert.match(home, /No live phone demo/);
  assert.doesNotMatch(home, /mos-hero-dusk/);
  assert.doesNotMatch(home, /tone="on-dusk"/);
  assert.doesNotMatch(home, /Work orders/);
  assert.doesNotMatch(home, /Placeholder ops chrome/);

  assert.match(pair, /primaryHref = "\/create\/"/);
  assert.match(pair, /secondaryHref = "\/demo\/#demo"/);
  assert.doesNotMatch(pair, /tone/);

  assert.match(orb, /["']use client["']/);
  assert.match(orb, /aria-expanded=\{open\}/);
  assert.match(orb, /aria-controls=\{panelId\}/);
  assert.match(orb, /Escape/);
  assert.match(orb, /\/how-it-works\//);
  assert.match(orb, /\/create\//);
  assert.match(orb, /Intake listening/);
  assert.doesNotMatch(orb, /CtaPair/);
  assert.doesNotMatch(orb, /Press the glow to begin/);
  assert.doesNotMatch(orb, /live (phone|call) demo/i);
  assert.doesNotMatch(orb, /always-on phone/i);
});

test("create page does not sit an orb above the URL field", () => {
  const page = read("src/app/create/page.tsx");
  const form = read("src/components/CreateReceptionistForm.tsx");

  assert.doesNotMatch(page, /SiriOrbCloud/);
  assert.doesNotMatch(page, /CreateOrbAccent/);
  assert.match(form, /Business website URL \(required\)/);
  assert.match(form, /data-create-primary-action=""/);
  assert.match(form, /Check this website/);
});

test("visual lock: light paper, amber-only glow, reduced-motion, static export", () => {
  const globals = read("src/app/globals.css");
  const brand = read("BRAND_SYSTEM.md");
  const visual = read("UI_VISUAL_SYSTEM.md");
  const config = read("next.config.ts");
  const header = read("src/components/SiteHeader.tsx");

  assert.match(globals, /prefers-reduced-motion: reduce/);
  assert.match(globals, /\.intake-orb/);
  assert.match(globals, /--color-accent:\s*#b45309/i);
  assert.match(globals, /--color-accent-hover:\s*#9a3412/i);
  assert.match(globals, /--color-paper:\s*#f8fafc/i);
  assert.match(globals, /outline: 2px solid var\(--color-accent\)/);
  assert.doesNotMatch(globals, /#5eead4|#c4b5fd|#7dd3fc|#0b1224/i);
  assert.doesNotMatch(globals, /conic-gradient/);
  assert.match(brand, /council lock/);
  assert.match(visual, /secondary/);
  assert.match(visual, /Anti-patterns/);
  assert.match(config, /output:\s*["']export["']/);
  assert.doesNotMatch(header, /^["']use client["']/);
});
