import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/property-maintenance-software/page.tsx"),
  "utf8",
);

test("property maintenance page frames AI intake as preview only", () => {
  assert.match(
    page,
    /AI-assisted intake exists only as a product preview — not a generally available live service/,
  );
  assert.doesNotMatch(page, /AI-assisted intake is available as a product preview/);
  assert.match(page, /does not claim general availability/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
