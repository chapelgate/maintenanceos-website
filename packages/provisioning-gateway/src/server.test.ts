import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import { signProvisioningRequest } from "./auth.ts";
import { createProvisioningServer } from "./server.ts";
import { MemoryProvisioningStore } from "./store.ts";
import { validProvisioningEnvelope } from "./test-fixture.ts";

const NOW = 1_790_532_000_000;
const PRINCIPAL = {
  id: "provisioner_main",
  keyId: "key_main",
  secret: "0123456789abcdef0123456789abcdef",
  tenantRefs: ["tenant_acme"],
};

type Response = {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: Record<string, unknown>;
};

async function withServer(
  options: Parameters<typeof createProvisioningServer>[0],
  run: (base: string) => Promise<void>,
) {
  const server = createProvisioningServer(options);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("server address missing");
  try {
    await run("http://127.0.0.1:" + address.port);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

async function request(
  base: string,
  input: {
    method?: string;
    path?: string;
    headers?: Record<string, string>;
    body?: string;
  },
): Promise<Response> {
  const url = new URL(input.path ?? "/v1/provisioning/requests", base);
  return new Promise<Response>((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: input.method ?? "GET",
        headers: input.headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: text ? (JSON.parse(text) as Record<string, unknown>) : {},
          });
        });
      },
    );
    req.on("error", reject);
    if (input.body) req.write(input.body);
    req.end();
  });
}

function signedHeaders(
  body: string,
  nonce: string,
  idempotencyKey: string,
  path = "/v1/provisioning/requests",
): Record<string, string> {
  const timestamp = String(NOW);
  return {
    "Content-Type": "application/json",
    "X-MOS-Key-Id": PRINCIPAL.keyId,
    "X-MOS-Timestamp": timestamp,
    "X-MOS-Nonce": nonce,
    "Idempotency-Key": idempotencyKey,
    "X-MOS-Signature": signProvisioningRequest({
      secret: PRINCIPAL.secret,
      timestamp,
      nonce,
      idempotencyKey,
      body,
      pathname: path,
    }),
  };
}

test("health is boolean-only and exposes no auth secret or CORS", async () => {
  await withServer(
    {
      enabled: true,
      principal: PRINCIPAL,
      store: new MemoryProvisioningStore(),
    },
    async (base) => {
      const res = await request(base, { method: "GET", path: "/health" });
      assert.equal(res.status, 200);
      assert.equal(res.body.gatewayEnabled, true);
      assert.equal(res.body.authConfigured, true);
      assert.equal(res.body.browserAccess, false);
      assert.equal(res.body.productDatabaseAccess, false);
      assert.equal(res.body.providerMutationEnabled, false);
      assert.equal(
        res.body.adapterPath,
        "/v1/provisioning/adapters/prepare",
      );
      assert.equal(res.headers["access-control-allow-origin"], undefined);
      assert.doesNotMatch(JSON.stringify(res.body), /0123456789abcdef|key_main/);
    },
  );
});

