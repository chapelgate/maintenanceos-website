import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/accessibility/page.tsx"), "utf8");
const a11y = fs.readFileSync(path.join(ROOT, "tests/webkit-a11y/a11y.test.mjs"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package-lock.json"), "utf8"));
const axeVersion = pkg.packages?.["node_modules/axe-core"]?.version
  ?? pkg.dependencies?.["axe-core"]?.version;

test("accessibility page cites installed axe-core and WCAG 2.2 axe tags", () => {
  assert.equal(axeVersion, "4.13.0");
  assert.match(page, /axe-core 4\.13.0/);
  assert.doesNotMatch(page, /axe-core 4\.10\.3/);
  assert.match(page, /wcag21aa/);
  assert.match(page, /wcag22aa/);
  assert.match(
    page,
    /not a full WCAG 2\.2 AA conformance claim|Do not read a green gate as\s+certification/i,
  );
  assert.match(
    a11y,
    /\.withTags\(\['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'\]\)/,
  );
});