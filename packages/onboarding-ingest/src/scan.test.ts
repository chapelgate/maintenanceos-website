import assert from "node:assert/strict";
import test from "node:test";
import {
  isPathAllowed,
  isReaderChallengePage,
  isWebIngestEnabled,
  parseRobotsTxt,
  runScan,
} from "./scan.ts";
import type { HttpGetFn, LookupFn, SafeHttpResponse } from "./types.ts";

function htmlPage(url: string, html: string, status = 200): SafeHttpResponse {
  return {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
    body: html,
    url: new URL(url),
  };
}

function scriptPage(url: string, body: string): SafeHttpResponse {
  return {
    status: 200,
    headers: { "content-type": "text/javascript; charset=utf-8" },
    body,
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

test("runScan augments a thin client-rendered shell from one bounded same-origin script", async () => {
  const shell = `<!doctype html><html><head>
    <title>Express Gas Delivery - Gas Cylinders & Equipment</title>
    <script defer src="/static/js/main.abc123.js"></script>
  </head><body><div id="root"></div></body></html>`;
  const bundle = `const schema={"@context":"https://schema.org","@type":"LocalBusiness",name:"Express Gas Delivery",telephone:"0151 487 0570",openingHours:["Mo-Fr 08:00-16:00","Sa 08:00-14:00"],hasOfferCatalog:{"@type":"OfferCatalog",itemListElement:[{"@type":"Offer",itemOffered:{"@type":"Product",name:"Propane Gas Cylinders"}},{"@type":"Offer",itemOffered:{"@type":"Product",name:"Patio Gas"}},{"@type":"Offer",itemOffered:{"@type":"Product",name:"Beer Gas"}}]}};`;

  const result = await runScan("https://expressgasdelivery.example/", {
    enabled: true,
    ...pages({
      "https://expressgasdelivery.example/robots.txt": robotsPage(
        "https://expressgasdelivery.example/robots.txt",
        "User-agent: *\nAllow: /\n",
      ),
      "https://expressgasdelivery.example/": htmlPage(
        "https://expressgasdelivery.example/",
        shell,
      ),
      "https://expressgasdelivery.example/static/js/main.abc123.js": scriptPage(
        "https://expressgasdelivery.example/static/js/main.abc123.js",
        bundle,
      ),
    }),
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.draft.businessName, "Express Gas Delivery");
    assert.match(result.draft.hours ?? "", /Mo-Fr 08:00-16:00/);
    assert.match(result.draft.services ?? "", /Propane Gas Cylinders/);
    assert.match(result.draft.services ?? "", /Beer Gas/);
    assert.ok(result.warnings.includes("static_script_schema_fallback"));
    assert.equal(
      result.sources.some((source) => source.url.includes("/static/js/main.abc123.js")),
      true,
    );
  }
});

test("Reader challenge detection rejects verification interstitials without rejecting business pages", () => {
  assert.equal(
    isReaderChallengePage(
      "<html><head><title>Security Verification</title></head><body>Please verify you are human. CAPTCHA required.</body></html>",
    ),
    true,
  );
  assert.equal(
    isReaderChallengePage(
      "<html><head><title>ABC Security</title></head><body><h1>Security Verification Services</h1><p>We verify alarm systems for customers.</p></body></html>",
    ),
    false,
  );
});

test("runScan can recover a bot-challenged public site through the bounded reader fallback", async () => {
  const readerHtml = `<!doctype html><html><head>
    <title>Alley Gates | Local Installation & Maintenance Specialists</title>
    <script type="application/ld+json">
    {
      "@type":"LocalBusiness",
      "name":"Alley Gates",
      "makesOffer":[
        {"itemOffered":{"name":"Alley Gate Installation"}},
        {"itemOffered":{"name":"CCTV"}},
        {"itemOffered":{"name":"Security Fencing"}},
        {"itemOffered":{"name":"Alley Gate Keys"}}
      ]
    }
    </script>
  </head><body>
    <p>ALLEY GATE KEYS ARE MADE TO ORDER AND CAN TAKE UP TO SIX WEEKS TO BE DELIVERED.</p>
  </body></html>`;

  const direct = pages({
    "https://alleygates.example/robots.txt": {
      status: 401,
      headers: { "content-type": "text/html" },
      body: "bot challenge",
      url: new URL("https://alleygates.example/robots.txt"),
    },
    "https://alleygates.example/": {
      status: 401,
      headers: { "content-type": "text/html" },
      body: "bot challenge",
      url: new URL("https://alleygates.example/"),
    },
  });

  let readerCalls = 0;
  const result = await runScan("https://alleygates.example/", {
    enabled: true,
    ...direct,
    readerFallback: true,
    readerLookup: async (hostname) => {
      assert.equal(hostname, "r.jina.ai");
      return ["203.0.113.11"];
    },
    readerGet: async (url, _ip, opts) => {
      readerCalls += 1;
      assert.equal(url.hostname, "r.jina.ai");
      assert.equal(opts.headers?.["X-Respond-With"], "html");
      assert.equal(opts.headers?.["X-No-Cache"], "true");
      assert.equal(opts.headers?.Accept, "text/html");
      return htmlPage(url.toString(), readerHtml);
    },
  });

  assert.equal(readerCalls, 1);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.draft.businessName, "Alley Gates");
    assert.match(result.draft.services ?? "", /Alley Gate Installation/);
    assert.match(result.draft.services ?? "", /CCTV/);
    assert.match(result.draft.services ?? "", /Security Fencing/);
    assert.match(result.draft.services ?? "", /Alley Gate Keys/);
    assert.ok(result.warnings.includes("http_401"));
    assert.ok(result.warnings.includes("reader_fallback_used"));
    assert.equal(result.sources[0]?.url, "https://alleygates.example/");
  }
});

