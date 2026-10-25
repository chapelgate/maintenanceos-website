import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const widgetPath = resolve("src/components/ChatWidget.tsx");
const routePath = resolve("src/app/api/chat/route.ts");

const widgetSource = readFileSync(widgetPath, "utf8");

test("chat widget does not promise an email reply", () => {
  const lower = widgetSource.toLowerCase();
  assert(!lower.includes("reply to your email"), "widget contains 'reply to your email'");
  assert(!lower.includes("forwarded to our team email"), "widget contains 'forwarded to our team email'");
});

test("static export has no chat route handler", () => {
  assert(!existsSync(routePath), "src/app/api/chat/route.ts still exists");
});

test("chat widget does not fetch /api/chat", () => {
  assert(!widgetSource.includes('fetch("/api/chat"'), "widget still fetches /api/chat");
  assert(!widgetSource.includes("fetch('/api/chat'"), "widget still fetches /api/chat");
});