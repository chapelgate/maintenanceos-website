import assert from "node:assert/strict";
import test from "node:test";
import { getProviderConfig, getAllProviders, generateAuthUrl, isProviderAvailable, type IntegrationProviderId } from "./integrations.ts";
import { encryptToken, decryptToken, setEncryptionKey, isTokenExpired, MemoryTokenStore } from "./integration-tokens.ts";

test("integrations library - should export all 6 providers", () => {
  const providers = getAllProviders();
  assert.equal(providers.length, 6);
  const ids = providers.map((p) => p.id).sort();
  assert.deepEqual(ids, ["calcom", "calendly", "google", "hubspot", "outlook", "zapier"]);
});

test("integrations library - should have correct config for each provider", () => {
  const google = getProviderConfig("google");
  assert.equal(google.id, "google");
  assert.equal(google.name, "Google Calendar");
  assert.equal(google.status, "coming-soon");
  assert.ok(google.scopes.includes("https://www.googleapis.com/auth/calendar"));

  const outlook = getProviderConfig("outlook");
  assert.equal(outlook.id, "outlook");
  assert.equal(outlook.name, "Outlook Calendar");
  assert.equal(outlook.status, "coming-soon");

  const calcom = getProviderConfig("calcom");
  assert.equal(calcom.id, "calcom");
  assert.equal(calcom.name, "Cal.com");
  assert.equal(calcom.status, "coming-soon");

  const calendly = getProviderConfig("calendly");
  assert.equal(calendly.id, "calendly");
  assert.equal(calendly.name, "Calendly");
  assert.equal(calendly.status, "coming-soon");

  const zapier = getProviderConfig("zapier");
  assert.equal(zapier.id, "zapier");
  assert.equal(zapier.name, "Zapier");
  assert.equal(zapier.status, "coming-soon");

  const hubspot = getProviderConfig("hubspot");
  assert.equal(hubspot.id, "hubspot");
  assert.equal(hubspot.name, "HubSpot");
  assert.equal(hubspot.status, "coming-soon");
});

test("integrations library - should generate valid auth URLs", async () => {
  const expectedBaseUrl = "https://api.worksmartos.co.uk/v1/integrations";
  const encodedBaseUrl = encodeURIComponent(expectedBaseUrl);
  
  const googleUrl = await generateAuthUrl("google", "test-state");
  assert.ok(googleUrl.includes("accounts.google.com/o/oauth2/v2/auth"));
  assert.ok(googleUrl.includes("client_id="));
  assert.ok(googleUrl.includes("redirect_uri="));
  assert.ok(googleUrl.includes("scope="));
  assert.ok(googleUrl.includes("state=test-state"));
  assert.ok(googleUrl.includes("response_type=code"));
  assert.ok(googleUrl.includes("access_type=offline"));
  assert.ok(googleUrl.includes("prompt=consent"));
  assert.ok(googleUrl.includes(`${encodedBaseUrl}%2Fgoogle%2Fcallback`));

  const outlookUrl = await generateAuthUrl("outlook", "test-state");
  assert.ok(outlookUrl.includes("login.microsoftonline.com"));
  assert.ok(outlookUrl.includes("client_id="));
  assert.ok(outlookUrl.includes("redirect_uri="));
  assert.ok(outlookUrl.includes(`${encodedBaseUrl}%2Foutlook%2Fcallback`));
});

test("integrations library - should throw for unknown provider", () => {
  assert.throws(
    () => getProviderConfig("unknown" as IntegrationProviderId),
    { message: "Unknown integration provider: unknown" }
  );
});

test("integrations library - isProviderAvailable returns false without env vars", () => {
  // Since we don't have real env vars set, all should be false
  assert.equal(isProviderAvailable("google"), false);
  assert.equal(isProviderAvailable("outlook"), false);
});

test("integration-tokens - should encrypt and decrypt tokens roundtrip", async () => {
  const tokenData = {
    accessToken: "ya29.test-access-token",
    refreshToken: "1//test-refresh-token",
    expiresAt: Date.now() + 3600000,
    scope: "https://www.googleapis.com/auth/calendar",
  };

  const encrypted = await encryptToken(tokenData);
  assert.ok(encrypted);
  assert.equal(typeof encrypted, "string");
  assert.ok(encrypted.length > 100);

  const decrypted = await decryptToken(encrypted);
  assert.equal(decrypted.accessToken, tokenData.accessToken);
  assert.equal(decrypted.refreshToken, tokenData.refreshToken);
  assert.equal(decrypted.expiresAt, tokenData.expiresAt);
  assert.equal(decrypted.scope, tokenData.scope);
});

test("integration-tokens - should produce different ciphertext for same input", async () => {
  const tokenData = {
    accessToken: "test-token",
    refreshToken: "test-refresh",
    expiresAt: Date.now() + 3600000,
    scope: "test",
  };

  const encrypted1 = await encryptToken(tokenData);
  const encrypted2 = await encryptToken(tokenData);
  assert.notEqual(encrypted1, encrypted2);
});

test("integration-tokens - should fail to decrypt with wrong key", async () => {
  const tokenData = {
    accessToken: "test-token",
    refreshToken: "test-refresh",
    expiresAt: Date.now() + 3600000,
    scope: "test",
  };

  const encrypted = await encryptToken(tokenData);
  // Create a different 32-byte key
  const wrongKey = new Uint8Array(32);
  wrongKey.fill(42); // All bytes = 42
  setEncryptionKey(wrongKey);
  await assert.rejects(decryptToken(encrypted));
});

test("integration-tokens - isTokenExpired detects expiry", () => {
  const expiredToken = {
    accessToken: "token",
    expiresAt: Date.now() - 10000, // 10 seconds ago
    scope: "test",
  };
  assert.equal(isTokenExpired(expiredToken), true);

  const validToken = {
    accessToken: "token",
    expiresAt: Date.now() + 3600000, // 1 hour from now
    scope: "test",
  };
  assert.equal(isTokenExpired(validToken), false);

  const nearExpiryToken = {
    accessToken: "token",
    expiresAt: Date.now() + 2 * 60 * 1000, // 2 minutes from now (within 5 min buffer)
    scope: "test",
  };
  assert.equal(isTokenExpired(nearExpiryToken), true);
});

test("integration-tokens - MemoryTokenStore CRUD operations", async () => {
  const store = new MemoryTokenStore();

  await store.save("user1", "google", "encrypted-token-1");
  await store.save("user1", "outlook", "encrypted-token-2");
  await store.save("user2", "google", "encrypted-token-3");

  const loaded = await store.load("user1", "google");
  assert.equal(loaded, "encrypted-token-1");

  const notFound = await store.load("user1", "calendly");
  assert.equal(notFound, null);

  const providers = await store.listProviders("user1");
  assert.deepEqual(providers.sort(), ["google", "outlook"]);

  await store.delete("user1", "google");
  const afterDelete = await store.load("user1", "google");
  assert.equal(afterDelete, null);
});