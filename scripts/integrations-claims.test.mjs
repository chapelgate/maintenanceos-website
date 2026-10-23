import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

test("integrations-claims - google and outlook are not labelled available", () => {
  const integrationsPath = resolve(rootDir, "src/lib/integrations.ts");
  const content = readFileSync(integrationsPath, "utf-8");

  // Check that google and outlook have status: "coming-soon"
  assert.ok(content.includes('google: {') && content.includes('status: "coming-soon"'));
  assert.ok(content.includes('outlook: {') && content.includes('status: "coming-soon"'));

  // Ensure they do NOT have status: "available"
  const googleSection = content.split('google: {')[1]?.split('}')[0] || "";
  const outlookSection = content.split('outlook: {')[1]?.split('}')[0] || "";

  assert.ok(!googleSection.includes('status: "available"'), "google should not have status: available");
  assert.ok(!outlookSection.includes('status: "available"'), "outlook should not have status: available");
});

test("integrations-claims - integrations page does not say credentials never touch the browser", () => {
  const pagePath = resolve(rootDir, "src/app/integrations/page.tsx");
  const content = readFileSync(pagePath, "utf-8");

  // The sentence "Your credentials never touch the browser" must not appear
  assert.ok(
    !content.includes("credentials never touch the browser"),
    "Page must not contain 'credentials never touch the browser'"
  );

  // Also check the lower-case version
  assert.ok(
    !content.toLowerCase().includes("your credentials never touch the browser"),
    "Page must not contain 'Your credentials never touch the browser' (case insensitive)"
  );
});

test("integrations-claims - Connect button is gated on isProviderAvailable", () => {
  const providerPagePath = resolve(rootDir, "src/app/integrations/[provider]/page.tsx");
  const content = readFileSync(providerPagePath, "utf-8");

  // Check that isProviderAvailable is imported
  assert.ok(content.includes("isProviderAvailable"), "Must import isProviderAvailable");

  // Check that isProviderAvailable is used to gate the auth URL
  assert.ok(
    content.includes("isProviderAvailable(config.id)"),
    "Must use isProviderAvailable to determine availability"
  );

  // Check that the Connect button is only rendered when isAvailable is true
  assert.ok(
    content.includes("{isAvailable && authUrl && ("),
    "Connect button must be gated on isAvailable && authUrl"
  );
});