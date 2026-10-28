import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/measurement.ts"), "utf8");

test("measurement exports WebsiteEventType", () => {
  assert.match(src, /WebsiteEventType/);
});

test("measurement exports WebsiteEventInput", () => {
  assert.match(src, /WebsiteEventInput/);
});

test("measurement exports buildWebsiteEvent function", () => {
  assert.match(src, /export function buildWebsiteEvent/);
});

test("measurement exports PATH_RE regex", () => {
  assert.match(src, /PATH_RE/);
});

test("measurement has eventId function", () => {
  assert.match(src, /function eventId/);
});
