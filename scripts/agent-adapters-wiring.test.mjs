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

test("Step 9 reviewed blueprints declare integration intent before provisioning", () => {
  const selection = read("src/lib/agent-selection.ts");
  assert.match(selection, /kind: "telephony", enabled: true/);
  assert.match(selection, /kind: "calendar", enabled: true/);
  assert.match(selection, /requiredIntegrationIntents\(template\)/);
});

test("Step 9 provider credentials stay out of browser source", () => {
  const browser = walk("src")
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .map(read)
    .join("\n");
  assert.doesNotMatch(
    browser,
    /ADAPTER_CONNECTOR_REGISTRY_FILE|ADAPTER_MUTATIONS_ENABLED|TWILIO_API_KEY|TWILIO_API_SECRET/,
  );
});

test("Twilio adapter targets only current MaintenanceOS inbound routes", () => {
  const twilio = read("packages/provisioning-gateway/src/adapters/twilio.ts");
  assert.match(twilio, /voice\/inbound/);
  assert.match(twilio, /messaging\/inbound/);
  assert.match(twilio, /voice_application_sid/);
  assert.match(twilio, /trunk_sid/);
  assert.match(twilio, /sms_application_sid/);
  assert.doesNotMatch(twilio, /StatusCallback|FriendlyName|VoiceApplicationSid|TrunkSid/);
});

test("provider mutation is two-key gated and verify mode stays non-mutating", () => {
  const server = read("packages/provisioning-gateway/src/server.ts");
  assert.match(server, /ADAPTER_MUTATIONS_ENABLED/);
  assert.match(server, /record\.mode !== "verify" && record\.mode !== "apply"/);
  assert.match(server, /adapterMutationsEnabled && body\.mode === "apply"/);
  assert.match(server, /providerMutationEnabled: adapterMutationsEnabled/);
});

test("connector bindings remain operational evidence outside reviewed blueprint", () => {
  const engine = read("packages/provisioning-gateway/src/adapters/engine.ts");
  assert.match(engine, /bindingsHash/);
  assert.match(engine, /readyBlueprint\(provisioning\.blueprint\)/);
  assert.doesNotMatch(engine, /connectorRef\s*=/);
});

test("calendar readiness reuses existing companion and rejects mock provider", () => {
  const external = read("packages/provisioning-gateway/src/adapters/external.ts");
  assert.match(external, /calendar companion/i);
  assert.match(external, /provider !== "google" && provider !== "microsoft"/);
  assert.match(external, /tokenPresent/);
});

test("normal repository gate includes Step 9 adapter tests", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.match(
    pkg.scripts.test,
    /packages\/provisioning-gateway\/src\/adapters\/\*\.test\.ts/,
  );
});

test("Step 9 source has no obsolete carrier-specific implementation path", () => {
  const files = [
    "src/lib/agent-selection.ts",
    "packages/provisioning-gateway/src/server.ts",
    ...walk("packages/provisioning-gateway/src/adapters"),
  ];
  const source = files.map(read).join("\n").toLowerCase();
  assert.doesNotMatch(source, /ttnc/);
});
