import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function readPublic(name) {
  return fs.readFileSync(path.join(root, "public", name), "utf8");
}

const keyPaths = [
  "/",
  "/how-it-works/",
  "/features/",
  "/property-maintenance-software/",
  "/ai-receptionist/",
  "/security/",
  "/industries/",
  "/pricing/",
  "/demo/",
  "/create/",
];

const requiredPhrases = [
  "pre-launch",
  "Join launch list",
  "Request early demo",
  "under testing",
  "not commercially",
];

const funnelPath = /website URL .* website learning .* review .* configure .* browser voice preview .* optional save/;

test("llms.txt exists with claims-safe conversion and key URLs", () => {
  const text = readPublic("llms.txt");
  for (const phrase of requiredPhrases) {
    assert.match(
      text,
      new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      `missing phrase: ${phrase}`,
    );
  }
  for (const p of keyPaths) {
    assert.ok(text.includes(p), `missing path ${p}`);
  }
  assert.match(
    text,
    /do not .*overtake humans/i,
    "must prohibit overtake-humans speculation",
  );
  assert.match(text, funnelPath, "must name the verified public funnel");
  assert.match(text, /^# WorkSmartOS\b/m);
  assert.match(text, /WorkSmartOS is the brand/);
  assert.match(text, /MaintenanceOS is a WorkSmartOS product/);
  assert.match(text, /ReceptionistOS is coming soon and is not live/);
  assert.doesNotMatch(text, /WorkSmart OS/);
  assert.doesNotMatch(text, /MaintenanceOS by Chapelgate/);
  assert.match(text, /Chapelgate is the publisher/);
  assert.match(text, /Create from website/);
  assert.match(text, /bounded set of public HTTPS pages/i);
  assert.match(text, /missing (business )?facts stay missing/i);
  assert.match(text, /not a live phone/i);
  assert.match(text, /not commercially generally available/i);
  assert.match(text, /Do not claim/i);
  assert.match(text, /Ratings, reviews, or aggregate scores/);
  assert.match(text, /\[FAQ\].*bounded public website learning/i);
  assert.doesNotMatch(text, /always-on phone line is live/i);
  assert.doesNotMatch(text, /#demo/);
  assert.match(text, /https:\/\/worksmartos\.co\.uk\/demo\//);
  const contact = text.split("## Contact")[1] ?? "";
  assert.doesNotMatch(contact, /\n\n\n/);
});

test("llms-full.txt distinguishes VERIFIED / UNDER TEST / NOT CLAIMED", () => {
  const text = readPublic("llms-full.txt");
  assert.match(text, /VERIFIED/);
  assert.match(text, /^# WorkSmartOS\b/m);
  assert.match(text, /WorkSmartOS is the brand/);
  assert.match(text, /MaintenanceOS is a WorkSmartOS product/);
  assert.match(text, /ReceptionistOS is coming soon and is not live/);
  assert.doesNotMatch(text, /WorkSmart OS/);
  assert.doesNotMatch(text, /MaintenanceOS by Chapelgate/);
  assert.match(text, /Chapelgate is the publisher/);
  assert.match(text, /UNDER TEST/);
  assert.match(text, /NOT CLAIMED/);
  assert.match(text, /Join launch list/);
  assert.match(text, /Request early demo/);
  assert.match(text, /do not claim that AI will overtake humans/i);
  assert.match(text, /Do not use AGI/i);
  assert.match(text, funnelPath, "must name the verified public funnel");
  assert.match(text, /bounded, read-only set of public pages/i);
  assert.doesNotMatch(text, /owner-blocked|Gemini|Fonio/i);
  assert.match(text, /missing facts empty rather than inventing them/i);
  assert.match(text, /no telephone, aggregateRating, reviews, or offers/);
  assert.match(text, /robots\.txt allows major AI crawlers/);
  assert.match(text, /FAQPage JSON-LD/);
  assert.match(text, /empty hours\/services stay empty/);
});


test("public brand distinguishes product from publisher in source", () => {
  const site = fs.readFileSync(path.join(root, "src", "config", "site.ts"), "utf8");
  const schema = fs.readFileSync(path.join(root, "src", "lib", "json-ld.ts"), "utf8");
  assert.match(site, /publicBrand: "WorkSmartOS"/);
  assert.match(site, /parentBrand: "WorkSmartOS"/);
  assert.match(site, /name: "MaintenanceOS"/);
  assert.match(site, /publisherName: "Chapelgate"/);
  assert.match(site, /UK maintenance operations software with AI-assisted intake/);
  assert.match(schema, /name: "Chapelgate Technologies"/);
  assert.match(schema, /name: siteConfig\.publicBrand/);
  assert.match(schema, /alternateName: siteConfig\.name/);
  assert.match(schema, /\$\{siteConfig\.publicBrand\} \$\{siteConfig\.name\}/);
});
