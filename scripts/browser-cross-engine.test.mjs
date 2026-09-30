import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const smoke = fs.readFileSync("scripts/browser-cross-engine-smoke.mjs", "utf8");
const edgeSmoke = fs.readFileSync("scripts/browser-viewport-smoke.mjs", "utf8");
const gitignore = fs.readFileSync(".gitignore", "utf8");

test("cross-engine QA is dev-only and explicit", () => {
  assert.equal(pkg.devDependencies.playwright, "1.63.0");
  assert.equal(pkg.dependencies.playwright, undefined);
  assert.equal(pkg.scripts["browser:cross"], "node scripts/browser-cross-engine-smoke.mjs");
  assert.equal(pkg.scripts["browser:install"], "playwright install firefox webkit");
});

test("cross-engine QA covers Firefox and WebKit with durable diagnostics", () => {
  assert.match(smoke, /browserType: firefox/);
  assert.match(smoke, /browserType: webkit/);
  assert.match(smoke, /page\.route\("\*\*\/v1\/public\/website-events"/);
  assert.match(smoke, /accepted_for_browser_smoke/);
  assert.match(smoke, /page\.on\("pageerror"/);
  assert.match(smoke, /message\.type\(\) === "error"/);
  assert.match(smoke, /horizontal overflow/);
  assert.match(smoke, /native form regression/);
  assert.match(smoke, /Check this website/);
  assert.match(smoke, /latest\.json/);
  assert.match(smoke, /page\.screenshot/);
  assert.match(edgeSmoke, /Network\.setBlockedURLs/);
  assert.match(edgeSmoke, /v1\/public\/website-events/);
  assert.match(gitignore, /\.browser-cross-engine\//);
});
