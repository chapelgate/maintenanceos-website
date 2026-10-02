import assert from "node:assert/strict";
import test from "node:test";
import {
  discoverHtmlLinks,
  discoverScannerV2Frontier,
  parseRobotsSitemaps,
  parseSitemapXml,
} from "./scanner-v2-discovery.ts";
import type { HttpGetFn, LookupFn, SafeHttpResponse } from "./types.ts";

function response(
  url: string,
  body: string,
  contentType = "application/xml",
  status = 200,
): SafeHttpResponse {
  return {
    status,
    headers: { "content-type": contentType },
    body,
    url: new URL(url),
  };
}

function fixtures(map: Record<string, SafeHttpResponse>): {
  lookup: LookupFn;
  get: HttpGetFn;
} {
  return {
    lookup: async () => ["203.0.113.10"],
    get: async (url) =>
      map[url.toString()] ??
      response(url.toString(), "missing", "text/plain", 404),
  };
}

function urlset(urls: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => "<url><loc>" + url.replaceAll("&", "&amp;") + "</loc></url>"),
    "</urlset>",
  ].join("");
}

function sitemapIndex(urls: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => "<sitemap><loc>" + url + "</loc></sitemap>"),
    "</sitemapindex>",
  ].join("");
}

test("parseSitemapXml parses urlsets, indexes, CDATA, lastmod and entities", () => {
  const set = parseSitemapXml(
    '<urlset><url><loc>https://acme.example/a?x=1&amp;y=2</loc><lastmod>2026-10-01</lastmod></url>' +
      '<url><loc><![CDATA[https://acme.example/deep]]></loc></url></urlset>',
  );
  assert.equal(set.kind, "urlset");
  assert.deepEqual(set.entries, [
    { loc: "https://acme.example/a?x=1&y=2", lastmod: "2026-10-01" },
    { loc: "https://acme.example/deep" },
  ]);

  const index = parseSitemapXml(
    '<sitemapindex><sitemap><loc>https://acme.example/a.xml</loc></sitemap>' +
      '<sitemap><loc>https://acme.example/b.xml</loc></sitemap></sitemapindex>',
  );
  assert.equal(index.kind, "sitemapindex");
  assert.deepEqual(index.entries.map((entry) => entry.loc), [
    "https://acme.example/a.xml",
    "https://acme.example/b.xml",
  ]);

  assert.deepEqual(parseSitemapXml("<html>not a sitemap</html>"), {
    kind: "unknown",
    entries: [],
  });
});

test("parseRobotsSitemaps is case-insensitive, deduplicates and stays same-origin HTTPS", () => {
  const origin = new URL("https://acme.example/");
  assert.deepEqual(
    parseRobotsSitemaps(
      [
        "User-agent: *",
        "Sitemap: https://acme.example/sitemap.xml",
        "sItEmAp: /sitemap.xml # duplicate",
        "SITEMAP: https://acme.example/extra.xml",
        "Sitemap: https://other.example/cross-origin.xml",
        "Sitemap: http://acme.example/insecure.xml",
      ].join("\n"),
      origin,
    ),
    [
      "https://acme.example/sitemap.xml",
      "https://acme.example/extra.xml",
    ],
  );
});

test("discoverScannerV2Frontier recursively accounts for more than 100 sitemap pages", async () => {
  const first = Array.from(
    { length: 60 },
    (_, i) => "https://acme.example/page-" + String(i + 1).padStart(3, "0"),
  );
  const second = Array.from(
    { length: 60 },
    (_, i) => "https://acme.example/page-" + String(i + 61).padStart(3, "0"),
  );

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "User-agent: *\nAllow: /\nSitemap: https://acme.example/sitemap-index.xml",
        "text/plain",
      ),
      "https://acme.example/sitemap-index.xml": response(
        "https://acme.example/sitemap-index.xml",
        sitemapIndex([
          "https://acme.example/pages-a.xml",
          "https://acme.example/pages-b.xml",
        ]),
      ),
      "https://acme.example/pages-a.xml": response(
        "https://acme.example/pages-a.xml",
        urlset(first),
      ),
      "https://acme.example/pages-b.xml": response(
        "https://acme.example/pages-b.xml",
        urlset(second),
      ),
    }),
  });

  assert.equal(result.incomplete, false);
  assert.equal(result.limitReached, false);
  assert.equal(result.manifest.state, "DISCOVERING");
  assert.equal(result.sitemapDocuments, 3);
  assert.equal(result.sitemapUrlsDiscovered, 120);
  assert.equal(result.manifest.discovered, 121);
  assert.equal(result.manifest.queued, 121);
  assert.equal(result.manifest.unresolved, 0);
  assert.ok(
    result.manifest.urls.some((row) => row.url === "https://acme.example/page-120"),
  );
  assert.ok(
    result.manifest.urls.some(
      (row) =>
        row.url === "https://acme.example/page-120" &&
        row.discoveryReason === "sitemap",
    ),
  );
});

