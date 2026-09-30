import assert from "node:assert/strict";
import test from "node:test";
import { main } from "../packages/website/scan/index.ts";

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
