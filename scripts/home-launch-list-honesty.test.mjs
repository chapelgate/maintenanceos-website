import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/page.tsx"), "utf8");

test("home launch list denies GA desk and live phone provisioning", () => {
  assert.match(page, /leadType="launch_list"/);
  assert.match(page, /not a GA support desk/i);
  assert.match(page, /not live phone provisioning/i);
  assert.match(
    page,
    /Updates only — not a live support desk, not a GA support desk, not live phone provisioning/,
  );
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});
