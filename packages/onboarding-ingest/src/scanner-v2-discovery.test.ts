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

function html(url: string, body = "<html><body>ok</body></html>"): SafeHttpResponse {
  return response(url, body, "text/html; charset=utf-8");
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

function urlset(
  urls: Array<string | { loc: string; lastmod?: string }>,
): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((value) => {
      const item = typeof value === "string" ? { loc: value } : value;
      const loc = item.loc.replaceAll("&", "&amp;");
      return (
        "<url><loc>" +
        loc +
        "</loc>" +
        (item.lastmod ? "<lastmod>" + item.lastmod + "</lastmod>" : "") +
        "</url>"
      );
    }),
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

test("parseRobotsSitemaps is independent of groups, case-insensitive and same-origin HTTPS only", () => {
  const origin = new URL("https://acme.example/");
  assert.deepEqual(
    parseRobotsSitemaps(
      [
        "User-agent: blocked-bot",
        "Disallow: /",
        "Sitemap: https://acme.example/sitemap.xml",
        "User-agent: *",
        "Allow: /",
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

test("integrated discovery exhausts 100+ sitemap pages and a link-only deep page", async () => {
  const first = Array.from(
    { length: 60 },
    (_, i) => "https://acme.example/page-" + String(i + 1).padStart(3, "0"),
  );
  const second = Array.from(
    { length: 60 },
    (_, i) => "https://acme.example/page-" + String(i + 61).padStart(3, "0"),
  );

  const map: Record<string, SafeHttpResponse> = {
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
    "https://acme.example/": html(
      "https://acme.example/",
      '<html><body><a href="/page-001">First</a></body></html>',
    ),
    "https://acme.example/link-only/deep": html(
      "https://acme.example/link-only/deep",
      "<html><body>deep fact</body></html>",
    ),
  };

  for (const [index, url] of [...first, ...second].entries()) {
    map[url] = html(
      url,
      index === 0
        ? '<html><body><a href="/link-only/deep">Link-only deep page</a></body></html>'
        : `<html><body>business page ${index + 1}</body></html>`,
    );
  }

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures(map),
  });

  assert.equal(result.incomplete, false);
  assert.equal(result.limitReached, false);
  assert.equal(result.manifest.state, "DISCOVERING");
  assert.equal(result.sitemapDocuments, 3);
  assert.equal(result.sitemapUrlsDiscovered, 120);
  assert.equal(result.htmlPagesFetched, 122);
  assert.equal(result.htmlLinksDiscovered, 1);
  assert.equal(result.manifest.discovered, 122);
  assert.equal(result.manifest.fetched, 122);
  assert.equal(result.manifest.queued, 0);
  assert.equal(result.manifest.unresolved, 0);
  assert.equal(result.urlsDroppedByLimit, 0);

  const deep = result.manifest.urls.find(
    (row) => row.url === "https://acme.example/link-only/deep",
  );
  assert.equal(deep?.status, "fetched");
  assert.equal(deep?.discoveryReason, "html_link");
  assert.equal(deep?.discoveredFrom, "https://acme.example/page-001");
});

test("sitemap fetch explicitly requests bounded compressed responses", async () => {
  let compressedRequested = false;
  let maxDecompressedBytes: number | undefined;
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    lookup: async () => ["203.0.113.10"],
    maxSitemapBytes: 2048,
    get: async (url, _ip, opts) => {
      if (url.pathname === "/robots.txt") {
        return response(
          url.toString(),
          "Sitemap: https://acme.example/sitemap.xml.gz",
          "text/plain",
        );
      }
      if (url.pathname === "/sitemap.xml.gz") {
        compressedRequested = opts.acceptCompressed === true;
        maxDecompressedBytes = opts.maxDecompressedBytes;
        return response(
          url.toString(),
          urlset(["https://acme.example/service"]),
          "application/gzip",
        );
      }
      if (url.pathname === "/") {
        return html(url.toString(), "<html><body>Home</body></html>");
      }
      if (url.pathname === "/service") {
        return html(url.toString(), "<html><body>Service</body></html>");
      }
      return response(url.toString(), "missing", "text/plain", 404);
    },
  });

  assert.equal(compressedRequested, true);
  assert.equal(maxDecompressedBytes, 2048);
  assert.equal(result.incomplete, false);
  assert.ok(
    result.manifest.urls.some(
      (row) =>
        row.url === "https://acme.example/service" &&
        row.status === "fetched",
    ),
  );
});

test("sitemap discovery preserves lastmod after the page reaches a terminal state", async () => {
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
          {
            loc: "https://acme.example/pricing",
            lastmod: "2026-10-02",
          },
        ]),
      ),
      "https://acme.example/": html("https://acme.example/"),
      "https://acme.example/pricing": html(
        "https://acme.example/pricing",
        "<html><body>Pricing</body></html>",
      ),
    }),
  });

  const pricing = result.manifest.urls.find(
    (row) => row.url === "https://acme.example/pricing",
  );
  assert.equal(pricing?.status, "fetched");
  assert.equal(pricing?.sitemapLastModified, "2026-10-02");
});

