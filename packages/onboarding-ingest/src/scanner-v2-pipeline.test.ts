import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  FileScannerV2JobStore,
} from "./scanner-v2-worker.ts";
import {
  runScannerV2Pipeline,
} from "./scanner-v2-pipeline.ts";
import type {
  BinaryHttpGetFn,
  HttpGetFn,
  SafeBinaryHttpResponse,
  SafeHttpResponse,
} from "./types.ts";

function response(
  url: string,
  body: string,
  type = "text/html; charset=utf-8",
  status = 200,
): SafeHttpResponse {
  return {
    status,
    headers: { "content-type": type },
    body,
    url: new URL(url),
  };
}

function binary(
  url: string,
  body: string,
  type = "text/plain; charset=utf-8",
  status = 200,
): SafeBinaryHttpResponse {
  return {
    status,
    headers: { "content-type": type },
    body: new TextEncoder().encode(body),
    url: new URL(url),
  };
}

async function tempStore(): Promise<FileScannerV2JobStore> {
  const root = await mkdtemp(join(tmpdir(), "scanner-v2-stage12-"));
  return new FileScannerV2JobStore(root);
}

test("Stage 12 pipeline composes sitemap discovery, rendering, documents, corpus and grounded answers", async () => {
  const origin = "https://acme.example";
  const htmlMap: Record<string, SafeHttpResponse> = {
    "https://acme.example/robots.txt": response(
      "https://acme.example/robots.txt",
      "Sitemap: https://acme.example/sitemap.xml",
      "text/plain",
    ),
    "https://acme.example/sitemap.xml": response(
      "https://acme.example/sitemap.xml",
      [
        "<urlset>",
        "<url><loc>https://acme.example/</loc></url>",
        "<url><loc>https://acme.example/services</loc></url>",
        "<url><loc>https://acme.example/app</loc></url>",
        "<url><loc>https://acme.example/facts.txt</loc></url>",
        "</urlset>",
      ].join(""),
      "application/xml",
    ),
    "https://acme.example/": response(
      "https://acme.example/",
      '<html><body><h1>Acme</h1><a href="/services">Services</a><a href="/app">App</a><a href="/facts.txt">Facts</a></body></html>',
    ),
    "https://acme.example/services": response(
      "https://acme.example/services",
      "<html><body><h1>Installation</h1><p>Standard installation normally takes five working days from approval.</p></body></html>",
    ),
    "https://acme.example/app": response(
      "https://acme.example/app",
      '<html><body><div id="root"></div><script src="/app.js"></script></body></html>',
    ),
    "https://acme.example/rendered-only": response(
      "https://acme.example/rendered-only",
      "<html><body><h1>Warranty</h1><p>Installed equipment carries a two year workmanship warranty.</p></body></html>",
    ),
    "https://acme.example/facts.txt": response(
      "https://acme.example/facts.txt",
      "Document code BLUE-4821 applies to the public maintenance guide.",
      "text/plain",
    ),
  };

  const get: HttpGetFn = async (url) =>
    htmlMap[url.toString()] ??
    response(url.toString(), "missing", "text/plain", 404);
  const documentGet: BinaryHttpGetFn = async (url) =>
    binary(
      url.toString(),
      "Document code BLUE-4821 applies to the public maintenance guide.",
    );

  const result = await runScannerV2Pipeline({
    store: await tempStore(),
    origin,
    releaseSha: "stage12-test-sha",
    crawlId: "stage12-full",
    discovery: {
      lookup: async () => ["203.0.113.10"],
      get,
    },
    processor: {
      lookup: async () => ["203.0.113.10"],
      get,
      documentGet,
      renderBackend: async () => ({
        finalUrl: "https://acme.example/app",
        html: [
          "<html><body>",
          "<h1>App content</h1>",
          "<p>The customer portal is available for maintenance updates.</p>",
          '<a href="/rendered-only">Warranty information</a>',
          "</body></html>",
        ].join(""),
      }),
    },
  });

  assert.equal(result.manifest.state, "COMPLETE");
  assert.equal(result.manifest.queued, 0);
  assert.equal(result.manifest.unresolved, 0);
  assert.ok(result.pageCount >= 5);
  assert.ok(result.chunkCount >= 5);
  assert.ok(result.indexStats.documentCount >= 5);

  const leadTime = await result.answer("How long does standard installation take?");
  assert.equal(leadTime.supportStatus, "supported");
  assert.match(leadTime.text, /five working days/i);
  assert.ok(leadTime.sourceUrls.some((url) => url.endsWith("/services")));

  const warranty = await result.answer("What workmanship warranty do installations have?");
  assert.equal(warranty.supportStatus, "supported");
  assert.match(warranty.text, /two year workmanship warranty/i);
  assert.ok(
    result.manifest.urls.some(
      (row) =>
        row.url === "https://acme.example/rendered-only" &&
        row.discoveryReason === "rendered_link" &&
        row.status === "fetched",
    ),
  );

  const document = await result.answer("What is the public maintenance guide document code?");
  assert.equal(document.supportStatus, "supported");
  assert.match(document.text, /BLUE-4821/);
  assert.ok(document.sourceUrls.some((url) => url.endsWith("/facts.txt")));

  const unknown = await result.answer("What colour is the managing director's car?");
  assert.equal(unknown.supportStatus, "not_found");
});

