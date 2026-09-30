import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const PRODUCT_SHA = "498ad82dd87631814195d447d89458480b117951";

function read(path) {
  return readFileSync(path, "utf8");
}

test("launch claims documents share the current product evidence pin", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");
  const checklist = read("WEBSITE_LAUNCH_CHECKLIST.md");
  const backlog = read("WEBSITE_BACKLOG.md");

  assert.match(claims, new RegExp(PRODUCT_SHA));
  assert.match(checklist, new RegExp(PRODUCT_SHA));
  assert.match(backlog, new RegExp(PRODUCT_SHA));
});

test("current claims remain conservative about live voice", () => {
  const claims = read("PRODUCT_CLAIMS_REGISTER.md");

  assert.match(claims, /greet-then-stall/i);
  assert.match(claims, /verified stalled-turn hotfix/i);
  assert.match(claims, /not deployed/i);
  assert.match(claims, /CONTROLLED_CARRIER_VOICE: NO-GO/);
  assert.match(claims, /COMMERCIALLY_LIVE: NO/);
});

test("retired onboarding scan is not an open external blocker", () => {
  const blockers = read("WEBSITE_EXTERNAL_BLOCKERS.md");

  assert.match(
    blockers,
    /## OPEN[\s\S]*No external blocker currently prevents ordinary website engineering/
  );
  assert.match(blockers, /## CLOSED[\s\S]*WB-002/);
  assert.doesNotMatch(
    blockers,
    /## OPEN[\s\S]*WB-002[\s\S]*## CLOSED/
  );
});
