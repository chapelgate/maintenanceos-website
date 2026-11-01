import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const demoPage = fs.readFileSync(path.join(ROOT, "src/app/demo/page.tsx"), "utf8");
const deferred = fs.readFileSync(
  path.join(ROOT, "src/components/DeferredDemoConversionTabs.tsx"),
  "utf8",
);

test("DeferredDemoConversionTabs uses next/dynamic with ssr:false and accessible placeholder", () => {
  assert.match(deferred, /next\/dynamic/);
  assert.match(deferred, /import\(["']@\/components\/DemoConversionTabs["']\)/);
  assert.match(deferred, /ssr:\s*false/);
  assert.match(deferred, /aria-busy="true"/);
  assert.match(deferred, /Loading demo tabs/);
});

test("demo page uses DeferredDemoConversionTabs instead of static DemoConversionTabs import", () => {
  assert.match(
    demoPage,
    /import \{ DeferredDemoConversionTabs \} from ["']@\/components\/DeferredDemoConversionTabs["']/,
  );
  assert.match(demoPage, /<DeferredDemoConversionTabs/);
  assert.doesNotMatch(
    demoPage,
    /import \{ DemoConversionTabs \} from ["']@\/components\/DemoConversionTabs["']/,
  );
  assert.doesNotMatch(demoPage, /<DemoConversionTabs[\s/>]/);
});

test("static export setting is unchanged by demo tabs deferral", () => {
  const config = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  assert.match(config, /output:\s*["']export["']/);
});