test("sitemap private, cross-origin and insecure page URLs are visibly policy-skipped", async () => {
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
      "https://acme.example/": html(
        "https://acme.example/",
        "<html><body>Home</body></html>",
      ),
      "https://acme.example/public": html(
        "https://acme.example/public",
        "<html><body>Public page</body></html>",
      ),
    }),
  });

  assert.equal(result.manifest.discovered, 5);
  assert.equal(result.manifest.fetched, 2);
  assert.equal(result.manifest.policySkipped, 3);
  assert.equal(result.manifest.unresolved, 0);
  const rejected = new Map(
    result.manifest.urls
      .filter((row) => row.status === "policy_skipped")
      .map((row) => [row.url, row.reason]),
  );
  assert.equal(
    rejected.get("https://127.0.0.1/private"),
    "cross_origin",
  );
  assert.equal(
    rejected.get("https://other.example/cross-origin"),
    "cross_origin",
  );
  assert.equal(
    rejected.get("http://acme.example/insecure"),
    "insecure_scheme",
  );
  assert.ok(result.warnings.includes("sitemap_page_rejected"));
});

test("robots disallow is applied to integrated HTML frontier without fetching the page", async () => {
  let privateFetches = 0;
  const base = fixtures({
    "https://acme.example/robots.txt": response(
      "https://acme.example/robots.txt",
      "User-agent: *\nDisallow: /private\nSitemap: https://acme.example/sitemap.xml",
      "text/plain",
    ),
    "https://acme.example/sitemap.xml": response(
      "https://acme.example/sitemap.xml",
      urlset([
        "https://acme.example/public",
        "https://acme.example/private/details",
      ]),
    ),
    "https://acme.example/": html(
      "https://acme.example/",
      "<html><body>Home</body></html>",
    ),
    "https://acme.example/public": html(
      "https://acme.example/public",
      "<html><body>Public page</body></html>",
    ),
  });

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxHtmlPages: 2,
    lookup: base.lookup,
    get: async (url, ip, opts) => {
      if (url.pathname.startsWith("/private")) privateFetches += 1;
      return base.get(url, ip, opts);
    },
  });

  assert.equal(privateFetches, 0);
  assert.equal(
    result.manifest.urls.find((row) => row.url === "https://acme.example/public")?.status,
    "fetched",
  );
  assert.equal(result.warnings.includes("html_page_limit"), false);
  const privateRow = result.manifest.urls.find((row) =>
    row.url.includes("/private/details"),
  );
  assert.equal(privateRow?.status, "robots_skipped");
  assert.equal(privateRow?.reason, "robots_disallow");
});

test("callers cannot raise the reviewed sitemap-depth ceiling", async () => {
  const map: Record<string, SafeHttpResponse> = {
    "https://acme.example/robots.txt": response(
      "https://acme.example/robots.txt",
      "Sitemap: https://acme.example/index-0.xml",
      "text/plain",
    ),
    "https://acme.example/": html("https://acme.example/"),
  };
  for (let depth = 0; depth <= 4; depth += 1) {
    map[`https://acme.example/index-${depth}.xml`] = response(
      `https://acme.example/index-${depth}.xml`,
      sitemapIndex([
        `https://acme.example/index-${depth + 1}.xml`,
      ]),
    );
  }

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxSitemapDepth: 999_999,
    ...fixtures(map),
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.ok(result.warnings.includes("sitemap_depth_limit"));
  assert.equal(result.sitemapDocuments, 5);
});

