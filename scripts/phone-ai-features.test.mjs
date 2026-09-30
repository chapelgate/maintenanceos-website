import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const FORBIDDEN_PRESENT_CLAIMS = [
  /always-on phone as available/i,
  /always-on phone line is live/i,
  /beats Fonio/i,
  /Fonio voice-quality parity/i,
  /concurrent (?:multi-?line|calls?|lines?) (?:up to|capacity|:)/i,
  /handles \d+ concurrent/i,
  /up to ~?15 concurrent/i,
  /commercially generally available now/i,
  /live always-on (?:customer )?phone is (?:available|live|included)/i,
];

function cardBlocks(config) {
  const start = config.indexOf("export const phoneAiMarketingCards");
  const end = config.indexOf("export type NotClaimedItem");
  assert.ok(start >= 0 && end > start, "marketing cards export missing");
  return config.slice(start, end);
}

const ON_PAGE_IDS = [
  "M-ONB-01",
  "M-TEL-01",
  "M-TEL-02",
  "M-TEL-03",
  "M-CAL-02",
  "M-POST-01",
  "M-UK-01",
];

const OFF_PAGE_IDS = [
  "M-KNO-01",
  "M-KNO-02",
  "M-TEL-04",
  "M-TEL-05",
  "M-CAL-01",
  "M-POST-02",
  "M-UK-02",
  "M-UK-03",
  "M-UK-04",
];

test("inventory short card set is exactly 7 cards and is not invented", () => {
  const inventory = read("docs/competitive/PHONE_AI_FEATURE_INVENTORY.md");
  const config = read("src/config/phone-ai-features.ts");
  const cards = cardBlocks(config);
  for (const id of ON_PAGE_IDS) {
    assert.match(inventory, new RegExp(`\\| ${id} \\|`));
    assert.match(cards, new RegExp(`id: "${id}"`));
  }
  for (const id of OFF_PAGE_IDS) {
    assert.match(inventory, new RegExp(`\\| ${id} \\|`));
    assert.doesNotMatch(cards, new RegExp(`id: "${id}"`));
  }
  assert.match(inventory, /exactly 7/);
  assert.match(inventory, /5 VERIFIED \+ 2 UNDER TEST/);
  assert.match(inventory, /NOT_ON_SITE/);
  assert.match(inventory, /Do not invent rows/);
  assert.match(config, /MARKETING_CARD_HARD_COUNT/);
});

test("marketing cards are exactly 5 VERIFIED and 2 UNDER TEST", () => {
  const config = read("src/config/phone-ai-features.ts");
  const cards = cardBlocks(config);
  const ids = [...cards.matchAll(/id: "(M-[A-Z]+-\d+)"/g)].map((m) => m[1]);
  const statuses = [...cards.matchAll(/status: "(VERIFIED|UNDER_TEST|NOT_ON_SITE)"/g)].map(
    (m) => m[1],
  );
  assert.deepEqual(ids, ON_PAGE_IDS);
  assert.equal(ids.length, 7);
  assert.equal(statuses.filter((s) => s === "VERIFIED").length, 5);
  assert.equal(statuses.filter((s) => s === "UNDER_TEST").length, 2);
  assert.equal(statuses.filter((s) => s === "NOT_ON_SITE").length, 0);
});

test("marketing cards never include NOT_ON_SITE as a present capability", () => {
  const config = read("src/config/phone-ai-features.ts");
  const cards = cardBlocks(config);
  assert.doesNotMatch(cards, /status: "NOT_ON_SITE"/);
  assert.match(cards, /status: "VERIFIED"/);
  assert.match(cards, /status: "UNDER_TEST"/);

  const notClaimedStart = config.indexOf("export const phoneAiNotClaimed");
  const notClaimed = config.slice(notClaimedStart);
  assert.match(notClaimed, /status: "NOT_ON_SITE"/);
  assert.doesNotMatch(notClaimed, /status: "VERIFIED"/);
  assert.doesNotMatch(notClaimed, /status: "UNDER_TEST"/);
});

test("features page copy omits forbidden present-fact claims", () => {
  const page = read("src/app/features/page.tsx");
  const config = read("src/config/phone-ai-features.ts");
  const copy = [page, cardBlocks(config)].join("\n");

  assert.doesNotMatch(page, /phoneAiNotClaimed/);
  assert.doesNotMatch(page, /Explore all gaps/);
  assert.match(page, /FeatureStatusChip/);
  assert.match(page, /UNDER_TEST_GROUP_HONESTY/);
  assert.match(page, /marketingCardsByGroup/);
  assert.match(page, /Create from website/);
  assert.match(page, /Join launch list/);
  assert.match(page, /VERIFIED/);
  assert.match(page, /PREVIEW/);
  assert.doesNotMatch(page, /^["']use client["']/m);

  for (const banned of FORBIDDEN_PRESENT_CLAIMS) {
    assert.doesNotMatch(
      copy,
      banned,
      `forbidden present-fact claim matched ${banned}`,
    );
  }

  assert.match(config, /Live always-on customer phone/);
  assert.match(config, /Concurrent multi-line capacity numbers/);
  assert.match(config, /Beats Fonio/);
  const cards = cardBlocks(config);
  assert.doesNotMatch(cards, /Live always-on customer phone/);
  assert.doesNotMatch(cards, /Concurrent multi-line/);
  assert.doesNotMatch(cards, /Beats Fonio/);
});

test("static export setting is unchanged", () => {
  const config = read("next.config.ts");
  assert.match(config, /output:\s*["']export["']/);
});
