import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const layout = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");
const deferred = fs.readFileSync(
  path.join(ROOT, "src/components/DeferredWebsiteMeasurement.tsx"),
  "utf8",
);

test("DeferredWebsiteMeasurement uses next/dynamic with ssr:false", () => {
  assert.match(deferred, /next\/dynamic/);
  assert.match(deferred, /import\(["']@\/components\/WebsiteMeasurement["']\)/);
  assert.match(deferred, /ssr:\s*false/);
});

test("root layout uses DeferredWebsiteMeasurement instead of static WebsiteMeasurement import", () => {
  assert.match(
    layout,
    /import \{ DeferredWebsiteMeasurement \} from ["']@\/components\/DeferredWebsiteMeasurement["']/,
  );
  assert.match(layout, /<DeferredWebsiteMeasurement\s*\/>/);
  assert.doesNotMatch(
    layout,
    /import \{ WebsiteMeasurement \} from ["']@\/components\/WebsiteMeasurement["']/,
  );
  assert.doesNotMatch(layout, /<WebsiteMeasurement\s*\/>/);
});

test("static export setting is unchanged by measurement deferral", () => {
  const config = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  assert.match(config, /output:\s*["']export["']/);
});
