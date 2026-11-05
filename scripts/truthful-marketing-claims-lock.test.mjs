import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const register = fs.readFileSync(path.join(ROOT, "PRODUCT_CLAIMS_REGISTER.md"), "utf8");

test("marketing register has verified claims V-02 through V-06", () => {
  for (const id of ["V-02", "V-03", "V-04", "V-05", "V-06"]) {
    assert.ok(register.includes(`| ${id} |`), `missing ${id} in register`);
  }
});

test("marketing register has verified claims O-01 through O-07", () => {
  for (const id of ["O-01", "O-02", "O-03", "O-04", "O-05", "O-06", "O-07"]) {
    assert.ok(register.includes(`| ${id} |`), `missing ${id} in register`);
  }
});

test("marketing register has security claims S-01 through S-04", () => {
  for (const id of ["S-01", "S-02", "S-03", "S-04"]) {
    assert.ok(register.includes(`| ${id} |`), `missing ${id} in register`);
  }
});

test("marketing register has remaining claims R-04 and R-06", () => {
  assert.ok(register.includes("| R-04 |"), "missing R-04 in register");
  assert.ok(register.includes("| R-06 |"), "missing R-06 in register");
});

test("register has VERIFIED taxonomy entry", () => {
  assert.ok(register.includes("| **VERIFIED** |"), "missing VERIFIED taxonomy entry");
});

test("register denies live phone / GA claims", () => {
  assert.ok(register.includes("NOT AVAILABLE"), "missing NOT AVAILABLE section");
  assert.ok(register.includes("Commercially live / GA"), "missing commercially live GA gate");
});

test("register has signed footer with product checkpoint", () => {
  assert.ok(register.includes("PRODUCT_CHECKPOINT"), "missing product checkpoint in signature");
  assert.ok(register.includes("498ad82dd87631814195d447d89458480b117951"), "missing product SHA");
});

test("all registered V-claims appear in safe automation model doc", () => {
  const doc = fs.readFileSync(path.join(ROOT, "docs/STEP8_SAFE_AUTOMATION_MODEL.md"), "utf8");
  for (const id of ["V-03", "V-04", "O-03", "O-04", "O-05", "O-06", "S-03"]) {
    assert.ok(doc.includes(`${id}`), `missing claim source ${id} in safe automation model`);
  }
});

test("claims register consistency with trust claims", () => {
  assert.ok(register.includes("V-04"), "V-04 missing from register");
  assert.ok(register.includes("V-03"), "V-03 missing from register");
});
