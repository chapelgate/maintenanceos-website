import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HELP = path.join(ROOT, "src/content/help");
const faq = fs.readFileSync(path.join(HELP, "faq.mdx"), "utf8");
const getting = fs.readFileSync(path.join(HELP, "getting-help.mdx"), "utf8");

test("FAQ and Getting Help do not publish a support phone or live SLA", () => {
  for (const source of [faq, getting]) {
    assert.doesNotMatch(source, /24\/7\/365/);
    assert.doesNotMatch(source, /Enterprise only \(24\/7/);
    assert.doesNotMatch(source, /\+44 20 3XXX/);
    assert.doesNotMatch(source, /monitored 24\/7/);
    assert.doesNotMatch(source, /2-hour response/);
    assert.doesNotMatch(source, /Dedicated line/);
    assert.match(source, /no public support phone/i);
    assert.match(source, /not a live support desk/i);
    assert.match(source, /not a live SLA/i);
  }
});

test("Getting Help keeps public emergency numbers and drops the placeholder line", () => {
  assert.match(getting, /0800 111 999/);
  assert.match(getting, /999/);
  assert.doesNotMatch(getting, /3XXX/);
});

test("help corpus has no placeholder London support number", () => {
  for (const name of fs.readdirSync(HELP)) {
    if (!name.endsWith(".mdx")) continue;
    const text = fs.readFileSync(path.join(HELP, name), "utf8");
    assert.doesNotMatch(text, /\+44 20 3XXX/, name);
    assert.doesNotMatch(text, /24\/7\/365/, name);
  }
});
