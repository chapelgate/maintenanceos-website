import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/not-found.tsx"), "utf8");

test("not-found has Trust+Security link + honourable failure notice", () => {
  assert.match(page, /href="\/trust\/"/);
  assert.match(page, /href="\/security\/"/);
  assert.match(page, /not a live support desk/);
  assert.match(page, /Missing-page screen only/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("not-found a11y: trust+security in related pre-launch pages", () => {
  assert.match(page, /Related pre-launch pages/);
  assert.match(page, /aria-labelledby="demo-trust-link"/i || /id="demo-trust-link"/i || /sr-only.*Related/);
});
