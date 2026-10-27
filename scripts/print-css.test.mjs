import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = fs.readFileSync(path.join(ROOT, "src/app/globals.css"), "utf8");
const banner = fs.readFileSync(
  path.join(ROOT, "src/components/PreLaunchBanner.tsx"),
  "utf8",
);

test("globals.css defines a print stylesheet that hides chrome", () => {
  assert.match(css, /@media print/);
  assert.match(css, /\.site-header/);
  assert.match(css, /\.prelaunch-banner/);
  assert.match(css, /\.mos-chat-widget/);
  assert.match(css, /a\[href="#main"\]/);
  const printBlock = css.slice(css.lastIndexOf("@media print"));
  for (const sel of [".site-header", ".prelaunch-banner", ".mos-chat-widget", 'a[href="#main"]']) {
    assert.match(printBlock, new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(printBlock, /display:\s*none\s*!important/);
  }
});

test("pre-launch banner exposes a stable print hook class", () => {
  assert.match(banner, /prelaunch-banner/);
});

test("print stylesheet does not invent commercial claims", () => {
  const printBlock = css.slice(css.lastIndexOf("@media print"));
  assert.doesNotMatch(printBlock, /£/);
  assert.doesNotMatch(printBlock, /buy now/i);
  assert.doesNotMatch(printBlock, /99\.\d%/);
});
