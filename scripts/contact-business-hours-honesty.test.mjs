import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/contact/page.tsx"), "utf8");

test("contact page does not publish a business-hours response turnaround", () => {
  assert.match(
    page,
    /No published response-time turnaround on this draft site\. Not a support SLA\./,
  );
  assert.doesNotMatch(page, /Expected response turnaround: business hours/);
  assert.match(page, /no response-time SLA/);
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /buy now/i);
});
