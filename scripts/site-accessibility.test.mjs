import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

test("document shell exposes language, skip target and non-obscured main focus", () => {
  const layout = read("src/app/layout.tsx");
  const skip = read("src/components/SkipLink.tsx");
  const css = read("src/app/globals.css");

  assert.match(layout, /<html lang="en-GB">/);
  assert.match(layout, /<SkipLink \/>/);
  assert.match(layout, /<main id="main" tabIndex=\{-1\}/);
  assert.ok(
    layout.indexOf("<SkipLink />") < layout.indexOf("<SiteHeader />"),
    "skip link must precede the sticky header",
  );
  assert.match(skip, /href="#main"/);
  assert.match(skip, /Skip to main content/);
  assert.match(css, /scroll-padding-top:\s*5\.5rem/);
  assert.match(css, /#main[\s\S]*scroll-margin-top:\s*5\.5rem/);
});

test("focus and reduced-motion safeguards remain global", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /a:focus-visible,[\s\S]*summary:focus-visible/);
  assert.match(css, /outline:\s*2px solid var\(--color-accent\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /animation-duration:\s*0\.01ms !important/);
  assert.match(css, /transition-duration:\s*0\.01ms !important/);
});

test("shared navigation and CTA targets meet WCAG 2.2 minimum target size baseline", () => {
  const header = read("src/components/SiteHeader.tsx");
  const ctas = read("src/components/CtaPair.tsx");

  assert.match(header, /h-9 min-h-6/);
  assert.match(header, /h-9 w-9 min-h-6 min-w-6/);
  assert.match(header, /h-10 min-h-6/);
  assert.match(ctas, /min-h-11 min-w-6/);
});

test("header and footer wordmark accessible names come from visible text", () => {
  const header = read("src/components/SiteHeader.tsx");
  const footer = read("src/components/SiteFooter.tsx");
  const block = header.match(/function Wordmark\(\)[\s\S]*?\r?\n}\r?\n/)?.[0] ?? "";
  assert.match(block, /Maintenance/);
  assert.match(block, />OS</);
  assert.match(block, /by Chapelgate/);
  assert.doesNotMatch(block, /aria-label=/);
  assert.match(footer, /Maintenance/);
  assert.match(footer, /font-semibold">OS/);
  assert.match(footer, /by Chapelgate/);
  assert.doesNotMatch(footer, /aria-label=\{siteConfig\.publicBrand\}/);
});

test("all source img elements carry alt text", () => {
  const roots = ["src/app", "src/components"];
  const failures = [];
  for (const relRoot of roots) {
    const dir = path.join(ROOT, relRoot);
    for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".tsx")) continue;
      const full = path.join(entry.parentPath, entry.name);
      const source = fs.readFileSync(full, "utf8");
      for (const match of source.matchAll(/<img\s[\s\S]*?>/gi)) {
        if (!/\balt\s*=/.test(match[0])) {
          failures.push(path.relative(ROOT, full));
        }
      }
    }
  }
  assert.deepEqual(failures, []);
});

test("exported pages keep language, main landmark and image alternatives when out exists", () => {
  const out = path.join(ROOT, "out");
  if (!fs.existsSync(out)) return;

  const htmlFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "index.html") htmlFiles.push(full);
    }
  };
  walk(out);

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, /<html lang="en-GB">/, file);
    assert.match(html, /<main id="main"/, file);
    for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
      assert.match(img[0], /\balt=/, file);
    }
  }
});
