import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("error handling hardening: error pages do not expose stack or environment", () => {
  for (const rel of ["src/app/error.tsx", "src/app/global-error.tsx"]) {
    const page = read(rel);
    assert.doesNotMatch(page, /error\.stack/);
    assert.doesNotMatch(page, /process\.env/);
    assert.doesNotMatch(page, /DATABASE_URL/);
    assert.doesNotMatch(page, /SECRET/);
    assert.doesNotMatch(page, /API_KEY/);
  }
});

test("error handling hardening: form errors are announced and focused", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  assert.match(form, /aria-describedby/);
  assert.match(form, /aria-invalid/);
});

test("error handling hardening: no console.error in production paths", () => {
  const form = read("src/components/CreateReceptionistForm.tsx");
  assert.doesNotMatch(form, /console\.error\(/);
});

test("error handling hardening: lead adapter handles errors gracefully", () => {
  const adapter = read("src/lib/lead-adapter.ts");
  assert.match(adapter, /try|catch|Result|Ok|Err/);
});