test("sitemap nesting-depth ceiling yields explicit PARTIAL", async () => {
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxSitemapDepth: 0,
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "Sitemap: https://acme.example/index.xml",
        "text/plain",
      ),
      "https://acme.example/index.xml": response(
        "https://acme.example/index.xml",
        sitemapIndex(["https://acme.example/nested.xml"]),
      ),
      "https://acme.example/": html("https://acme.example/"),
    }),
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.ok(result.warnings.includes("sitemap_depth_limit"));
});

test("duplicate sitemap references do not consume document budget", async () => {
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
          "https://acme.example/index.xml",
          "https://acme.example/index.xml",
        ]),
      ),
      "https://acme.example/": html("https://acme.example/"),
    }),
  });

  assert.equal(result.sitemapDocuments, 1);
  assert.equal(result.incomplete, false);
  assert.equal(result.warnings.includes("sitemap_document_limit"), false);
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
      "https://acme.example/": html("https://acme.example/"),
    }),
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.ok(result.warnings.includes("sitemap_document_limit"));
});

test("URL safety ceiling is explicit and reports dropped frontier candidates", async () => {
  const pages = Array.from(
    { length: 20 },
    (_, i) => "https://acme.example/service-" + (i + 1),
  );
  const map: Record<string, SafeHttpResponse> = {
    "https://acme.example/robots.txt": response(
      "https://acme.example/robots.txt",
      "Sitemap: https://acme.example/sitemap.xml",
      "text/plain",
    ),
    "https://acme.example/sitemap.xml": response(
      "https://acme.example/sitemap.xml",
      urlset(pages),
    ),
    "https://acme.example/": html("https://acme.example/"),
  };
  for (const url of pages) map[url] = html(url);

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxDiscoveredUrls: 5,
    ...fixtures(map),
  });

  assert.equal(result.limitReached, true);
  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.equal(result.manifest.discovered, 5);
  assert.ok(result.urlsDroppedByLimit > 0);
  assert.ok(result.warnings.includes("discovered_url_limit"));
});

test("HTML-page safety ceiling leaves queued evidence and returns PARTIAL", async () => {
  const links = Array.from(
    { length: 10 },
    (_, i) => '<a href="/p-' + (i + 1) + '">Page</a>',
  ).join("");
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxHtmlPages: 1,
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "User-agent: *\nAllow: /",
        "text/plain",
      ),
      "https://acme.example/": html(
        "https://acme.example/",
        "<html><body>" + links + "</body></html>",
      ),
    }),
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.equal(result.manifest.fetched, 1);
  assert.equal(result.manifest.queued, 10);
  assert.ok(result.warnings.includes("html_page_limit"));
});

test("missing conventional sitemap is not incomplete when robots is available and no sitemap was declared", async () => {
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "User-agent: *\nAllow: /",
        "text/plain",
      ),
      "https://acme.example/": html("https://acme.example/"),
    }),
  });

  assert.equal(result.incomplete, false);
  assert.equal(result.manifest.state, "DISCOVERING");
  assert.equal(result.manifest.discovered, 1);
  assert.equal(result.manifest.fetched, 1);
  assert.ok(result.warnings.includes("sitemap_not_found"));
});

test("declared sitemap fetch failure is explicit PARTIAL while HTML discovery still proceeds", async () => {
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
      if (url.pathname === "/") {
        return html(
          url.toString(),
          '<html><body><a href="/deep">Deep</a></body></html>',
        );
      }
      if (url.pathname === "/deep") {
        return html(url.toString(), "<html><body>deep</body></html>");
      }
      throw new Error("synthetic sitemap network failure");
    },
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.equal(result.manifest.fetched, 2);
  assert.ok(result.warnings.includes("sitemap_fetch_failed"));
  assert.ok(
    result.manifest.urls.some(
      (row) =>
        row.url === "https://acme.example/deep" &&
        row.discoveryReason === "html_link",
    ),
  );
});

