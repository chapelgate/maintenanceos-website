import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { main, proxyPersistentScan } from "../packages/website/scan/index.ts";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const functionDir = path.resolve(here, "../packages/website/scan");

test("serverless scan rejects non-POST requests", async () => {
  const result = await main({ http: { method: "GET", headers: {} } });
  assert.equal(result.statusCode, 405);
  assert.deepEqual(result.body, {
    ok: false,
    error: "method_not_allowed",
  });
});

test("serverless scan keeps private targets blocked", async () => {
  const result = await main({
    http: { method: "POST", headers: {} },
    url: "https://127.0.0.1/private",
  });
  assert.equal(result.statusCode, 400);
  assert.equal(result.body.ok, false);
});

test("serverless scan exposes CORS preflight without crawling", async () => {
  const result = await main({
    http: {
      method: "OPTIONS",
      headers: { origin: "https://seahorse-app-4oasq.ondigitalocean.app" },
    },
  });
  assert.equal(result.statusCode, 204);
  assert.equal(
    result.headers["Access-Control-Allow-Origin"],
    "https://seahorse-app-4oasq.ondigitalocean.app",
  );
  assert.equal(result.headers["Access-Control-Allow-Methods"], "POST, OPTIONS");
});

test("persistent scan proxy forwards only the validated public URL", async () => {
  const calls: Array<{ input: string; init?: RequestInit }> = [];
  const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ input: String(input), init });
    return new Response(
      JSON.stringify({
        ok: true,
        scannerV2: {
          state: "COMPLETE",
          discovered: 1,
          fetched: 1,
          unresolved: 0,
          knowledgeChunks: 1,
          resumed: false,
          crawlId: "fixture",
        },
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  }) as typeof fetch;

  const result = await proxyPersistentScan(
    "https://example.com/",
    fetcher,
    "https://scanner.example/v1/onboarding/scan",
  );

  assert.equal(result.statusCode, 200);
  assert.equal((result.body as { ok?: unknown }).ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.input, "https://scanner.example/v1/onboarding/scan");
  assert.equal(calls[0]?.init?.method, "POST");
  assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
    url: "https://example.com/",
  });
  assert.ok(calls[0]?.init?.signal);
});

test("deployed Functions artifact is prebuilt-only and loadable", async () => {
  assert.equal(
    fs.existsSync(path.join(functionDir, "package.json")),
    false,
    "package.json would trigger an unsupported remote function build",
  );
  assert.equal(
    fs.existsSync(path.join(functionDir, "build.sh")),
    false,
    "build.sh would trigger a remote function build",
  );
  assert.equal(
    fs.readFileSync(path.join(functionDir, ".include"), "utf8").trim(),
    "bundle.cjs",
  );

  const project = fs.readFileSync(
    path.resolve(here, "../project.yml"),
    "utf8",
  );
  assert.match(project, /main:\s*bundle\.cjs/);

  const deployed = require(path.join(functionDir, "bundle.cjs")) as {
    main: typeof main;
  };
  assert.equal(typeof deployed.main, "function");

  const privateTarget = await deployed.main({
    http: { method: "POST", headers: {} },
    url: "https://127.0.0.1/private",
  });
  assert.equal(privateTarget.statusCode, 400);
  assert.equal(privateTarget.body.ok, false);
});
