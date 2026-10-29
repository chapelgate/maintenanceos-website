import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

test("cookies page has draft status declared", () => {
  const cookies = read("src/app/cookies/page.tsx");
  assert.match(cookies, /Draft/);
  assert.match(cookies, /Pending legal review/);
  assert.match(cookies, /Not a compliance certification/);
});

test("cookies page has honest cookie categories", () => {
  const cookies = read("src/app/cookies/page.tsx");
  assert.match(cookies, /Essential/);
  assert.match(cookies, /Preferences/);
  assert.match(cookies, /Analytics/);
  assert.match(cookies, /Marketing/);
});

test("cookies page has honest analytics claim", () => {
  const cookies = read("src/app/cookies/page.tsx");
  assert.match(cookies, /No analytics cookie/);
  assert.match(cookies, /First-party cookieless/);
  assert.match(cookies, /operational measurement only/);
});

test("cookies page has honest marketing claim", () => {
  const cookies = read("src/app/cookies/page.tsx");
  assert.match(cookies, /Not used on this pre-launch site/);
  assert.match(cookies, /state absence rather than[\s\S]*inventing tags/);
  assert.match(cookies, /Non-essential and default off if ever added/);
});

test("cookies page has honest inventory claim", () => {
  const cookies = read("src/app/cookies/page.tsx");
  assert.match(cookies, /None configured — inventory empty/);
  assert.match(cookies, /do not invent cookie names/);
  assert.match(cookies, /pending counsel confirmation/);
});

test("cookies page references privacy and contact pages", () => {
  const cookies = read("src/app/cookies/page.tsx");
  assert.match(cookies, /\/privacy\//);
  assert.match(cookies, /\/contact/);
});

test("cookies page has legal draft banner and chrome", () => {
  const cookies = read("src/app/cookies/page.tsx");
  assert.match(cookies, /LegalDraftBanner/);
  assert.match(cookies, /LegalPageChrome/);
});

test("cookies page metadata structure is valid", () => {
  const cookies = read("src/app/cookies/page.tsx");
  assert.ok(cookies.includes("export const metadata"));
  assert.ok(cookies.includes('title: "Cookie Policy (Draft)"'));
  assert.ok(cookies.includes('path: "/cookies/"'));
});