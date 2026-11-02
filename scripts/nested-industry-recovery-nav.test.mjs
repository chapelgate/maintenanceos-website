import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const role = fs.readFileSync(path.join(ROOT, "src/components/IndustryRolePage.tsx"), "utf8");
const stub = fs.readFileSync(path.join(ROOT, "src/components/IndustryStubPage.tsx"), "utf8");
const shared = fs.readFileSync(path.join(ROOT, "src/components/PreLaunchRecoveryNav.tsx"), "utf8");

test("PreLaunchRecoveryNav exposes Related pre-launch pages with focus-visible", () => {
  assert.match(shared, /Related pre-launch pages/);
  assert.match(shared, /focus-visible:ring-2/);
  assert.match(shared, /href: "\/help\/"/);
  assert.match(shared, /href: "\/trust\/"/);
  assert.match(shared, /href: "\/security\/"/);
  assert.match(shared, /href: "\/contact\/"/);
  assert.doesNotMatch(shared, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(shared, /buy now/i);
});

test("IndustryRolePage uses PreLaunchRecoveryNav with All sectors Help Security Contact", () => {
  assert.match(role, /PreLaunchRecoveryNav/);
  assert.match(role, /href: "\/industries\/"/);
  assert.match(role, /href: "\/help\/"/);
  assert.match(role, /href: "\/security\/"/);
  assert.match(role, /href: "\/contact\/"/);
  assert.match(role, /not a live industry support desk/);
  assert.doesNotMatch(role, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("IndustryStubPage uses PreLaunchRecoveryNav", () => {
  assert.match(stub, /PreLaunchRecoveryNav/);
  assert.match(stub, /not a live industry support desk/);
  assert.doesNotMatch(stub, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
