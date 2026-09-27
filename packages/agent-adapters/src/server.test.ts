import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import http from "node:http";
import test from "node:test";
import {
  MemoryConnectorRegistry,
  MemoryTtncSecretRegistry,
} from "./registry.ts";
import { createAgentAdapterServer } from "./server.ts";

const SECRET = "0123456789abcdef0123456789abcdef";

function registry() {
  return new MemoryConnectorRegistry([
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
  ]);
}

async function withServer(
  run: (base: string) => Promise<void>,
  enabled = true,
) {
  const server = createAgentAdapterServer({
    enabled,
    registry: registry(),
    ttncSecrets: new MemoryTtncSecretRegistry({
      "phone-main": SECRET,
    }),
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("server address missing");
  }
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
) {
  const url = new URL(input.path ?? "/health", base);
  return new Promise<{
    status: number;
    headers: http.IncomingHttpHeaders;
    body: Record<string, unknown>;
  }>((resolve, reject) => {
    const req = http.request(
      url,
      { method: input.method ?? "GET", headers: input.headers },
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

test("health exposes only bounded adapter state and no CORS", async () => {
  await withServer(async (base) => {
    const res = await request(base, {});
    assert.equal(res.status, 200);
    assert.equal(res.body.webhookEnabled, true);
    assert.equal(res.body.browserAccess, false);
    assert.equal(res.body.providerMutation, false);
    assert.equal(res.body.telephonyActivation, false);
    assert.equal(
      res.body.ttncWebhookVerification,
      "hmac-sha256-raw-body",
    );
    assert.equal(res.headers["access-control-allow-origin"], undefined);
    assert.doesNotMatch(JSON.stringify(res.body), /02922716489|0123456789abcdef/);
  });
});

test("valid TTNC webhook is accepted without external side effects", async () => {
  await withServer(async (base) => {
    const body = JSON.stringify({
      event: {
        anumber: "01245012345",
        bnumber: "02031511000",
        ref: "!5442B5AD54E14",
        event_type: "incoming_call",
      },
    });
    const signature = createHmac("sha256", SECRET)
      .update(body)
      .digest("hex");
    const res = await request(base, {
      method: "POST",
      path: "/v1/telephony/ttnc/phone-main/webhook",
      headers: {
        "Content-Type": "application/json",
        "Webhook-Signature": signature,
      },
      body,
    });
    assert.equal(res.status, 202);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.accepted, true);
    assert.equal(res.body.sideEffects, false);
    const event = res.body.event as Record<string, unknown>;
    assert.equal(event.eventType, "incoming_call");
    assert.equal(event.ref, "!5442B5AD54E14");
    assert.equal("caller" in event, false);
    assert.equal("calledNumber" in event, false);
  });
});

test("tampered signature, browser origin and disabled flag fail closed", async () => {
  await withServer(async (base) => {
    const body = JSON.stringify({
      event: { ref: "!1", event_type: "incoming_call" },
    });
    const bad = await request(base, {
      method: "POST",
      path: "/v1/telephony/ttnc/phone-main/webhook",
      headers: {
        "Content-Type": "application/json",
        "Webhook-Signature": "0".repeat(64),
      },
      body,
    });
    assert.equal(bad.status, 401);
    assert.equal(bad.body.error, "invalid_signature");

    const browser = await request(base, {
      method: "POST",
      path: "/v1/telephony/ttnc/phone-main/webhook",
      headers: {
        Origin: "https://example.com",
        "Content-Type": "application/json",
      },
      body,
    });
    assert.equal(browser.status, 403);
    assert.equal(browser.body.error, "browser_origin_forbidden");
  });

  await withServer(
    async (base) => {
      const res = await request(base, {
        method: "POST",
        path: "/v1/telephony/ttnc/phone-main/webhook",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      assert.equal(res.status, 503);
      assert.equal(res.body.error, "adapter_webhooks_disabled");
    },
    false,
  );
});