test("HTML-link helper normalises fragments and rejects external/insecure links", () => {
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

test("integrated discovery collapses tracking/query-order variants while retaining duplicate provenance", async () => {
  const canonical = "https://acme.example/services?a=1&b=2";
  let canonicalFetches = 0;
  const base = fixtures({
    "https://acme.example/robots.txt": response(
      "https://acme.example/robots.txt",
      "User-agent: *\nAllow: /",
      "text/plain",
    ),
    "https://acme.example/": html(
      "https://acme.example/",
      [
        '<a href="/services?b=2&utm_source=newsletter&a=1">One</a>',
        '<a href="/services?gclid=abc&a=1&b=2">Two</a>',
      ].join(""),
    ),
    [canonical]: html(canonical, "<html><body>Services</body></html>"),
  });

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    lookup: base.lookup,
    get: async (url, ip, opts) => {
      if (url.toString() === canonical) canonicalFetches += 1;
      return base.get(url, ip, opts);
    },
  });

  assert.equal(result.incomplete, false);
  assert.equal(canonicalFetches, 1);
  assert.equal(result.htmlLinksDiscovered, 1);
  assert.equal(result.manifest.fetched, 2);
  assert.equal(result.manifest.duplicate, 2);

  const aliases = result.manifest.urls.filter(
    (row) => row.reason === "normalized_url_variant",
  );
  assert.equal(aliases.length, 2);
  assert.ok(aliases.every((row) => row.canonicalUrl === canonical));
  assert.ok(
    result.manifest.urls.some(
      (row) => row.url === canonical && row.status === "fetched",
    ),
  );
});

test("integrated discovery honours same-origin rel=canonical and retains the alias row", async () => {
  const alias = "https://acme.example/alias";
  const canonical = "https://acme.example/canonical";
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "User-agent: *\nAllow: /",
        "text/plain",
      ),
      "https://acme.example/": html(
        "https://acme.example/",
        '<html><body><a href="/alias">Alias</a></body></html>',
      ),
      [alias]: html(
        alias,
        '<html><head><link rel="canonical" href="/canonical"></head><body>Alias copy</body></html>',
      ),
      [canonical]: html(
        canonical,
        "<html><body>Canonical copy</body></html>",
      ),
    }),
  });

  assert.equal(result.incomplete, false);
  const aliasRow = result.manifest.urls.find((row) => row.url === alias);
  assert.equal(aliasRow?.status, "duplicate");
  assert.equal(aliasRow?.canonicalUrl, canonical);
  assert.equal(aliasRow?.reason, "rel_canonical");

  const canonicalRow = result.manifest.urls.find(
    (row) => row.url === canonical,
  );
  assert.equal(canonicalRow?.status, "fetched");
  assert.equal(canonicalRow?.canonicalUrl, canonical);
});

test("integrated discovery content-hash deduplicates identical pages deterministically", async () => {
  const a = "https://acme.example/a";
  const b = "https://acme.example/b";
  const duplicateBody = "<html><body><h1>Same representation</h1></body></html>";

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "User-agent: *\nAllow: /",
        "text/plain",
      ),
      "https://acme.example/": html(
        "https://acme.example/",
        '<html><body><a href="/a">A</a><a href="/b">B</a></body></html>',
      ),
      [a]: html(a, duplicateBody),
      [b]: html(b, duplicateBody),
    }),
  });

  assert.equal(result.incomplete, false);
  assert.equal(
    result.manifest.urls.find((row) => row.url === a)?.status,
    "fetched",
  );
  const bRow = result.manifest.urls.find((row) => row.url === b);
  assert.equal(bRow?.status, "duplicate");
  assert.equal(bRow?.canonicalUrl, a);
  assert.equal(bRow?.reason, "content_hash_duplicate");
  assert.ok(bRow?.contentHash);
});

