import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const llms = fs.readFileSync(path.join(ROOT, "public/llms.txt"), "utf8");

test("llms.txt Contact section has no triple blank lines", () => {
  const contact = llms.split("## Contact")[1] ?? "";
  assert.ok(contact.length > 0);
  assert.doesNotMatch(contact, /\n\n\n/);
  assert.match(contact, /Create from website/);
  assert.match(contact, /There is no public always-on phone number/);
});
