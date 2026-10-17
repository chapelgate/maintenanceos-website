import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("Inter is not preloaded, so WebKit does not fetch the same woff2 twice", () => {
  const layout = fs.readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
  const block = layout.slice(layout.indexOf("const inter"), layout.indexOf("export const metadata"));
  assert.match(block, /preload:\s*false/);
  assert.doesNotMatch(block, /preload:\s*true/);
});