test("runScan rejects a Reader security challenge instead of learning it", async () => {
  const direct = pages({
    "https://challenged.example/robots.txt": {
      status: 401,
      headers: { "content-type": "text/html" },
      body: "bot challenge",
      url: new URL("https://challenged.example/robots.txt"),
    },
    "https://challenged.example/": {
      status: 401,
      headers: { "content-type": "text/html" },
      body: "bot challenge",
      url: new URL("https://challenged.example/"),
    },
  });

  const result = await runScan("https://challenged.example/", {
    enabled: true,
    ...direct,
    readerFallback: true,
    readerLookup: async () => ["203.0.113.11"],
    readerGet: async (url) =>
      htmlPage(
        url.toString(),
        "<html><head><title>Security Verification</title></head><body>Please verify you are human. CAPTCHA required.</body></html>",
      ),
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, "fetch_failed");
    assert.ok(result.warnings.includes("reader_challenge_rejected"));
  }
});

test("runScan leaves the direct failure typed when reader fallback cannot help", async () => {
  const direct = pages({
    "https://blocked.example/robots.txt": {
      status: 403,
      headers: { "content-type": "text/html" },
      body: "blocked",
      url: new URL("https://blocked.example/robots.txt"),
    },
    "https://blocked.example/": {
      status: 403,
      headers: { "content-type": "text/html" },
      body: "blocked",
      url: new URL("https://blocked.example/"),
    },
  });

  const result = await runScan("https://blocked.example/", {
    enabled: true,
    ...direct,
    readerFallback: true,
    readerLookup: async () => ["203.0.113.11"],
    readerGet: async (url) => ({
      status: 429,
      headers: { "content-type": "text/plain" },
      body: "rate limited",
      url,
    }),
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, "fetch_failed");
    assert.ok(result.warnings.includes("http_403"));
    assert.ok(result.warnings.includes("reader_http_429"));
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


test("runScan returns structured Agent Factory facts alongside the legacy draft", async () => {
  const html = `<html><head><script type="application/ld+json">
  {
    "@type":"LocalBusiness",
    "name":"Structured Test Ltd",
    "telephone":"0151 555 0199",
    "email":"hello@structured.example",
    "address":{
      "@type":"PostalAddress",
      "streetAddress":"1 Test Street",
      "addressLocality":"Liverpool",
      "postalCode":"L1 1AA"
    },
    "areaServed":"Wirral",
    "openingHours":"Mo-Fr 09:00-17:00",
    "serviceType":"Repairs"
  }
  </script></head><body><h1>Structured Test Ltd</h1></body></html>`;

  const result = await runScan("https://structured.example/", {
    enabled: true,
    ...pages({
      "https://structured.example/robots.txt": robotsPage(
        "https://structured.example/robots.txt",
        "User-agent: *\nAllow: /\n",
      ),
      "https://structured.example/": htmlPage(
        "https://structured.example/",
        html,
      ),
    }),
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.draft.businessName, "Structured Test Ltd");
    assert.equal(result.facts?.website, "https://structured.example/");
    assert.deepEqual(result.facts?.contact, {
      phones: ["0151 555 0199"],
      emails: ["hello@structured.example"],
    });
    assert.deepEqual(result.facts?.locations, [
      "1 Test Street, Liverpool, L1 1AA",
      "Wirral",
    ]);
    assert.deepEqual(result.facts?.services, ["Repairs"]);
    assert.equal(result.factMeta?.contact?.source, "jsonld");
    assert.equal(result.factMeta?.locations?.confidence, "high");
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
