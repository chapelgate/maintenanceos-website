import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

test("provisioning gateway is absent from the browser/static source graph", () => {
  const browserSource = walk("src")
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .map(read)
    .join("\n");
  assert.doesNotMatch(browserSource, /provisioning-gateway|PROVISIONING_GATEWAY/);
  assert.doesNotMatch(read(".env.example"), /NEXT_PUBLIC_PROVISIONING/);
});

test("gateway is server-only, has no CORS allow-origin, and rejects Origin", () => {
  const server = read("packages/provisioning-gateway/src/server.ts");
  assert.doesNotMatch(server, /Access-Control-Allow-Origin/);
  assert.match(server, /req\.headers\.origin/);
  assert.match(server, /browser_origin_forbidden/);
  assert.match(server, /productDatabaseAccess: false/);
  assert.match(server, /providerMutation: false/);
});

test("gateway authenticates with HMAC, timestamp, nonce and constant-time compare", () => {
  const auth = read("packages/provisioning-gateway/src/auth.ts");
  assert.match(auth, /createHmac\("sha256"/);
  assert.match(auth, /timingSafeEqual/);
  assert.match(auth, /AUTH_WINDOW_MS/);
  assert.match(auth, /claimNonce/);
  assert.match(auth, /idempotencyKey/);
});

test("gateway recomputes Step-7 evidence instead of trusting browser summary", () => {
  const engine = read("packages/provisioning-gateway/src/engine.ts");
  assert.match(engine, /qualifyAgentSandbox/);
  assert.match(engine, /Sandbox qualification does not match/);
  assert.match(engine, /sandbox_passed/);
  assert.match(engine, /lifecycle = \{ stage: "provisioning" \}/);
});

test("gateway uses durable state and is disabled by default", () => {
  const store = read("packages/provisioning-gateway/src/store.ts");
  const flags = read("packages/provisioning-gateway/src/flags.ts");
  assert.match(store, /FileProvisioningStore/);
  assert.match(store, /provisioning-gateway-state\.json/);
  assert.match(store, /mode: 0o600/);
  assert.doesNotMatch(flags, /fallback.*true/i);
});

test("normal repository tests include provisioning gateway regressions", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.match(
    packageJson.scripts.test,
    /packages\/provisioning-gateway\/src\/\*\.test\.ts/,
  );
  assert.match(
    packageJson.scripts["provisioning-gateway"],
    /packages\/provisioning-gateway\/src\/server\.ts/,
  );
});
