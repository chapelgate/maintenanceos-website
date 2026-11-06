import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const pages = [
  "src/app/page.tsx",
  "src/app/create/page.tsx",
  "src/app/accessibility/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/about/page.tsx",
  "src/app/buyers/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/demo/page.tsx",
  "src/app/features/page.tsx",
  "src/app/industries/page.tsx",
  "src/app/integrations/page.tsx",
  "src/app/help/page.tsx",
  "src/app/how-it-works/page.tsx",
  "src/app/how-we-keep-control/page.tsx",
  "src/app/security/page.tsx",
  "src/app/status/page.tsx",
  "src/app/trust/page.tsx",
  "src/app/privacy/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/subprocessors/page.tsx",
  "src/app/cookies/page.tsx",
  "src/app/vulnerability-disclosure/page.tsx",
  "src/app/onboarding/page.tsx",
  "src/app/dashboard/page.tsx",
  "src/app/error.tsx",
  "src/app/not-found.tsx",
];

test("heading levels do not skip more than one level on key pages", () => {
  for (const page of pages) {
    const content = read(page);
    const headings = content.match(/<h[1-6]\b/g) || [];
    let prevLevel = 0;
    for (const h of headings) {
      const level = parseInt(h[2], 10);
      if (prevLevel > 0) {
        assert.ok(
          level <= prevLevel + 1,
          `${page} heading jump from h${prevLevel} to h${level} not allowed`,
        );
      }
      prevLevel = level;
    }
  }
});

test("h1 content is descriptive when present", () => {
  for (const page of pages) {
    const content = read(page);
    const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (h1Match) {
      const h1Text = h1Match[1].trim();
      assert.ok(h1Text.length > 5, `${page} h1 must be descriptive, got: "${h1Text}"`);
      assert.doesNotMatch(
        h1Text,
        /^(Welcome|Home|Page|Untitled)/i,
        `${page} h1 must not be generic`,
      );
    }
  }
});

test("no heading skips from h2 to h4 or beyond", () => {
  for (const page of pages) {
    const content = read(page);
    const h2Match = content.match(/<h2[^>]*>([^<]+)<\/h2>/);
    const h4Match = content.match(/<h4\b/);
    if (h2Match && h4Match) {
      const h3Exists = content.match(/<h3\b/);
      assert.ok(
        h3Exists,
        `${page} has h2 and h4 but no h3 - missing intermediate level`,
      );
    }
  }
});

test("every page with h2 headings has exactly one h1", () => {
  for (const page of pages) {
    const content = read(page);
    const h1Matches = content.match(/<h1\b[^>]*>/g) || [];
    const h2Matches = content.match(/<h2\b/g) || [];
    if (h2Matches.length > 0 && h1Matches.length > 0) {
      assert.equal(
        h1Matches.length,
        1,
        `${page} must have exactly one h1, found ${h1Matches.length}`,
      );
    }
  }
});

test("heading text is not empty", () => {
  for (const page of pages) {
    const content = read(page);
    const headings = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g) || [];
    for (const h of headings) {
      const textMatch = h.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/);
      if (textMatch) {
        const text = textMatch[1].trim();
        assert.ok(text.length > 0, `${page} heading text must not be empty`);
      }
    }
  }
});
