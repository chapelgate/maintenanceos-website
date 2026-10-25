import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HELP = path.join(ROOT, "src/content/help");

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.mdx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const files = walk(HELP).map((file) => ({
  file,
  text: fs.readFileSync(file, "utf8"),
}));

const faq = fs.readFileSync(path.join(HELP, "faq.mdx"), "utf8");
const billing = fs.readFileSync(path.join(HELP, "billing-subscriptions.mdx"), "utf8");

test("help FAQ and billing do not publish product prices", () => {
  for (const source of [faq, billing]) {
    assert.doesNotMatch(source, /£\d/);
    assert.doesNotMatch(source, /50%\s*off/i);
    assert.doesNotMatch(source, /buy now/i);
  }
});

test("help product pricing pages keep request-on-request framing", () => {
  assert.match(faq, /no published price list/i);
  assert.match(faq, /request/i);
  assert.match(billing, /no published price list/i);
  assert.match(billing, /request/i);
});

test("help corpus refuses Starter\/Professional pound monthly list prices", () => {
  for (const item of files) {
    assert.doesNotMatch(item.text, /£49/);
    assert.doesNotMatch(item.text, /£149/);
    assert.doesNotMatch(item.text, /£470/);
    assert.doesNotMatch(item.text, /£1,?430/);
    assert.doesNotMatch(item.text, /£8\/month/);
    assert.doesNotMatch(item.text, /£5\/month/);
  }
});
