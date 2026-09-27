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
    return entry.isDirectory() ? walk(full) : [full];
  });
}

test("Step 9 provider adapters stay out of the static browser graph", () => {
  const browser = walk("src")
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .map(read)
    .join("\n");
  assert.doesNotMatch(browser, /agent-adapters|TTNC_WEBHOOK|AGENT_CONNECTOR_REGISTRY/);
  const env = read(".env.example");
  assert.doesNotMatch(env, /NEXT_PUBLIC_(?:TTNC|AGENT_ADAPTER|AGENT_CONNECTOR)/);
});

test("TTNC webhook contract is raw-body HMAC-SHA256 using Webhook-Signature", () => {
  const ttnc = read("packages/agent-adapters/src/ttnc.ts");
  const server = read("packages/agent-adapters/src/server.ts");
  assert.match(ttnc, /createHmac\("sha256"/);
  assert.match(ttnc, /timingSafeEqual/);
  assert.match(server, /webhook-signature/);
  assert.match(server, /rawBody: raw/);
  assert.doesNotMatch(ttnc + server, /fetch\s*\(/);
});

test("TTNC SetApplication remains a plan and never performs provider mutation", () => {
  const ttnc = read("packages/agent-adapters/src/ttnc.ts");
  const server = read("packages/agent-adapters/src/server.ts");
  assert.match(ttnc, /NoveroNumbers/);
  assert.match(ttnc, /SetApplication/);
  assert.match(ttnc, /mutationPerformed: false/);
  assert.match(server, /providerMutation: false/);
  assert.match(server, /telephonyActivation: false/);
});

test("provider identity is registry-side while blueprint stores connectorRef", () => {
  const registry = read("packages/agent-adapters/src/registry.ts");
  const engine = read("packages/agent-adapters/src/engine.ts");
  assert.match(registry, /provider/);
  assert.match(engine, /connectorRef: binding\.connectorRef/);
  assert.match(engine, /enabled: true/);
  assert.match(engine, /stage: "ready"/);
  assert.doesNotMatch(engine, /api_?key|password|credential/i);
});

test("adapter preparation remains behind the authenticated Step 8 gateway", () => {
  const server = read("packages/provisioning-gateway/src/server.ts");
  const adapter = read("packages/provisioning-gateway/src/adapters.ts");
  assert.match(server, /\/v1\/provisioning\/adapters\/prepare/);
  assert.match(server, /authenticateProvisioningRequest/);
  assert.match(adapter, /principalId !== input\.principal\.id/);
  assert.match(adapter, /getAdapterIdempotency/);
  assert.match(adapter, /putAdapterIdempotency/);
});

test("normal repository tests include Step 9 adapter regressions", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(
    pkg.scripts.test,
    /packages\/agent-adapters\/src\/\*\.test\.ts/,
  );
  assert.match(
    pkg.scripts["agent-adapters"],
    /packages\/agent-adapters\/src\/server\.ts/,
  );
});