test("blocked/admin/search/session endpoints are policy-skipped without network fetch", async () => {
  const forbidden = [
    "https://acme.example/admin/users",
    "https://acme.example/checkout",
    "https://acme.example/search?q=boilers",
    "https://acme.example/catalog?sessionid=abc",
  ];
  let forbiddenFetches = 0;
  const base = fixtures({
    "https://acme.example/robots.txt": response(
      "https://acme.example/robots.txt",
      "User-agent: *\nAllow: /",
      "text/plain",
    ),
    "https://acme.example/": html(
      "https://acme.example/",
      [
        '<a href="/admin/users">Admin</a>',
        '<a href="/checkout">Checkout</a>',
        '<a href="/search?q=boilers">Search</a>',
        '<a href="/catalog?sessionid=abc">Session</a>',
        '<a href="/public">Public</a>',
      ].join(""),
    ),
    "https://acme.example/public": html(
      "https://acme.example/public",
      "<html><body>Public</body></html>",
    ),
  });

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    lookup: base.lookup,
    get: async (url, ip, opts) => {
      if (forbidden.includes(url.toString())) forbiddenFetches += 1;
      return base.get(url, ip, opts);
    },
  });

  assert.equal(forbiddenFetches, 0);
  assert.equal(result.incomplete, false);
  for (const url of forbidden) {
    const row = result.manifest.urls.find((item) => item.url === url);
    assert.equal(row?.status, "policy_skipped", url);
  }
  assert.equal(
    result.manifest.urls.find(
      (row) => row.url === "https://acme.example/public",
    )?.status,
    "fetched",
  );
});

test("faceted-query explosion is bounded, visible and forces PARTIAL", async () => {
  const links = Array.from(
    { length: 5 },
    (_, i) =>
      '<a href="/products?colour=' +
      ["red", "blue", "green", "black", "white"][i] +
      '&size=m">Variant</a>',
  ).join("");
  const map: Record<string, SafeHttpResponse> = {
    "https://acme.example/robots.txt": response(
      "https://acme.example/robots.txt",
      "User-agent: *\nAllow: /",
      "text/plain",
    ),
    "https://acme.example/": html(
      "https://acme.example/",
      "<html><body>" + links + "</body></html>",
    ),
  };
  for (const colour of ["red", "blue"]) {
    const url = `https://acme.example/products?colour=${colour}&size=m`;
    map[url] = html(
      url,
      `<html><body>Product variant ${colour}</body></html>`,
    );
  }

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxQueryVariantsPerSignature: 2,
    ...fixtures(map),
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.ok(result.warnings.includes("query_variant_limit"));
  assert.equal(
    result.manifest.urls.filter(
      (row) => row.reason === "query_variant_limit",
    ).length,
    3,
  );
  assert.equal(
    result.manifest.urls.filter(
      (row) => row.url.includes("/products?") && row.status === "fetched",
    ).length,
    2,
  );
});

test("calendar/date loop is bounded and forces PARTIAL instead of exhausting the frontier", async () => {
  const dates = ["01", "02", "03", "04", "05"];
  const links = dates
    .map(
      (day) =>
        `<a href="/events/2026/10/${day}">Day ${day}</a>`,
    )
    .join("");
  const map: Record<string, SafeHttpResponse> = {
    "https://acme.example/robots.txt": response(
      "https://acme.example/robots.txt",
      "User-agent: *\nAllow: /",
      "text/plain",
    ),
    "https://acme.example/": html(
      "https://acme.example/",
      "<html><body>" + links + "</body></html>",
    ),
  };
  for (const day of dates.slice(0, 2)) {
    const url = `https://acme.example/events/2026/10/${day}`;
    map[url] = html(url, "<html><body>Calendar day</body></html>");
  }

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxCalendarVariantsPerFamily: 2,
    ...fixtures(map),
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.ok(result.warnings.includes("calendar_variant_limit"));
  assert.equal(
    result.manifest.urls.filter(
      (row) => row.reason === "calendar_variant_limit",
    ).length,
    3,
  );
});

test("path-depth policy records skipped deep URLs and forces PARTIAL", async () => {
  const deep = "https://acme.example/a/b/c";
  let deepFetches = 0;
  const base = fixtures({
    "https://acme.example/robots.txt": response(
      "https://acme.example/robots.txt",
      "User-agent: *\nAllow: /",
      "text/plain",
    ),
    "https://acme.example/": html(
      "https://acme.example/",
      '<html><body><a href="/a/b/c">Deep</a></body></html>',
    ),
  });

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    maxPathDepth: 2,
    lookup: base.lookup,
    get: async (url, ip, opts) => {
      if (url.toString() === deep) deepFetches += 1;
      return base.get(url, ip, opts);
    },
  });

  assert.equal(deepFetches, 0);
  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.ok(result.warnings.includes("path_depth_limit"));
  const row = result.manifest.urls.find((item) => item.url === deep);
  assert.equal(row?.status, "policy_skipped");
  assert.equal(row?.reason, "path_depth_limit");
});

