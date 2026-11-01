import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

test("package.json marks the project private (no public licence claim)", () => {
  assert.equal(pkg.private, true);
  assert.doesNotMatch(JSON.stringify(pkg), /"license":\s*"MIT"/i);
});

test("no public LICENCE file advertises an open licence the project does not grant", () => {
  const names = fs.readdirSync(ROOT);
  assert.ok(!names.some((n) => /^LICEN[CS]E$/i.test(n)));
});

test("README does not claim an open-source licence for this pre-launch synthetic demo", () => {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  assert.doesNotMatch(readme, /This project is licensed under/i);
  assert.doesNotMatch(readme, /MIT License/i);
  assert.doesNotMatch(readme, /Apache License/i);
});
