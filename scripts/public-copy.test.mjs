import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx?|txt|vtt)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) acc.push(full);
  }
  return acc;
}

function visible(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const files = [
  ...walk(path.join(ROOT, "src")),
  ...walk(path.join(ROOT, "public")),
].map((file) => ({ file, text: visible(fs.readFileSync(file, "utf8")) }));

const joined = files.map((item) => item.text).join("\n");

test("public copy drops internal jargon", () => {
  const forbidden = [
    /product-claims register/i,
    /\bHUMAN_REVIEW\b/,
    /\bdeterministic\b/i,
    /\bpytest\b/i,
    /\bSSRF\b/,
    /Cloud CI/,
    /\bSQLite\b/i,
    /Peer-common/,
    /\bRED\b/,
  ];
  for (const pattern of forbidden) {
    for (const item of files) {
      assert.doesNotMatch(item.text, pattern, `${item.file} matches ${pattern}`);
    }
  }
});

test("repeated blocks stay in full once", () => {
  const pages = files.filter((item) => item.file.includes(`${path.sep}src${path.sep}app${path.sep}`) && item.file.endsWith("page.tsx"));
  const fullSafety = pages.filter((item) => /<SafeAutomationModel\b/.test(item.text));
  assert.deepEqual(fullSafety.map((item) => path.relative(ROOT, item.file).replaceAll("\\", "/")), [
    "src/app/how-we-keep-control/page.tsx",
  ]);
  const fullStrip = pages.filter((item) => /<FunnelPathStrip\s*\/>/.test(item.text));
  assert.deepEqual(fullStrip.map((item) => path.relative(ROOT, item.file).replaceAll("\\", "/")), [
    "src/app/how-it-works/page.tsx",
  ]);
  const core = joined.match(/Core safety controls are built/g) ?? [];
  assert.equal(core.length, 1);
});

test("preview-inventory heading replaces What's live today", () => {
  const pages = files.filter((item) => item.file.endsWith("page.tsx"));
  let oldCount = 0;
  for (const item of pages) {
    oldCount += (item.text.match(/What's live today/g) ?? []).length;
  }
  assert.equal(oldCount, 0);
  const features = pages.find((item) => item.file.endsWith("features/page.tsx"));
  assert.ok(features, "features page missing");
  assert.equal((features.text.match(/Preview capability inventory/g) ?? []).length, 1);
  const proof = fs.readFileSync(path.join(ROOT, "src/components/CommercialProof.tsx"), "utf8");
  assert.equal((proof.match(/Preview capability inventory/g) ?? []).length, 1);
  assert.doesNotMatch(proof, /What's live today/);
});

test("company number appears on legal pages", () => {
  const legalPages = [
    path.join(ROOT, "src/app/privacy/page.tsx"),
    path.join(ROOT, "src/app/cookies/page.tsx"),
    path.join(ROOT, "src/app/terms/page.tsx"),
  ];
  for (const filePath of legalPages) {
    const text = fs.readFileSync(filePath, "utf8");
    assert.ok(text.includes("12340004"), `${filePath} does not contain company number`);
  }
});