test("Stage 7 renders only a thin app shell and adds rendered links to the frontier", async () => {
  let renderCalls = 0;
  const shell =
    '<html><head><script src="/app.js"></script></head><body><div id="root"></div></body></html>';

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "User-agent: *\nAllow: /",
        "text/plain",
      ),
      "https://acme.example/": html("https://acme.example/", shell),
      "https://acme.example/deep-rendered": html(
        "https://acme.example/deep-rendered",
        "<html><body><p>Deep rendered-link detail is public.</p></body></html>",
      ),
    }),
    renderPage: async (url, rawHtml) => {
      renderCalls += 1;
      assert.equal(url, "https://acme.example/");
      assert.equal(rawHtml, shell);
      return {
        ok: true,
        url,
        html:
          '<html><body><h1>Rendered Services</h1><p>Rendered public service details.</p><a href="/deep-rendered">Deep rendered page</a></body></html>',
        links: ["https://acme.example/deep-rendered"],
        requests: 3,
        bytes: 1024,
        blockedRequests: [],
        warnings: [],
      };
    },
  });

  assert.equal(renderCalls, 1);
  assert.equal(result.incomplete, false);
  assert.equal(result.renderAttempts, 1);
  assert.equal(result.renderedPages, 1);
  assert.equal(result.renderFailures, 0);
  assert.equal(result.renderedLinksDiscovered, 1);
  assert.equal(result.manifest.queued, 0);

  const deep = result.manifest.urls.find(
    (row) => row.url === "https://acme.example/deep-rendered",
  );
  assert.equal(deep?.status, "fetched");
  assert.equal(deep?.discoveryReason, "rendered_link");
  assert.equal(deep?.discoveredFrom, "https://acme.example/");
});

test("Stage 7 render failure is explicit PARTIAL and never treats the raw shell as complete", async () => {
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "User-agent: *\nAllow: /",
        "text/plain",
      ),
      "https://acme.example/": html(
        "https://acme.example/",
        '<html><head><script src="/app.js"></script></head><body><div id="root"></div></body></html>',
      ),
    }),
    renderPage: async () => ({
      ok: false,
      reason: "render_timeout",
      requests: 2,
      bytes: 100,
      blockedRequests: [],
      warnings: ["render_timeout"],
    }),
  });

  assert.equal(result.incomplete, true);
  assert.equal(result.manifest.state, "PARTIAL");
  assert.equal(result.renderAttempts, 1);
  assert.equal(result.renderFailures, 1);
  assert.ok(result.warnings.includes("render_render_timeout"));
  const root = result.manifest.urls.find(
    (row) => row.url === "https://acme.example/",
  );
  assert.equal(root?.status, "unresolved");
  assert.equal(root?.reason, "render_render_timeout");
});

test("Stage 7 does not invoke the renderer for content-rich HTML", async () => {
  let renderCalls = 0;
  const result = await discoverScannerV2Frontier("https://acme.example/", {
    ...fixtures({
      "https://acme.example/robots.txt": response(
        "https://acme.example/robots.txt",
        "User-agent: *\nAllow: /",
        "text/plain",
      ),
      "https://acme.example/": html(
        "https://acme.example/",
        "<html><body><h1>Business</h1><p>" +
          "Detailed public business content. ".repeat(24) +
          "</p></body></html>",
      ),
    }),
    renderPage: async () => {
      renderCalls += 1;
      throw new Error("renderer must not be called");
    },
  });

  assert.equal(renderCalls, 0);
  assert.equal(result.incomplete, false);
  assert.equal(result.renderAttempts, 0);
  assert.equal(result.renderedPages, 0);
  assert.equal(result.renderFailures, 0);
  assert.equal(result.manifest.fetched, 1);
});

