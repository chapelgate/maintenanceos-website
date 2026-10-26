import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const tabs = fs.readFileSync(
  path.join(ROOT, "src/components/DemoConversionTabs.tsx"),
  "utf8",
);

test("demo conversion launch list denies GA desk and live phone provisioning", () => {
  assert.match(tabs, /leadType="launch_list"/);
  assert.match(tabs, /not a GA support desk/i);
  assert.match(tabs, /(?:not live phone provisioning|no live phone provisioning)/i);
  assert.match(tabs, /no live chat/i);
  assert.match(tabs, /no response-time SLA/i);
  assert.doesNotMatch(tabs, /buy now/i);
  assert.doesNotMatch(tabs, /£/);
  assert.doesNotMatch(tabs, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("demo conversion early-demo helper keeps briefing honesty", () => {
  assert.match(tabs, /leadType="early_demo"/);
  assert.match(tabs, /Request early access/);
  assert.match(tabs, /not live number provisioning/);
  assert.match(tabs, /not a GA support desk/);
  assert.match(tabs, /no response-time SLA/);
});
