import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(
  path.join(ROOT, "src/app/contact/page.tsx"),
  "utf8",
);

test("contact page demystifies live channels", () => {
  assert.match(page, /no monitored support\s+phone/i);
  assert.match(page, /no live chat/i);
  assert.match(page, /no response-time SLA/i);
  assert.match(page, /not a live support desk/i);
  assert.match(page, /mailto:info@chapelgatetechnologies\.com/);
  assert.doesNotMatch(page, /buy now/i);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
});

test("contact page does not claim a monitored phone number", () => {
  assert.doesNotMatch(page, /call us on/i);
  assert.doesNotMatch(page, /live support phone/i);
  assert.doesNotMatch(page, /24\/7 support/i);
});
