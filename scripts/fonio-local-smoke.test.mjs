import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  COMPANIONS,
  evaluateHealth,
  parseSmokeArgs,
  runSmoke,
  selectCompanions,
} from "./fonio-local-smoke.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("companion catalog matches documented loopback ports", () => {
  assert.deepEqual(
    COMPANIONS.map((item) => [item.id, item.url]),
    [
      ["onboarding-scan", "http://127.0.0.1:8788/health"],
      ["calendar-adapters", "http://127.0.0.1:8789/health"],
      ["sandbox-test-call", "http://127.0.0.1:8790/health"],
      ["customer-dashboard", "http://127.0.0.1:8791/health"],
      ["form-stub", "http://127.0.0.1:8787/health"],
    ],
  );
});

test("scan + calendar + sandbox are required; dashboard defaults on; form-stub opt-in", () => {
  const selected = selectCompanions(parseSmokeArgs([]));
  assert.deepEqual(
    selected.map((item) => [item.id, item.required]),
    [
      ["onboarding-scan", true],
      ["calendar-adapters", true],
      ["sandbox-test-call", true],
      ["customer-dashboard", true],
    ],
  );
  const core = selectCompanions(parseSmokeArgs(["--no-dashboard"]));
  assert.deepEqual(
    core.map((item) => item.id),
    ["onboarding-scan", "calendar-adapters", "sandbox-test-call"],
  );
  const withForm = selectCompanions(parseSmokeArgs(["--form-stub"]));
  assert.equal(
    withForm.some((item) => item.id === "form-stub" && item.required),
    true,
  );
});

test("evaluateHealth fails when flags are off even if HTTP 200", () => {
  const companion = COMPANIONS.find((item) => item.id === "onboarding-scan");
  const off = evaluateHealth({
    companion,
    status: 200,
    json: {
      ok: true,
      service: "maintenanceos-onboarding-scan",
      ingestEnabled: false,
      sandboxCall: false,
    },
  });
  assert.equal(off.result, "FAIL");
  assert.match(off.detail, /ingestEnabled=false/);

  const on = evaluateHealth({
    companion,
    status: 200,
    json: {
      ok: true,
      service: "maintenanceos-onboarding-scan",
      ingestEnabled: true,
      sandboxCall: false,
    },
  });
  assert.equal(on.result, "PASS");
});

test("evaluateHealth never treats a liveCall true sandbox as PASS", () => {
  const companion = COMPANIONS.find((item) => item.id === "sandbox-test-call");
  const live = evaluateHealth({
    companion,
    status: 200,
    json: {
      ok: true,
      service: "maintenanceos-sandbox-test-call",
      sandboxEnabled: true,
      telephony: false,
      liveCall: true,
    },
  });
  assert.equal(live.result, "FAIL");
});

test("optional companion connection errors are SKIP, required are FAIL", () => {
  const dash = COMPANIONS.find((item) => item.id === "customer-dashboard");
  assert.equal(
    evaluateHealth({ companion: { ...dash, required: false }, error: "ECONNREFUSED" })
      .result,
    "SKIP",
  );
  assert.equal(
    evaluateHealth({ companion: { ...dash, required: true }, error: "ECONNREFUSED" })
      .result,
    "FAIL",
  );
});

test("runSmoke hits /health on a local mock and prints PASS", async () => {
  const server = http.createServer((req, res) => {
    assert.equal(req.url, "/health");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        service: "maintenanceos-calendar-adapters",
        adaptersEnabled: true,
        telephony: false,
      }),
    );
  });
  const port = await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
  const mockUrl = `http://127.0.0.1:${port}/health`;
  try {
    const { ok, rows } = await runSmoke(
      {
        dashboard: false,
        formStub: false,
        only: "calendar-adapters",
        timeoutMs: 1500,
      },
      async (url) => {
        assert.equal(url, "http://127.0.0.1:8789/health");
        return fetchHealthVia(mockUrl);
      },
    );
    assert.equal(ok, true);
    assert.equal(rows[0].result, "PASS");
  } finally {
    await new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
});

