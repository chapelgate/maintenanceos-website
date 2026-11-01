import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const createPage = fs.readFileSync(path.join(ROOT, "src/app/create/page.tsx"), "utf8");
const industryPage = fs.readFileSync(
  path.join(ROOT, "src/components/IndustryRolePage.tsx"),
  "utf8",
);
const deferredWidget = fs.readFileSync(
  path.join(ROOT, "src/components/DeferredChatWidget.tsx"),
  "utf8",
);

test("DeferredChatWidget uses next/dynamic with ssr:false and accessible placeholder", () => {
  assert.match(deferredWidget, /next\/dynamic/);
  assert.match(deferredWidget, /import\(["']@\/components\/ChatWidget["']\)/);
  assert.match(deferredWidget, /ssr:\s*false/);
  assert.match(deferredWidget, /aria-busy="true"/);
  assert.match(deferredWidget, /aria-label="Chat widget/);
  assert.match(deferredWidget, /Loading/);
});

test("create page uses DeferredChatWidget instead of static ChatWidget import", () => {
  assert.match(createPage, /import \{ DeferredChatWidget \} from ["']@\/components\/DeferredChatWidget["']/);
  assert.match(createPage, /<DeferredChatWidget/);
  assert.doesNotMatch(createPage, /import \{ ChatWidget \} from ["']@\/components\/ChatWidget["']/);
  assert.doesNotMatch(createPage, /<ChatWidget/);
});

test("IndustryRolePage uses DeferredChatWidget instead of static ChatWidget import", () => {
  assert.match(industryPage, /import \{ DeferredChatWidget \} from ["']@\/components\/DeferredChatWidget["']/);
  assert.match(industryPage, /<DeferredChatWidget/);
  assert.doesNotMatch(industryPage, /import \{ ChatWidget \} from ["']@\/components\/ChatWidget["']/);
  assert.doesNotMatch(industryPage, /<ChatWidget/);
});

test("static export setting is unchanged by chat widget deferral", () => {
  const config = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  assert.match(config, /output:\s*["']export["']/);
});
