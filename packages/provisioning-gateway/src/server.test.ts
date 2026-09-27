import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";
import {
  MemoryConnectorRegistry,
  MemoryTtncSecretRegistry,
} from "../../agent-adapters/src/registry.ts";
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
  pathname = "/v1/provisioning/requests",
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
      pathname,
      body,
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
      assert.equal(res.body.telephony, false);
      assert.equal(res.body.productDatabaseAccess, false);
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


test("signed adapter preparation advances provisioning to ready without carrier mutation", async () => {
  const store = new MemoryProvisioningStore();
  const connectorRegistry = new MemoryConnectorRegistry([
    {
      ref: "phone-main",
      kind: "telephony",
      provider: "ttnc",
      configured: true,
      existingNumber: "02922716489",
      callApplicationId: 999,
      webhookUrl:
        "https://agent.example/v1/telephony/ttnc/phone-main/webhook",
    },
    {
      ref: "calendar-main",
      kind: "calendar",
      provider: "google-calendar-v2",
      configured: true,
    },
  ]);
  const ttncSecrets = new MemoryTtncSecretRegistry({
    "phone-main": "0123456789abcdef0123456789abcdef",
  });

  await withServer(
    {
      enabled: true,
      principal: PRINCIPAL,
      store,
      connectorRegistry,
      ttncSecrets,
      nowMs: () => NOW,
      now: () => new Date("2026-09-27T19:45:00.000Z"),
    },
    async (base) => {
      const envelope = await validProvisioningEnvelope();
      const provisionBody = JSON.stringify(envelope);
      const provisioned = await request(base, {
        method: "POST",
        headers: signedHeaders(
          provisionBody,
          "nonce_step9_provision1",
          "idem_step9_provision1",
        ),
        body: provisionBody,
      });
      assert.equal(provisioned.status, 201);
      const provisioningId = (
        provisioned.body.data as Record<string, unknown>
      ).provisioningId;
      assert.equal(typeof provisioningId, "string");

      const path = "/v1/provisioning/adapters/prepare";
      const adapterBody = JSON.stringify({
        provisioningId,
        connectorRefs: ["phone-main", "calendar-main"],
      });
      const prepared = await request(base, {
        method: "POST",
        path,
        headers: signedHeaders(
          adapterBody,
          "nonce_step9_prepare001",
          "idem_step9_prepare1",
          path,
        ),
        body: adapterBody,
      });
      assert.equal(prepared.status, 201);
      const data = prepared.body.data as Record<string, unknown>;
      assert.equal(data.status, "ready");
      assert.equal(data.blueprintStage, "ready");
      assert.equal(data.activationRequired, true);
      assert.equal(data.replayed, false);
      assert.doesNotMatch(
        JSON.stringify(data),
        /02922716489|SetApplication|0123456789abcdef/,
      );

      const replay = await request(base, {
        method: "POST",
        path,
        headers: signedHeaders(
          adapterBody,
          "nonce_step9_prepare002",
          "idem_step9_prepare1",
          path,
        ),
        body: adapterBody,
      });
      assert.equal(replay.status, 200);
      assert.equal(
        (replay.body.data as Record<string, unknown>).replayed,
        true,
      );
    },
  );
});
