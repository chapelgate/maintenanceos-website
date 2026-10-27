import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = fs.readFileSync(path.join(ROOT, "src/config/site.ts"), "utf8");
const footer = fs.readFileSync(
  path.join(ROOT, "src/components/SiteFooter.tsx"),
  "utf8",
);
const humans = fs.readFileSync(path.join(ROOT, "public/humans.txt"), "utf8");
const security = fs.readFileSync(
  path.join(ROOT, "public/.well-known/security.txt"),
  "utf8",
);

test("footer company nav exposes security.txt, humans.txt, and vulnerability disclosure", () => {
  assert.match(site, /href: ["']\/\.well-known\/security\.txt["']/);
  assert.match(site, /label: ["']Security policy["']/);
  assert.match(site, /href: ["']\/humans\.txt["']/);
  assert.match(site, /href: ["']\/vulnerability-disclosure\/["']/);
  assert.match(footer, /footerNav\.company/);
  assert.match(footer, /not commercially generally available/i);
});

test("linked security.txt and humans.txt stay pre-launch honest", () => {
  assert.match(security, /Policy: https:\/\/worksmartos\.co\.uk\/vulnerability-disclosure\//);
  assert.match(security, /Contact: mailto:info@chapelgatetechnologies\.com/);
  assert.match(security, /No bug bounty/);
  assert.match(humans, /Not commercially generally available/i);
  assert.match(humans, /No SLA claim/i);
  assert.doesNotMatch(humans, /£/);
});
