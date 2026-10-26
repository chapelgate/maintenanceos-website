import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const HELP = path.join(ROOT, "src/content/help");
const faq = fs.readFileSync(path.join(HELP, "faq.mdx"), "utf8");
const getting = fs.readFileSync(path.join(HELP, "getting-help.mdx"), "utf8");
const publicEnquiry = fs.readFileSync(
  path.join(ROOT, "src/lib/public-enquiry.ts"),
  "utf8",
);

test("help FAQ and Getting Help use the canonical public enquiry email", () => {
  assert.match(publicEnquiry, /PUBLIC_ENQUIRY_EMAIL = "info@chapelgatetechnologies\.com"/);
  for (const source of [faq, getting]) {
    assert.match(source, /info@chapelgatetechnologies\.com/);
    assert.doesNotMatch(source, /early-access@maintenanceos\.co\.uk/);
    assert.doesNotMatch(source, /@maintenanceos\.co\.uk/);
  }
});

test("help corpus does not invent maintenanceos.co.uk mailboxes", () => {
  for (const name of fs.readdirSync(HELP)) {
    if (!name.endsWith(".mdx")) continue;
    const text = fs.readFileSync(path.join(HELP, name), "utf8");
    assert.doesNotMatch(text, /@maintenanceos\.co\.uk/, name);
  }
});