test("sitemap discovery rejects private and cross-origin URLs before frontier admission", async () => {
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "Sitemap: https://acme.example/sitemap.xml",
        "text/plain",
      ),
      "https://acme.example/sitemap.xml": response(
        "https://acme.example/sitemap.xml",
        urlset([
          "https://acme.example/public",
          "https://127.0.0.1/private",
          "https://other.example/cross-origin",
          "http://acme.example/insecure",
        ]),
      ),
    }),
  });

  assert.equal(result.manifest.discovered, 2);
  assert.ok(
    result.manifest.urls.some((row) => row.url === "https://acme.example/public"),
  );
  assert.equal(
    result.manifest.urls.some((row) => row.url.includes("127.0.0.1")),
    false,
  );
  assert.ok(result.warnings.includes("sitemap_page_rejected"));
});

test("discovery safety ceiling yields explicit PARTIAL instead of silent truncation", async () => {
  const pages = Array.from(
    { length: 20 },
    (_, i) => "https://acme.example/service-" + (i + 1),
  );
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxDiscoveredUrls: 5,
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "Sitemap: https://acme.example/sitemap.xml",
        "text/plain",
      ),
      "https://acme.example/sitemap.xml": response(
        "https://acme.example/sitemap.xml",
        urlset(pages),
      ),
    }),
  });

  assert.equal(result.limitReached, true);
  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.equal(result.manifest.discovered, 5);
  assert.ok(result.warnings.includes("discovered_url_limit"));
});

test("sitemap document ceiling yields explicit PARTIAL", async () => {
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxSitemapDocuments: 1,
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "Sitemap: https://acme.example/index.xml",
        "text/plain",
      ),
      "https://acme.example/index.xml": response(
        "https://acme.example/index.xml",
        sitemapIndex([
          "https://acme.example/a.xml",
          "https://acme.example/b.xml",
        ]),
      ),
    }),
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.ok(result.warnings.includes("sitemap_document_limit"));
});

test("missing conventional sitemap does not invent incompleteness when none was declared", async () => {
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "User-agent: *\nAllow: /",
        "text/plain",
      ),
    }),
  });

  assert.equal(result.incomplete, false);
  assert.equal(result.manifest.state, "DISCOVERING");
  assert.equal(result.manifest.discovered, 1);
  assert.ok(result.warnings.includes("sitemap_not_found"));
});

test("declared sitemap fetch failure is explicit PARTIAL", async () => {
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    lookup: async () => ["203.0.113.10"],
    get: async (url) => {
      if (url.pathname === "/robots.txt") {
        return response(
          url.toString(),
          "Sitemap: https://acme.example/broken.xml",
          "text/plain",
        );
      }
      throw new Error("synthetic network failure");
    },
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.ok(result.warnings.includes("sitemap_fetch_failed"));
});

test("HTML-link discovery reaches link-only deep pages and rejects external/insecure links", () => {
  const home = discoverHtmlLinks({
    origin: "https://acme.example",
    pageUrl: "https://acme.example/",
    html: [
      '<a href="/about">About</a>',
      '<a href="https://other.example/">External</a>',
      '<a href="http://acme.example/insecure">Insecure</a>',
      '<a href="/about#team">Duplicate fragment</a>',
    ].join(""),
  });
  assert.deepEqual(home.map((row) => row.url), ["https://acme.example/about"]);

  const deep = discoverHtmlLinks({
    origin: "https://acme.example",
    pageUrl: "https://acme.example/about",
    html: '<a href="/deep/only-linked-here">Deep details</a>',
  });
  assert.equal(deep.length, 1);
  assert.equal(deep[0]?.url, "https://acme.example/deep/only-linked-here");
  assert.equal(deep[0]?.discoveryReason, "html_link");
  assert.equal(deep[0]?.discoveredFrom, "https://acme.example/about");
});
