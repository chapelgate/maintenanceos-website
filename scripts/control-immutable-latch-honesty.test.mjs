import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/how-we-keep-control/page.tsx"),
  "utf8",
);

test("control page frames safety latch as design intent, not immutable live runtime", () => {
  assert.match(page, /Product design intent: when an intake report indicates hazards/);
  assert.match(page, /product path applies a safety latch/);
  assert.match(page, /Not a live latch runtime on this marketing site/);
  assert.match(page, /product design intent for verification/);
  assert.doesNotMatch(page, /immutable latch/);
  assert.doesNotMatch(page, /continuous verification/);
  assert.doesNotMatch(page, /the server applies an immutable latch/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
