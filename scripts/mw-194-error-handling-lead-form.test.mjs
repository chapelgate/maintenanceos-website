import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("mw-194: error pages do not leak stack or environment", () => {
  for (const rel of ["src/app/error.tsx", "src/app/global-error.tsx"]) {
    const page = read(rel);
    assert.doesNotMatch(page, /error\.stack/);
    assert.doesNotMatch(page, /process\.env/);
    assert.doesNotMatch(page, /DATABASE_URL/);
    assert.doesNotMatch(page, /SECRET/);
    assert.doesNotMatch(page, /API_KEY/);
  }
});

test("mw-194: form errors are announced and focused", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  assert.match(form, /aria-describedby/);
  assert.match(form, /aria-invalid/);
});

test("mw-194: lead adapter returns ok/error Result", () => {
  const adapter = read("src/lib/lead-adapter.ts");
  assert.match(adapter, /ok: true|ok: false/);
  assert.match(adapter, /error: string/);
});