test("Stage 12 pipeline can recover a 403 business page through the existing reader fallback", async () => {
  const origin = "https://edge.example";
  const direct: HttpGetFn = async (url) => {
    if (url.pathname === "/robots.txt") {
      return response(
        url.toString(),
        "User-agent: *\nAllow: /\nSitemap: https://edge.example/sitemap.xml",
        "text/plain",
      );
    }
    if (url.pathname === "/sitemap.xml") {
      return response(
        url.toString(),
        "<urlset><url><loc>https://edge.example/</loc></url></urlset>",
        "application/xml",
      );
    }
    return response(url.toString(), "edge rejected", "text/html", 403);
  };

  const readerGet: HttpGetFn = async (url) =>
    response(
      url.toString(),
      "<html><body><h1>Edge Business</h1><p>Replacement keys can be ordered from the website key-order page.</p></body></html>",
    );

  const result = await runScannerV2Pipeline({
    store: await tempStore(),
    origin,
    releaseSha: "stage12-reader-sha",
    crawlId: "stage12-reader",
    discovery: {
      lookup: async () => ["203.0.113.10"],
      get: direct,
    },
    processor: {
      lookup: async () => ["203.0.113.10"],
      get: direct,
      readerLookup: async () => ["203.0.113.20"],
      readerGet,
    },
  });

  assert.equal(result.manifest.state, "COMPLETE");
  const answer = await result.answer("How can I order replacement keys?");
  assert.equal(answer.supportStatus, "supported");
  assert.match(answer.text, /website key-order page/i);
});

test("Stage 12 pipeline never upgrades incomplete discovery to COMPLETE", async () => {
  const origin = "https://partial.example";
  const get: HttpGetFn = async (url) => {
    if (url.pathname === "/robots.txt") {
      return response(
        url.toString(),
        "Sitemap: https://partial.example/broken.xml",
        "text/plain",
      );
    }
    if (url.pathname === "/broken.xml") {
      throw new Error("synthetic sitemap outage");
    }
    return response(
      url.toString(),
      "<html><body><p>Useful public content still exists.</p></body></html>",
    );
  };

  const result = await runScannerV2Pipeline({
    store: await tempStore(),
    origin,
    releaseSha: "stage12-partial-sha",
    crawlId: "stage12-partial",
    discovery: {
      lookup: async () => ["203.0.113.10"],
      get,
    },
    processor: {
      lookup: async () => ["203.0.113.10"],
      get,
      readerFallback: false,
    },
  });

  assert.equal(result.discovery.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
});