async function fetchHealthVia(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  return { status: res.status, json: await res.json() };
}

test(".env.example keeps companion flags off for DigitalOcean static", () => {
  const text = fs.readFileSync(path.join(ROOT, ".env.example"), "utf8");
  assert.match(text, /^NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=\s*$/m);
  assert.match(text, /^NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED=false$/m);
  assert.match(text, /^NEXT_PUBLIC_CALENDAR_ENDPOINT=\s*$/m);
  assert.match(text, /^NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED=false$/m);
  assert.match(text, /^NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT=\s*$/m);
  assert.match(text, /^NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED=false$/m);
  assert.match(text, /^NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT=\s*$/m);
});

test(".env.example.fonio-local keeps local companions documented while public scan stays same-origin", () => {
  const text = fs.readFileSync(path.join(ROOT, ".env.example.fonio-local"), "utf8");
  const site = fs.readFileSync(path.join(ROOT, "src/config/site.ts"), "utf8");
  assert.match(text, /^NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=/m);
  assert.match(site, /onboardingScanEndpoint:\s*"\/api\/onboarding-scan"/);
  assert.doesNotMatch(site, /process\.env\.NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT/);
  const expected = [
    "NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED",
    "NEXT_PUBLIC_CALENDAR_ENDPOINT",
    "NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED",
    "NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT",
    "NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED",
    "NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT",
  ];
  for (const key of expected) {
    assert.match(text, new RegExp(`^${key}=`, "m"));
    assert.match(site, new RegExp(`process\\.env\\.${key}`));
  }
  assert.match(
    text,
    /^NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=http:\/\/127\.0\.0\.1:8788\/v1\/onboarding\/scan$/m,
  );
  assert.match(
    text,
    /^NEXT_PUBLIC_CALENDAR_ENDPOINT=http:\/\/127\.0\.0\.1:8789\/v1\/calendar$/m,
  );
  assert.match(
    text,
    /^NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT=http:\/\/127\.0\.0\.1:8790\/v1\/sandbox$/m,
  );
  assert.match(
    text,
    /^NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT=http:\/\/127\.0\.0\.1:8791\/v1\/dashboard$/m,
  );
  assert.match(text, /^NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED=true$/m);
  assert.match(text, /^NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED=true$/m);
  assert.match(text, /^NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED=true$/m);
  assert.match(text, /^NEXT_PUBLIC_PUBLIC_LAUNCH=false$/m);
});

test("gitignore tracks the fonio-local env example", () => {
  const ignore = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");
  assert.match(ignore, /^!\.env\.example\.fonio-local$/m);
});

test("compose file publishes loopback only and keeps dashboard optional", () => {
  const text = fs.readFileSync(
    path.join(ROOT, "docker-compose.fonio-local.yml"),
    "utf8",
  );
  assert.match(text, /127\.0\.0\.1:8788:8788/);
  assert.match(text, /127\.0\.0\.1:8789:8789/);
  assert.match(text, /127\.0\.0\.1:8790:8790/);
  assert.match(text, /127\.0\.0\.1:8791:8791/);
  assert.match(text, /profiles:\s*\[["']dashboard["']\]/);
  assert.match(text, /ONBOARDING_WEB_INGEST: "true"/);
  assert.match(text, /CALENDAR_ADAPTERS_ENABLED: "true"/);
  assert.match(text, /SANDBOX_TEST_CALL_ENABLED: "true"/);
  assert.match(text, /CUSTOMER_DASHBOARD_ENABLED: "true"/);
  assert.match(text, /Not a DigitalOcean App Platform spec/);
});

test("next.config static export is unchanged", () => {
  const text = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  assert.match(text, /output:\s*["']export["']/);
});
