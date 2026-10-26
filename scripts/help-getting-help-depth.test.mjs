import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/content/help/getting-help.mdx",
);
const text = fs.readFileSync(file, "utf8");

test("getting-help does not publish in-product support surfaces", () => {
  assert.doesNotMatch(text, /Contextual help/i);
  assert.doesNotMatch(text, /Guided tours/i);
  assert.doesNotMatch(text, /Was this helpful/i);
  assert.doesNotMatch(text, /Help → Tours/);
  assert.doesNotMatch(text, /Settings →|Reports →/);
  assert.doesNotMatch(text, /contact-support|community-forum|feature-requests|training-resources/);
  assert.match(text, /info@chapelgatetechnologies\.com/);
  assert.match(text, /no public support phone/i);
  assert.match(text, /not a live support desk/i);
  assert.match(text, /not a live SLA/i);
  assert.match(text, /not a live onboarding call/i);
  assert.match(text, /not a live status page/i);
  assert.match(text, /0800 111 999/);
  assert.match(text, /999/);
  assert.match(text, /not applicable/i);
});

test("getting-help description stays within the meta limit", () => {
  const description = text.match(/^description: "([^"]+)"/m)?.[1] ?? "";
  assert.ok(description.length > 0);
  assert.ok(description.length <= 160, `description is ${description.length}`);
});
