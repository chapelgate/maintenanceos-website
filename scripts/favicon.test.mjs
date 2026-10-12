import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("favicon reuses the ink-on-paper mark and is a real icon", () => {
  const icoPath = path.join(ROOT, "public/favicon.ico");
  const pngPath = path.join(ROOT, "src/app/icon.png");
  const ico = fs.readFileSync(icoPath);
  const png = fs.readFileSync(pngPath);

  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.ok(ico.readUInt16LE(4) >= 1);
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16), 32);
  assert.equal(png.readUInt32BE(20), 32);

  const og = fs.readFileSync(path.join(ROOT, "public/og-image.png"));
  assert.notEqual(png.length, og.length);
  assert.ok(png.readUInt32BE(16) < og.readUInt32BE(16));
});
