import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("public source uses locked publisher identity", () => {
  const srcFiles = walk(path.join(ROOT, "src")).filter((file) =>
    /\.(ts|tsx)$/.test(file),
  );
  const joined = srcFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(joined, /Chapelgate Technologies/);

  const site = read("src/config/site.ts");
  assert.match(site, /publicBrand: "MaintenanceOS by Chapelgate"/);
  assert.match(site, /publisherName: "Chapelgate"/);
});

test("accent CTAs use the locked on-accent token and minimum target height", () => {
  const pricing = read("src/app/pricing/page.tsx");
  assert.doesNotMatch(pricing, /bg-accent[^"\n]*text-white/);
  assert.match(
    pricing,
    /min-h-11[^"\n]*bg-accent[^"\n]*text-on-accent[^"\n]*hover:bg-accent-hover/,
  );

  const pair = read("src/components/CtaPair.tsx");
  assert.match(
    pair,
    /min-h-11[^"\n]*bg-accent[^"\n]*text-on-accent[^"\n]*hover:bg-accent-hover/,
  );
});

test("brand source remains the single public naming authority", () => {
  const brand = read("BRAND_SYSTEM.md");
  assert.match(brand, /Public\/search identity: \*\*MaintenanceOS by Chapelgate\*\*/);
  assert.match(brand, /Publisher: \*\*Chapelgate\*\*/);
  assert.match(brand, /Do not drift between `Chapelgate` and `Chapelgate Technologies`/);
});
