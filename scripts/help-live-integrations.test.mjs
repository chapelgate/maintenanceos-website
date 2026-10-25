import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HELP = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src/content/help");
const read = (name) => fs.readFileSync(path.join(HELP, name), "utf8");
const faq = read("faq.mdx");
const api = read("api-quickstart.mdx");
const overview = read("integration-overview.mdx");

test("FAQ does not publish a connector catalogue or an installable app", () => {
  assert.doesNotMatch(faq, /Yes\. Pre-built:/);
  assert.doesNotMatch(faq, /works offline, push notifications/);
  assert.match(faq, /not a live integration/i);
  assert.match(faq, /not a live app/i);
  assert.match(faq, /Not a public always-on phone/);
});

test("API quickstart does not walk through creating a live key", () => {
  assert.doesNotMatch(api, /Log into MaintenanceOS as Admin/);
  assert.doesNotMatch(api, /Create API Key/);
  assert.match(api, /no API key screen/i);
  assert.match(api, /not a live API key/i);
  assert.match(api, /not a live API/i);
});

test("integration overview does not publish a rate limit or named connectors", () => {
  assert.doesNotMatch(overview, /100 req\/min/);
  assert.doesNotMatch(overview, /Reapit/);
  assert.doesNotMatch(overview, /Authorise/);
  assert.doesNotMatch(overview, /OAuth 2\.0/);
  assert.match(overview, /no API key screen/i);
  assert.match(overview, /not a live API key/i);
  assert.match(overview, /not a live integration catalogue/i);
  assert.match(overview, /^## Webhooks$/m);
});
