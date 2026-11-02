import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const rel of ["src/app/error.tsx", "src/app/global-error.tsx"]) {
  test(`${rel} links Trust Security with failure-screen honesty`, () => {
    const page = fs.readFileSync(path.join(ROOT, rel), "utf8");
    assert.match(page, /Related pre-launch pages/);
    assert.match(page, /href="\/trust\/"/);
    assert.match(page, /href="\/security\/"/);
    assert.match(page, /href="\/help\/"/);
    assert.match(page, /href="\/contact\/"/);
    assert.match(page, /not a live support desk/);
    assert.doesNotMatch(page, /buy now/i);
    assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  });
}
