import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const blog = fs.readFileSync(path.join(ROOT, "src/app/blog/[slug]/page.tsx"), "utf8");
const help = fs.readFileSync(path.join(ROOT, "src/app/help/[slug]/page.tsx"), "utf8");

test("blog slug page recovery links Blog Help Trust Contact", () => {
  assert.match(blog, /PreLaunchRecoveryNav/);
  assert.match(blog, /href: "\/blog\/"/);
  assert.match(blog, /href: "\/help\/"/);
  assert.match(blog, /href: "\/trust\/"/);
  assert.match(blog, /href: "\/contact\/"/);
  assert.match(blog, /Editorial article only/);
  assert.doesNotMatch(blog, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(blog, /buy now/i);
});

test("help slug page recovery links Help centre FAQ Trust Contact", () => {
  assert.match(help, /PreLaunchRecoveryNav/);
  assert.match(help, /href: "\/help\/"/);
  assert.match(help, /href: "\/faq\/"/);
  assert.match(help, /href: "\/trust\/"/);
  assert.match(help, /href: "\/contact\/"/);
  assert.match(help, /Help article only/);
  assert.doesNotMatch(help, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(help, /buy now/i);
});
