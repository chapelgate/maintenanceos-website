import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(ROOT, "src/app/page.tsx"), "utf8");
const deferred = fs.readFileSync(
  path.join(ROOT, "src/components/DeferredProductUiShell.tsx"),
  "utf8",
);

test("home defers ProductUiShell behind next/dynamic so first paint stays light", () => {
  assert.match(deferred, /next\/dynamic/);
  assert.match(
    deferred,
    /import\(["']@\/components\/ProductUiShell["']\)/,
  );
  assert.match(deferred, /ssr:\s*false/);
  assert.match(deferred, /Loading supervisor shell preview/);
  assert.doesNotMatch(
    page,
    /import \{ ProductUiShell \} from ["']@\/components\/ProductUiShell["']/,
  );
  assert.match(page, /<DeferredProductUiShell/);
});

test("home shell deferral keeps honesty and static export", () => {
  assert.doesNotMatch(page, /NEXT_PUBLIC_PUBLIC_LAUNCH/);
  assert.doesNotMatch(page, /£/);
  assert.doesNotMatch(page, /buy now/i);
  const config = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  assert.match(config, /output:\s*["']export["']/);
});
