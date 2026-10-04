import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runPersistentScannerV2 } from "./scanner-v2-runtime.ts";
import type { SafeHttpResponse } from "./types.ts";

function response(
  url: string,
  body: string,
  contentType = "text/html; charset=utf-8",
  status = 200,
): SafeHttpResponse {
  return {
    status,
    headers: { "content-type": contentType },
    body,
    url: new URL(url),
  };
}

async function stateRoot(): Promise<string> {
  return mkdtemp(join(tmpdir(), "scanner-v2-runtime-"));
}

test("persistent V2 runtime completes a deep-link crawl and returns grounded knowledge", async () => {
  const root = await stateRoot();
  const get = async (url: URL) => {
    if (url.pathname === "/robots.txt") {
      return response(url.toString(), "User-agent: *\nAllow: /", "text/plain");
    }
    if (url.pathname === "/sitemap.xml") {
      return response(url.toString(), "missing", "text/plain", 404);
    }
    if (url.pathname === "/") {
      return response(
        url.toString(),
        '<html><head><title>Acme Gates</title></head><body><a href="/deep">Deep</a></body></html>',
      );
    }
    if (url.pathname === "/deep") {
      return response(
        url.toString(),
        "<html><body><h1>Heritage installation</h1><p>Heritage alley gate installation normally takes six weeks after survey.</p></body></html>",
      );
    }
    return response(url.toString(), "missing", "text/plain", 404);
  };

  const result = await runPersistentScannerV2("https://acme.example/", {
    stateRoot: root,
    releaseSha: "runtime-test",
    batchPages: 1,
    maxBatches: 4,
    timeBudgetMs: 20_000,
    discovery: {
      lookup: async () => ["203.0.113.10"],
      get,
      readerFallback: false,
    },
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.scannerV2?.state, "COMPLETE");
  assert.equal(result.scannerV2?.queued, 0);
  assert.ok(
    result.knowledge?.some(
      (chunk) =>
        chunk.url === "https://acme.example/deep" &&
        /six weeks after survey/i.test(chunk.text),
    ),
  );
  assert.equal(result.facts?.website, "https://acme.example");
});

test("persistent V2 runtime resumes after a bounded batch without refetching terminal pages", async () => {
  const root = await stateRoot();
  const calls = new Map<string, number>();
  const get = async (url: URL) => {
    calls.set(url.toString(), (calls.get(url.toString()) ?? 0) + 1);
    if (url.pathname === "/robots.txt") {
      return response(url.toString(), "User-agent: *\nAllow: /", "text/plain");
    }
    if (url.pathname === "/sitemap.xml") {
      return response(url.toString(), "missing", "text/plain", 404);
    }
    if (url.pathname === "/") {
      return response(
        url.toString(),
        '<html><body><a href="/deep">Deep</a></body></html>',
      );
    }
    if (url.pathname === "/deep") {
      return response(
        url.toString(),
        '<html><body><a href="/third">Third</a>Deep fact</body></html>',
      );
    }
    if (url.pathname === "/third") {
      return response(
        url.toString(),
        "<html><body>Third-page fact survives restart.</body></html>",
      );
    }
    return response(url.toString(), "missing", "text/plain", 404);
  };
  const common = {
    stateRoot: root,
    releaseSha: "resume-test",
    batchPages: 1,
    timeBudgetMs: 20_000,
    discovery: {
      lookup: async () => ["203.0.113.10"],
      get,
      readerFallback: false,
    },
  };

  const first = await runPersistentScannerV2("https://acme.example/", {
    ...common,
    maxBatches: 1,
  });
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.equal(first.scannerV2?.state, "PARTIAL");
  assert.equal(first.scannerV2?.queued, 1);
  assert.ok(first.warnings.includes("scanner_v2_resume_pending"));
  assert.equal(calls.get("https://acme.example/"), 1);

  const resumed = await runPersistentScannerV2("https://acme.example/", {
    ...common,
    maxBatches: 4,
  });
  assert.equal(resumed.ok, true);
  if (!resumed.ok) return;
  assert.equal(resumed.scannerV2?.state, "COMPLETE");
  assert.equal(resumed.scannerV2?.queued, 0);
  assert.equal(calls.get("https://acme.example/"), 1);
  assert.ok(
    resumed.knowledge?.some((chunk) =>
      /Third-page fact survives restart/i.test(chunk.text),
    ),
  );
});
