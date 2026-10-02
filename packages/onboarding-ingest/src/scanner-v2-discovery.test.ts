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
        : "<html><body>business page</body></html>",
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
      "https://acme.example/": html("https://acme.example/"),
      "https://acme.example/public": html("https://acme.example/public"),
    }),
  });

  assert.equal(result.manifest.discovered, 5);
  assert.equal(result.manifest.fetched, 2);
  assert.equal(result.manifest.policySkipped, 3);
  assert.equal(result.manifest.unresolved, 0);
  assert.ok(
    result.manifest.urls.some(
      (row) =>
        row.url === "https://127.0.0.1/private" &&
        row.status === "policy_skipped" &&
        row.reason === "sitemap_page_rejected",
    ),
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
    "https://acme.example/": html("https://acme.example/"),
    "https://acme.example/public": html("https://acme.example/public"),
  });

  const result = await discoverScannerV2Frontier("https://acme.example/", {
    lookup: base.lookup,
    get: async (url, ip, opts) => {
      if (url.pathname.startsWith("/private")) privateFetches += 1;
      return base.get(url, ip, opts);
    },
  });

  assert.equal(privateFetches, 0);
  const privateRow = result.manifest.urls.find((row) =>
    row.url.includes("/private/details"),
  );
  assert.equal(privateRow?.status, "robots_skipped");
  assert.equal(privateRow?.reason, "robots_disallow");
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
