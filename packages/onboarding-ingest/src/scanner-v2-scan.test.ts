import assert from "node:assert/strict";
import test from "node:test";
import { runScannerV2Scan } from "./scanner-v2-scan.ts";
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

test("V2 scan contract learns a deep-page fact beyond the home page", async () => {
  const origin = "https://acme.example";
  const result = await runScannerV2Scan(origin + "/", {
    enabled: true,
    scannerV2Enabled: true,
    lookup: async () => ["203.0.113.10"],
    get: async (url) => {
      if (url.pathname === "/robots.txt") {
        return response(
          url.toString(),
          "User-agent: *\nAllow: /",
          "text/plain",
        );
      }
      if (url.pathname === "/sitemap.xml") {
        return response(url.toString(), "missing", "text/plain", 404);
      }
      if (url.pathname === "/") {
        return response(
          url.toString(),
          '<html><head><title>Acme Gates</title></head><body><h1>Acme Gates</h1><a href="/deep-service">Deep service</a></body></html>',
        );
      }
      if (url.pathname === "/deep-service") {
        return response(
          url.toString(),
          "<html><body><h1>Special installation service</h1><p>Heritage alley gates normally require a six week installation lead time after survey.</p></body></html>",
        );
      }
      return response(url.toString(), "missing", "text/plain", 404);
    },
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.scannerV2?.state, "COMPLETE");
  assert.equal(result.scannerV2?.fetched, 2);
  assert.ok(
    result.knowledge?.some(
      (chunk) =>
        chunk.url === origin + "/deep-service" &&
        /six week installation lead time/i.test(chunk.text),
    ),
  );
  assert.equal(result.facts?.website, origin + "/");
  assert.match(result.draft.businessName ?? "", /Acme Gates/i);
});

test("V2 reuses the bounded reader for a thin JS app shell", async () => {
  const result = await runScannerV2Scan("https://app.example/", {
    enabled: true,
    scannerV2Enabled: true,
    readerFallback: true,
    lookup: async () => ["203.0.113.10"],
    get: async (url) => {
      if (url.pathname === "/robots.txt") {
        return response(url.toString(), "User-agent: *\nAllow: /", "text/plain");
      }
      if (url.pathname === "/sitemap.xml") {
        return response(url.toString(), "missing", "text/plain", 404);
      }
      return response(
        url.toString(),
        '<html><body><div id="root"></div><script src="/app.js"></script></body></html>',
      );
    },
    readerLookup: async () => ["203.0.113.20"],
    readerGet: async (url) =>
      response(
        url.toString(),
        "<html><body><h1>Rendered service detail</h1><p>Heat-pump installations normally take four weeks after survey.</p></body></html>",
      ),
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.scannerV2?.state, "COMPLETE");
  assert.ok(result.warnings.includes("reader_fallback_used"));
  assert.ok(
    result.knowledge?.some((chunk) =>
      /four weeks after survey/i.test(chunk.text),
    ),
  );
});

test("V2 marks a thin JS page PARTIAL when its existing reader fallback fails", async () => {
  const result = await runScannerV2Scan("https://app.example/", {
    enabled: true,
    scannerV2Enabled: true,
    readerFallback: true,
    lookup: async () => ["203.0.113.10"],
    get: async (url) => {
      if (url.pathname === "/robots.txt") {
        return response(url.toString(), "User-agent: *\nAllow: /", "text/plain");
      }
      if (url.pathname === "/sitemap.xml") {
        return response(url.toString(), "missing", "text/plain", 404);
      }
      return response(
        url.toString(),
        '<html><body><div id="root"></div><script src="/app.js"></script></body></html>',
      );
    },
    readerLookup: async () => ["203.0.113.20"],
    readerGet: async () => {
      throw new Error("synthetic reader outage");
    },
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, "fetch_failed");
  assert.ok(result.warnings.includes("html_page_consumer_failed"));
});

test("V2 scan contract reports PARTIAL instead of pretending limits are complete", async () => {
  const result = await runScannerV2Scan("https://acme.example/", {
    enabled: true,
    scannerV2Enabled: true,
    maxHtmlPages: 1,
    lookup: async () => ["203.0.113.10"],
    get: async (url) => {
      if (url.pathname === "/robots.txt") {
        return response(url.toString(), "User-agent: *\nAllow: /", "text/plain");
      }
      if (url.pathname === "/sitemap.xml") {
        return response(url.toString(), "missing", "text/plain", 404);
      }
      if (url.pathname === "/") {
        return response(
          url.toString(),
          '<html><body><a href="/two">Two</a></body></html>',
        );
      }
      return response(url.toString(), "<html><body>Two</body></html>");
    },
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.scannerV2?.state, "PARTIAL");
  assert.ok(result.warnings.includes("html_page_limit"));
  assert.ok(result.warnings.includes("scanner_v2_partial"));
});

test("V2 scan contract is feature-gated and leaves V1 rollback available", async () => {
  const result = await runScannerV2Scan("https://acme.example/", {
    enabled: true,
    scannerV2Enabled: false,
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, "scan_disabled");
});
