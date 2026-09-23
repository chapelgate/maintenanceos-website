import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("home hero keeps locked CTAs primary; proof is labelled UNDER TEST shell", () => {
  const home = read("src/app/page.tsx");
  const visual = read("src/components/HomeHeroVisual.tsx");
  const shell = read("src/components/ProductUiShell.tsx");
  const pair = read("src/components/CtaPair.tsx");
  const orb = read("src/components/SiriOrbCloud.tsx");

  assert.match(home, /HomeHeroVisual/);
  assert.match(home, /mos-hero-atmosphere/);
  assert.match(home, /primaryHref="\/create\/"/);
  assert.match(home, /Create from website/);
  assert.match(home, /Request early access/);
  assert.match(home, /No live phone demo/);
  assert.match(visual, /SiriOrbCloud/);
  assert.match(visual, /ProductUiShell/);
  assert.doesNotMatch(home, /mos-hero-dusk/);
  assert.doesNotMatch(home, /tone="on-dusk"/);
  assert.doesNotMatch(home, /Placeholder ops chrome/);
  assert.doesNotMatch(visual, /CtaPair/);
  assert.doesNotMatch(visual, /Press the glow to begin/);

  assert.match(pair, /primaryHref = "\/create\/"/);
  assert.match(pair, /secondaryHref = "\/demo\/#demo"/);
  assert.doesNotMatch(pair, /tone/);

  assert.match(shell, /FeatureStatusChip status="UNDER_TEST"/);
  assert.match(shell, /Supervisor shell/);
  assert.match(shell, /Mock labels only — no live counts/);
  assert.match(shell, /WO-sample/);
  assert.doesNotMatch(shell, /£/);
  assert.doesNotMatch(shell, /\b\d{2,}%/);
  assert.doesNotMatch(shell, /live (phone|DID|call)/i);
  assert.doesNotMatch(shell, /amber-100|bg-amber/);

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

test("visual lock: light paper, blue-only glow, reduced-motion, static export", () => {
  const globals = read("src/app/globals.css");
  const brand = read("BRAND_SYSTEM.md");
  const visual = read("UI_VISUAL_SYSTEM.md");
  const tokens = read("docs/ui-preview/tokens.css");
  const config = read("next.config.ts");
  const header = read("src/components/SiteHeader.tsx");
  const wordmark = header.match(/function Wordmark\(\) \{[\s\S]*?\n\}/)?.[0] ?? "";

  assert.match(globals, /prefers-reduced-motion: reduce/);
  assert.match(globals, /\.mos-hero-atmosphere/);
  assert.match(globals, /\.intake-orb/);
  assert.match(globals, /--color-accent:\s*#1d4ed8/i);
  assert.match(globals, /--color-accent-hover:\s*#1e40af/i);
  assert.match(globals, /--color-accent-subtle:\s*#dbeafe/i);
  assert.match(globals, /--glow-blue:\s*#3b82f6/i);
  assert.match(globals, /--glow-sky:\s*#60a5fa/i);
  assert.match(globals, /--glow-white:\s*#eff6ff/i);
  assert.match(globals, /--color-info:\s*#0369a1/i);
  assert.match(globals, /--color-warn:\s*#92400e/i);
  assert.match(globals, /--color-warning-border:\s*#f59e0b/i);
  assert.match(globals, /--color-paper:\s*#f3eee4/i);
  assert.match(globals, /outline: 2px solid var\(--color-accent\)/);
  assert.doesNotMatch(globals, /--glow-amber|--glow-peach|--color-accent:\s*#b45309/i);
  assert.doesNotMatch(globals, /#5eead4|#c4b5fd|#7dd3fc|#0b1224|#14b8a6|#8b5cf6/i);
  assert.doesNotMatch(globals, /conic-gradient/);
  assert.match(tokens, /--mos-accent:\s*#1D4ED8/i);
  assert.match(tokens, /--mos-info:\s*#0369A1/i);
  assert.match(tokens, /--mos-warn:\s*#92400E/i);
  assert.match(brand, /council lock/);
  assert.match(brand, /#1D4ED8/);
  assert.match(brand, /#0369A1/);
  assert.match(visual, /secondary/);
  assert.match(visual, /Anti-patterns/);
  assert.match(visual, /flat ink/);
  assert.match(config, /output:\s*["']export["']/);
  assert.doesNotMatch(header, /^["']use client["']/);
  assert.match(wordmark, /text-ink/);
  assert.doesNotMatch(wordmark, /text-accent|bg-accent|text-info/);
});

test("motion lock: CSS-only idle morph, menu fade, reduced-motion instant", () => {
  const globals = read("src/app/globals.css");
  const tokens = read("docs/ui-preview/tokens.css");
  const header = read("src/components/SiteHeader.tsx");
  const orb = read("src/components/SiriOrbCloud.tsx");
  const visual = read("UI_VISUAL_SYSTEM.md");

  assert.match(globals, /@keyframes intake-idle/);
  assert.match(globals, /border-radius:\s*62% 38% 48% 52%/);
  assert.match(globals, /translate3d\(5px, -6px, 0\) scale\(1\.035\)/);
  assert.match(globals, /@keyframes intake-halo/);
  assert.match(globals, /@keyframes intake-sheen/);
  assert.match(globals, /prefers-reduced-motion:\s*no-preference/);
  assert.match(globals, /--mos-duration-menu:\s*200ms/);
  assert.match(globals, /--mos-duration-panel:\s*220ms/);
  assert.match(globals, /\.site-menu-panel/);
  assert.match(globals, /@starting-style/);
  assert.match(tokens, /--mos-duration-menu:\s*200ms/);
  assert.match(header, /site-menu-panel/);
  assert.match(header, /site-nav-link/);
  assert.match(header, /site-cta-outline/);
  assert.match(visual, /calm morph/);
  assert.match(visual, /Static orb \(no morph\/pulse\)/);

  assert.doesNotMatch(globals, /from ["']gsap["']|gsap\.|@gsap/);
  assert.doesNotMatch(orb, /from ["']gsap["']|gsap\./);
  assert.doesNotMatch(header, /from ["']gsap["']|gsap\./);
  assert.doesNotMatch(globals, /cubic-bezier\([^)]*[1-9]\.\d+/);
  assert.doesNotMatch(globals, /\b(bounce|spring|elastic)\b/i);
  assert.doesNotMatch(orb, /Press the glow to begin/);
  assert.doesNotMatch(orb, /always-on phone/i);

  assert.match(
    globals,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.intake-orb::after[\s\S]*animation: none !important/,
  );
  assert.match(
    globals,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.site-menu-panel[\s\S]*transition: none !important/,
  );
  assert.match(globals, /@keyframes home-photo-drift/);
  assert.match(globals, /prefers-reduced-motion:\s*no-preference[\s\S]*\.home-photo-motion/);
});

test("home photographs are licensed stock, not customers or RelicVault assets", () => {
  const media = read("src/content/home-media.ts");
  const visual = read("src/components/HomeHeroVisual.tsx");
  const band = read("src/components/HomeLifeBand.tsx");
  const sources = read("public/media/home/SOURCES.md");
  const home = read("src/app/page.tsx");

  assert.match(media, /Unsplash License/);
  assert.match(media, /Pexels License/);
  assert.match(media, /Stock photograph/);
  assert.match(media, /Not a MaintenanceOS customer/);
  assert.match(visual, /HOME_MEDIA/);
  assert.match(band, /HOME_MEDIA/);
  assert.match(sources, /unsplash\.com\/photos\/5lJAQ8yjzCM/);
  assert.match(sources, /pexels\.com\/photo\/3760263/);
  assert.doesNotMatch(media, /relicvault/i);
  assert.doesNotMatch(visual, /trusted by|testimonial|10,000/i);
  assert.doesNotMatch(band, /trusted by|testimonial/i);
  assert.doesNotMatch(home, /relicvault/i);
});
