import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const robots = fs.readFileSync(path.join(ROOT, "src/app/robots.ts"), "utf8");

test("robots.ts disallows /status.json and /release.json under *", () => {
  assert.match(robots, /disallow:\s*\[/);
  assert.match(robots, /"\/status\.json"/);
  assert.match(robots, /"\/release\.json"/);
  const star = robots.split('userAgent: "*"')[1]?.split("},")[0] ?? "";
  assert.match(star, /"\/status\.json"/);
  assert.match(star, /"\/release\.json"/);
});
