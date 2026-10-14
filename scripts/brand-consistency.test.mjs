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

test("public copy spells the master brand as one word", () => {
  const roots = ["src", "public"];
  const hits = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        walk(rel);
      } else if (/\.(ts|tsx|txt|css)$/.test(entry.name)) {
        const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
        if (text.includes("WorkSmart OS")) hits.push(rel);
      }
    }
  }
  for (const root of roots) walk(root);
  assert.deepEqual(hits, []);
});

test("public source uses locked publisher identity", () => {
  const srcFiles = walk(path.join(ROOT, "src")).filter((file) =>
    /\.(ts|tsx)$/.test(file),
  );
  const joined = srcFiles
    .filter((file) => !file.endsWith(`${path.sep}json-ld.ts`))
    .filter((file) => !file.endsWith(`${path.sep}SiteFooter.tsx`))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  assert.doesNotMatch(joined, /Chapelgate Technologies/);
  assert.match(read("src/lib/json-ld.ts"), /name: "Chapelgate Technologies"/);
  assert.match(
    read("src/components/SiteFooter.tsx"),
    /WorkSmartOS by Chapelgate Technologies/,
  );
  assert.doesNotMatch(read("src/components/SiteFooter.tsx"), /WorkSmart OS/);

  const site = read("src/config/site.ts");
  assert.match(site, /publicBrand: "WorkSmartOS"/);
  assert.match(site, /parentBrand: "WorkSmartOS"/);
  assert.match(site, /name: "MaintenanceOS"/);
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
  assert.match(brand, /Public\/search identity: \*\*WorkSmartOS\*\*/);
  assert.match(brand, /never “WorkSmart OS”/);
  assert.match(brand, /Publisher: \*\*Chapelgate\*\*/);
  assert.match(brand, /Do not drift between `Chapelgate` and `Chapelgate Technologies`/);
});
