import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

function providerStatus(content, providerId) {
  const marker = `${providerId}: {`;
  const start = content.indexOf(marker);
  assert.ok(start !== -1, `${providerId} provider config not found`);
  const after = content.slice(start + marker.length);
  const nextProvider = after.search(/\n  [a-z]+: \{/);
  const block = nextProvider === -1 ? after : after.slice(0, nextProvider);
  const statusMatch = block.match(/status:\s*"([^"]+)"/);
  assert.ok(statusMatch, `${providerId} status field not found`);
  return statusMatch[1];
}

test("integrations-claims - google and outlook are not labelled available", () => {
  const integrationsPath = resolve(rootDir, "src/lib/integrations.ts");
  const content = readFileSync(integrationsPath, "utf-8");

  assert.equal(providerStatus(content, "google"), "coming-soon");
  assert.equal(providerStatus(content, "outlook"), "coming-soon");
});

test("integrations-claims - integrations page does not say credentials never touch the browser", () => {
  const pagePath = resolve(rootDir, "src/app/integrations/page.tsx");
  const content = readFileSync(pagePath, "utf-8");

  assert.ok(
    !content.toLowerCase().includes("credentials never touch the browser"),
    "Page must not contain 'credentials never touch the browser'",
  );

  assert.ok(
    content.includes('provider.status === "available"'),
    "Listing page must gate Connect on provider.status === \"available\"",
  );
  assert.ok(
    content.includes('{isAvailable ? "Connect" : "Ask about this integration"}'),
    "Coming-soon label must be Ask about this integration",
  );
});

test("integrations-claims - Connect button is gated on isProviderAvailable", () => {
  const providerPagePath = resolve(
    rootDir,
    "src/app/integrations/[provider]/page.tsx",
  );
  const content = readFileSync(providerPagePath, "utf-8");

  assert.ok(content.includes("isProviderAvailable"), "Must import isProviderAvailable");
  assert.ok(
    content.includes("isProviderAvailable(config.id)"),
    "Must use isProviderAvailable to determine availability",
  );
  assert.ok(
    content.includes("{isAvailable && authUrl && ("),
    "Connect button must be gated on isAvailable && authUrl",
  );
});