test("browser-origin requests are rejected before provisioning", async () => {
  await withServer(
    {
      enabled: true,
      principal: PRINCIPAL,
      store: new MemoryProvisioningStore(),
      nowMs: () => NOW,
    },
    async (base) => {
      const res = await request(base, {
        method: "POST",
        headers: {
          Origin: "https://example.com",
          "Content-Type": "application/json",
        },
        body: "{}",
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.error, "browser_origin_forbidden");
      assert.equal(res.headers["access-control-allow-origin"], undefined);
    },
  );
});

test("gateway stays disabled by default and fails closed without auth", async () => {
  await withServer(
    { enabled: false, principal: null, store: new MemoryProvisioningStore() },
    async (base) => {
      const disabled = await request(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      assert.equal(disabled.status, 503);
      assert.equal(disabled.body.error, "gateway_disabled");
    },
  );

  await withServer(
    { enabled: true, principal: null, store: new MemoryProvisioningStore() },
    async (base) => {
      const noAuth = await request(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      assert.equal(noAuth.status, 503);
      assert.equal(noAuth.body.error, "auth_not_configured");
    },
  );
});

test("signed request creates one provisioning record and idempotent retry reuses it", async () => {
  const store = new MemoryProvisioningStore();
  await withServer(
    {
      enabled: true,
      principal: PRINCIPAL,
      store,
      nowMs: () => NOW,
      now: () => new Date("2026-09-27T18:45:00.000Z"),
    },
    async (base) => {
      const envelope = await validProvisioningEnvelope();
      const body = JSON.stringify(envelope);
      const first = await request(base, {
        method: "POST",
        headers: signedHeaders(
          body,
          "nonce_server_00000001",
          "idem_server_0001",
        ),
        body,
      });
      assert.equal(first.status, 201);
      assert.equal(first.body.ok, true);
      const firstData = first.body.data as Record<string, unknown>;
      assert.equal(firstData.blueprintStage, "provisioning");
      assert.equal(firstData.replayed, false);

      const second = await request(base, {
        method: "POST",
        headers: signedHeaders(
          body,
          "nonce_server_00000002",
          "idem_server_0001",
        ),
        body,
      });
      assert.equal(second.status, 200);
      const secondData = second.body.data as Record<string, unknown>;
      assert.equal(secondData.provisioningId, firstData.provisioningId);
      assert.equal(secondData.replayed, true);
    },
  );
});

test("same nonce is rejected while same idempotency key with changed request conflicts", async () => {
  const store = new MemoryProvisioningStore();
  await withServer(
    {
      enabled: true,
      principal: PRINCIPAL,
      store,
      nowMs: () => NOW,
    },
    async (base) => {
      const firstEnvelope = await validProvisioningEnvelope();
      const firstBody = JSON.stringify(firstEnvelope);
      const headers = signedHeaders(
        firstBody,
        "nonce_server_replay01",
        "idem_server_0002",
      );
      const first = await request(base, {
        method: "POST",
        headers,
        body: firstBody,
      });
      assert.equal(first.status, 201);

      const replayNonce = await request(base, {
        method: "POST",
        headers,
        body: firstBody,
      });
      assert.equal(replayNonce.status, 401);
      assert.equal(replayNonce.body.error, "replay_detected");

      const changedEnvelope = await validProvisioningEnvelope({
        greeting: "A different reviewed greeting",
        blueprintId: "abp_step8test0003",
      });
      const changedBody = JSON.stringify(changedEnvelope);
      const conflict = await request(base, {
        method: "POST",
        headers: signedHeaders(
          changedBody,
          "nonce_server_conflict1",
          "idem_server_0002",
        ),
        body: changedBody,
      });
      assert.equal(conflict.status, 409);
      assert.equal(conflict.body.error, "idempotency_conflict");
    },
  );
});

test("cross-tenant signed request is forbidden", async () => {
  await withServer(
    {
      enabled: true,
      principal: PRINCIPAL,
      store: new MemoryProvisioningStore(),
      nowMs: () => NOW,
    },
    async (base) => {
      const envelope = await validProvisioningEnvelope({
        tenantRef: "tenant_other",
      });
      const body = JSON.stringify(envelope);
      const res = await request(base, {
        method: "POST",
        headers: signedHeaders(
          body,
          "nonce_server_tenant01",
          "idem_server_0004",
        ),
        body,
      });
      assert.equal(res.status, 403);
      assert.equal(res.body.error, "tenant_forbidden");
    },
  );
});


test("adapter endpoint prepares the reviewed Twilio intent and replays immutably", async () => {
  const store = new MemoryProvisioningStore();
  const registry = {
    connectors: [{
      ref: "twilio_primary",
      provider: "twilio" as const,
      kinds: ["telephony"] as ["telephony"],
      accountSid: "AC" + "a".repeat(32),
      incomingPhoneNumberSid: "PN" + "b".repeat(32),
      publicBaseUrl: "https://voice.example.com/",
      apiKeyEnv: "TWILIO_API_KEY",
      apiSecretEnv: "TWILIO_API_SECRET",
    }],
  };
  await withServer(
    {
      enabled: true,
      principal: PRINCIPAL,
      store,
      nowMs: () => NOW,
      now: () => new Date("2026-09-27T19:30:00.000Z"),
      env: {
        TWILIO_API_KEY: "SK" + "c".repeat(32),
        TWILIO_API_SECRET: "server-secret-value",
      },
      adapterRegistry: registry,
      adapterTransport: async () => ({
        status: 200,
        body: JSON.stringify({
          voice_url: "https://voice.example.com/voice/inbound",
          voice_method: "POST",
          voice_application_sid: null,
          trunk_sid: null,
          sms_url: "",
          sms_method: "POST",
          sms_application_sid: null,
        }),
      }),
    },
    async (base) => {
      const envelope = await validProvisioningEnvelope({
        blueprintId: "abp_step9server001",
      });
      const provisionBody = JSON.stringify(envelope);
      const provisioned = await request(base, {
        method: "POST",
        headers: signedHeaders(
          provisionBody,
          "nonce_step9_provision01",
          "idem_step9_provision",
        ),
        body: provisionBody,
      });
      assert.equal(provisioned.status, 201);
      const provisioningId = (provisioned.body.data as Record<string, unknown>)
        .provisioningId as string;

      const adapterPath = "/v1/provisioning/adapters/prepare";
      const adapterBody = JSON.stringify({
        provisioningId,
        mode: "verify",
        bindings: [{ kind: "telephony", connectorRef: "twilio_primary" }],
      });
      const prepared = await request(base, {
        method: "POST",
        path: adapterPath,
        headers: signedHeaders(
          adapterBody,
          "nonce_step9_adapter001",
          "idem_step9_adapter01",
          adapterPath,
        ),
        body: adapterBody,
      });
      assert.equal(prepared.status, 201);
      assert.equal(prepared.body.ok, true);
      const data = prepared.body.data as Record<string, unknown>;
      const blueprint = data.blueprint as Record<string, unknown>;
      assert.deepEqual(blueprint.lifecycle, { stage: "ready" });
      assert.equal(prepared.body.replayed, false);

      const replay = await request(base, {
        method: "POST",
        path: adapterPath,
        headers: signedHeaders(
          adapterBody,
          "nonce_step9_adapter002",
          "idem_step9_adapter02",
          adapterPath,
        ),
        body: adapterBody,
      });
      assert.equal(replay.status, 200);
      assert.equal(replay.body.replayed, true);

      const changedBody = JSON.stringify({
        provisioningId,
        mode: "verify",
        bindings: [{ kind: "telephony", connectorRef: "other_twilio" }],
      });
      const changed = await request(base, {
        method: "POST",
        path: adapterPath,
        headers: signedHeaders(
          changedBody,
          "nonce_step9_adapter003",
          "idem_step9_adapter03",
          adapterPath,
        ),
        body: changedBody,
      });
      assert.equal(changed.status, 409);
      assert.equal(changed.body.error, "idempotency_conflict");
    },
  );
});

test("adapter endpoint never mutates a mismatched Twilio route by default", async () => {
  const store = new MemoryProvisioningStore();
  const methods: string[] = [];
  const registry = {
    connectors: [{
      ref: "twilio_primary",
      provider: "twilio" as const,
      kinds: ["telephony"] as ["telephony"],
      accountSid: "AC" + "a".repeat(32),
      incomingPhoneNumberSid: "PN" + "b".repeat(32),
      publicBaseUrl: "https://voice.example.com/",
      apiKeyEnv: "TWILIO_API_KEY",
      apiSecretEnv: "TWILIO_API_SECRET",
    }],
  };
  await withServer(
    {
      enabled: true,
      principal: PRINCIPAL,
      store,
      nowMs: () => NOW,
      env: {
        TWILIO_API_KEY: "SK" + "c".repeat(32),
        TWILIO_API_SECRET: "server-secret-value",
      },
      adapterRegistry: registry,
      adapterTransport: async (input) => {
        methods.push(input.method);
        return {
          status: 200,
          body: JSON.stringify({
            voice_url: "https://old.example.com/voice",
            voice_method: "POST",
            voice_application_sid: null,
            trunk_sid: null,
          }),
        };
      },
    },
    async (base) => {
      const envelope = await validProvisioningEnvelope({
        blueprintId: "abp_step9server002",
      });
      const provisionBody = JSON.stringify(envelope);
      const provisioned = await request(base, {
        method: "POST",
        headers: signedHeaders(
          provisionBody,
          "nonce_step9_nomutate01",
          "idem_step9_nomutate",
        ),
        body: provisionBody,
      });
      const provisioningId = (provisioned.body.data as Record<string, unknown>)
        .provisioningId as string;
      const adapterPath = "/v1/provisioning/adapters/prepare";
      const adapterBody = JSON.stringify({
        provisioningId,
        bindings: [{ kind: "telephony", connectorRef: "twilio_primary" }],
      });
      const result = await request(base, {
        method: "POST",
        path: adapterPath,
        headers: signedHeaders(
          adapterBody,
          "nonce_step9_nomutate02",
          "idem_step9_nomutate2",
          adapterPath,
        ),
        body: adapterBody,
      });
      assert.equal(result.status, 503);
      assert.equal(result.body.error, "adapter_not_ready");
      assert.deepEqual(methods, ["GET"]);
    },
  );
});
