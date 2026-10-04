import assert from "node:assert/strict";
import test from "node:test";
import {
  createScanServer,
  resetRateLimitForTests,
  resolveListenHost,
  resolveListenPort,
  DEFAULT_HOST,
  DEFAULT_PORT,
} from "./server.ts";
import type { ScanResult } from "./types.ts";

const FETCH_BLOCKED_TEST_PORTS = new Set([
  1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061, 6000, 6566,
  6665, 6666, 6667, 6668, 6669, 6697, 10080,
]);

function listen(server: ReturnType<typeof createScanServer>): Promise<number> {
  return new Promise((resolve, reject) => {
    const bind = () => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", () => {
        server.removeListener("error", reject);
        const addr = server.address();
        if (!addr || typeof addr === "string") {
          reject(new Error("no port"));
          return;
        }
        if (FETCH_BLOCKED_TEST_PORTS.has(addr.port)) {
          server.close((err) => (err ? reject(err) : bind()));
          return;
        }
        resolve(addr.port);
      });
    };
    bind();
  });
}

async function withServer(
  options: Parameters<typeof createScanServer>[0],
  fn: (base: string) => Promise<void>,
): Promise<void> {
  resetRateLimitForTests();
  const server = createScanServer(options);
  const port = await listen(server);
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
}

test("resolveListenHost stays loopback unless ONBOARDING_SCAN_HOST is set", () => {
  assert.equal(resolveListenHost({}), DEFAULT_HOST);
  assert.equal(resolveListenHost({ ONBOARDING_SCAN_HOST: "0.0.0.0" }), "0.0.0.0");
  assert.equal(resolveListenHost({ ONBOARDING_SCAN_HOST: "  " }), DEFAULT_HOST);
});

test("resolveListenPort prefers ONBOARDING_SCAN_PORT then PORT", () => {
  assert.equal(resolveListenPort({}), DEFAULT_PORT);
  assert.equal(resolveListenPort({ ONBOARDING_SCAN_PORT: "8788" }), 8788);
  assert.equal(resolveListenPort({ PORT: "10000" }), 10000);
  assert.equal(
    resolveListenPort({ ONBOARDING_SCAN_PORT: "8788", PORT: "10000" }),
    8788,
  );
  assert.equal(resolveListenPort({ PORT: "not-a-port" }), DEFAULT_PORT);
  assert.equal(resolveListenPort({ ONBOARDING_SCAN_PORT: "-1" }), DEFAULT_PORT);
});

test("GET /health reports ingest and Scanner V2 flags with no sandbox call", async () => {
  await withServer(
    { ingestEnabled: false, scannerV2Enabled: true },
    async (base) => {
      const res = await fetch(`${base}/health`);
      const json = await res.json();
      assert.equal(res.status, 200);
      assert.equal(json.ok, true);
      assert.equal(json.ingestEnabled, false);
      assert.equal(json.scannerV2Enabled, true);
      assert.equal(json.sandboxCall, false);
      assert.equal(json.scanPath, "/v1/onboarding/scan");
    },
  );
});

test("POST scan is disabled when ONBOARDING_WEB_INGEST is off", async () => {
  await withServer({ ingestEnabled: false }, async (base) => {
    const res = await fetch(`${base}/v1/onboarding/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
      body: JSON.stringify({ url: "https://example.com/" }),
    });
    const json = await res.json();
    assert.equal(res.status, 503);
    assert.equal(json.ok, false);
    assert.equal(json.error, "scan_disabled");
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:3000");
  });
});

test("POST scan denies SSRF targets and does not invent a draft", async () => {
  let called = false;
  await withServer(
    {
      ingestEnabled: true,
      scan: async () => {
        called = true;
        return {
          ok: false,
          error: "non_public_host",
          message: "This URL is not a public website and will not be fetched.",
          warnings: ["ssrf_denied"],
        };
      },
    },
    async (base) => {
      const res = await fetch(`${base}/v1/onboarding/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://127.0.0.1/" }),
      });
      // Handler still uses injected scan; also cover built-in deny via a second server.
      assert.ok(res.status === 400 || res.status === 422);
      const json = await res.json();
      assert.equal(json.ok, false);
      assert.equal(json.draft, undefined);
    },
  );
  assert.equal(called, true);

  await withServer({ ingestEnabled: true }, async (base) => {
    const res = await fetch(`${base}/v1/onboarding/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://localhost/admin" }),
    });
    const json = await res.json();
    assert.equal(res.status, 400);
    assert.equal(json.ok, false);
    assert.equal(json.error, "non_public_host");
    assert.equal(json.draft, undefined);
  });
});

test("POST scan happy path returns draft shape /create already maps", async () => {
  const draftResult: ScanResult = {
    ok: true,
    untrusted: true,
    draft: {
      businessName: "Acme Plumbing",
      hours: "Mo-Fr 08:00-17:00",
      services: "Boiler repair",
      faqs: "Q: Do you cover London?\nA: Yes, within the M25.",
    },
    warnings: ["greeting_not_found", "untrusted_crawl_text"],
    sources: [{ url: "https://acme.example/", status: 200, bytes: 120 }],
    facts: {
      website: "https://acme.example/",
      businessName: "Acme Plumbing",
      contact: { phones: ["+44 151 555 0100"], emails: ["hello@acme.example"] },
      services: ["Boiler repair"],
      hours: "Mo-Fr 08:00-17:00",
      faqs: [{ question: "Do you cover London?", answer: "Yes, within the M25." }],
    },
    factMeta: {
      website: { source: "fetched_url", confidence: "high" },
      businessName: { source: "jsonld", confidence: "high" },
      contact: { source: "jsonld", confidence: "high" },
    },
  };

  await withServer(
    {
      ingestEnabled: true,
      scan: async (url) => {
        assert.equal(url, "https://acme.example/");
        return draftResult;
      },
    },
    async (base) => {
      const res = await fetch(`${base}/v1/onboarding/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ url: "https://acme.example/" }),
      });
      const json = await res.json();
      assert.equal(res.status, 200);
      assert.equal(json.ok, true);
      assert.equal(json.untrusted, true);
      assert.equal(json.draft.businessName, "Acme Plumbing");
      assert.equal(json.draft.hours, "Mo-Fr 08:00-17:00");
      assert.equal(json.draft.services, "Boiler repair");
      assert.match(json.draft.faqs, /Do you cover London/);
      assert.equal(json.draft.greeting, undefined);
      assert.equal(json.facts.website, "https://acme.example/");
      assert.deepEqual(json.facts.contact, {
        phones: ["+44 151 555 0100"],
        emails: ["hello@acme.example"],
      });
      assert.equal(json.factMeta.contact.source, "jsonld");
      assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:3000");
    },
  );
});

test("OPTIONS preflight is empty 204", async () => {
  await withServer({ ingestEnabled: true }, async (base) => {
    const res = await fetch(`${base}/v1/onboarding/scan`, {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:3000" },
    });
    assert.equal(res.status, 204);
    assert.equal(
      res.headers.get("access-control-allow-methods")?.includes("POST"),
      true,
    );
  });
});

test("invalid JSON and missing url fail closed", async () => {
  await withServer({ ingestEnabled: true }, async (base) => {
    const bad = await fetch(`${base}/v1/onboarding/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(bad.status, 400);
    const missing = await fetch(`${base}/v1/onboarding/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ href: "https://example.com/" }),
    });
    assert.equal(missing.status, 400);
  });
});
