import assert from "node:assert/strict";
import test from "node:test";
import { isPathAllowed, isWebIngestEnabled, parseRobotsTxt, runScan } from "./scan.ts";
import type { HttpGetFn, LookupFn, SafeHttpResponse } from "./types.ts";

function htmlPage(url: string, html: string, status = 200): SafeHttpResponse {
  return {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
    body: html,
    url: new URL(url),
  };
}

function robotsPage(url: string, body: string): SafeHttpResponse {
  return {
    status: 200,
    headers: { "content-type": "text/plain" },
    body,
    url: new URL(url),
  };
}

function pages(map: Record<string, SafeHttpResponse>): {
  lookup: LookupFn;
  get: HttpGetFn;
} {
  return {
    lookup: async () => ["203.0.113.10"],
    get: async (url) => {
      const key = url.toString();
      const exact = map[key] ?? map[url.origin + url.pathname];
      if (!exact) {
        return {
          status: 404,
          headers: { "content-type": "text/plain" },
          body: "missing",
          url,
        };
      }
      return exact;
    },
  };
}

const HOME_HTML = `<!doctype html><html><head>
<title>Acme Plumbing</title>
<script type="application/ld+json">
{"@type":"LocalBusiness","name":"Acme Plumbing","openingHours":"Mo-Fr 08:00-17:00","makesOffer":[{"itemOffered":{"name":"Boilers"}}]}
</script>
</head><body>
<a href="/about">About</a>
<a href="/faq">FAQ</a>
</body></html>`;

const FAQ_HTML = `<!doctype html><html><head>
<script type="application/ld+json">
{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Do you cover London?","acceptedAnswer":{"text":"Yes, within the M25."}}]}
</script>
</head><body><h1>FAQ</h1></body></html>`;

test("isWebIngestEnabled is off by default", () => {
  assert.equal(isWebIngestEnabled({}), false);
  assert.equal(isWebIngestEnabled({ ONBOARDING_WEB_INGEST: "false" }), false);
  assert.equal(isWebIngestEnabled({ ONBOARDING_WEB_INGEST: "true" }), true);
  assert.equal(isWebIngestEnabled({ ONBOARDING_WEB_INGEST: "1" }), true);
});

test("runScan refuses to crawl when the ingest flag is off", async () => {
  const result = await runScan("https://acme.example/", { enabled: false });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, "scan_disabled");
    assert.match(result.message, /disabled/i);
  }
});

test("runScan denies localhost and http before any fetch", async () => {
  const lookup: LookupFn = async () => {
    throw new Error("lookup should not run");
  };
  const get: HttpGetFn = async () => {
    throw new Error("get should not run");
  };

  const local = await runScan("https://localhost/", { enabled: true, lookup, get });
  assert.equal(local.ok, false);
  if (!local.ok) {
    assert.equal(local.error, "non_public_host");
    assert.ok(local.warnings.includes("ssrf_denied"));
  }

  const loopback = await runScan("https://127.0.0.1/", { enabled: true, lookup, get });
  assert.equal(loopback.ok, false);

  const metadata = await runScan("https://169.254.169.254/latest/meta-data", {
    enabled: true,
    lookup,
    get,
  });
  assert.equal(metadata.ok, false);

  const http = await runScan("http://example.com/", { enabled: true, lookup, get });
  assert.equal(http.ok, false);
  if (!http.ok) assert.equal(http.error, "http_not_allowed");
});

test("runScan denies private DNS answers and private redirects", async () => {
  const privateDns = await runScan("https://rebind.example/", {
    enabled: true,
    lookup: async () => ["127.0.0.1"],
    get: async () => {
      throw new Error("must not connect after private DNS");
    },
  });
  assert.equal(privateDns.ok, false);
  if (!privateDns.ok) {
    assert.equal(privateDns.error, "non_public_resolved_ip");
    assert.ok(privateDns.warnings.includes("ssrf_denied"));
  }

  const redirect = await runScan("https://public.example/", {
    enabled: true,
    lookup: async (hostname) => {
      if (hostname === "public.example") return ["203.0.113.10"];
      throw new Error(`unexpected lookup ${hostname}`);
    },
    get: async (url) => {
      if (url.pathname === "/robots.txt") {
        return robotsPage(url.toString(), "User-agent: *\nDisallow:");
      }
      return {
        status: 302,
        headers: { location: "https://169.254.169.254/latest/meta-data" },
        body: "",
        url,
      };
    },
  });
  assert.equal(redirect.ok, false);
  if (!redirect.ok) {
    assert.ok(
      redirect.error === "non_public_host" || redirect.warnings.includes("ssrf_denied"),
    );
  }
});

test("runScan happy path returns /create draft fields only from fetched HTML", async () => {
  const fixtures = pages({
    "https://acme.example/robots.txt": robotsPage(
      "https://acme.example/robots.txt",
      "User-agent: *\nAllow: /\n",
    ),
    "https://acme.example/": htmlPage("https://acme.example/", HOME_HTML),
    "https://acme.example/faq": htmlPage("https://acme.example/faq", FAQ_HTML),
    "https://acme.example/about": htmlPage(
      "https://acme.example/about",
      `<html><head><title>About Acme Plumbing</title></head><body>
         <h2>Our services</h2><ul><li>Boilers</li><li>Bathrooms</li></ul>
       </body></html>`,
    ),
  });

  const result = await runScan("https://acme.example/", {
    enabled: true,
    ...fixtures,
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.untrusted, true);
    assert.equal(result.draft.businessName, "Acme Plumbing");
    assert.equal(result.draft.hours, "Mo-Fr 08:00-17:00");
    assert.match(result.draft.services ?? "", /Boilers/);
    assert.match(result.draft.faqs ?? "", /Do you cover London\?/);
    assert.equal(result.draft.greeting, undefined);
    assert.ok(result.warnings.includes("untrusted_crawl_text"));
    assert.ok(result.warnings.includes("greeting_not_found"));
    assert.ok(result.sources.length >= 1);
    assert.ok(result.sources.length <= 5);
    assert.equal(result.fieldMeta?.businessName?.source, "jsonld");
    assert.equal(result.fieldMeta?.hours?.confidence, "high");
  }
});

test("robots.txt Disallow: / is honoured and invents nothing", async () => {
  const result = await runScan("https://blocked.example/", {
    enabled: true,
    lookup: async () => ["203.0.113.10"],
    get: async (url) => {
      if (url.pathname === "/robots.txt") {
        return robotsPage(
          url.toString(),
          "User-agent: *\nDisallow: /\n",
        );
      }
      throw new Error("page fetch should not run when robots disallows /");
    },
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, "robots_disallow");
    assert.match(result.message, /invented/i);
  }
});

test("parseRobotsTxt longest allow/disallow wins", () => {
  const rules = parseRobotsTxt(`
User-agent: *
Disallow: /private
Allow: /private/public.html
`);
  assert.equal(isPathAllowed(rules, "/private"), false);
  assert.equal(isPathAllowed(rules, "/private/public.html"), true);
  assert.equal(isPathAllowed(rules, "/about"), true);
});
