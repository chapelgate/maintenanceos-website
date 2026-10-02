import assert from "node:assert/strict";
import test from "node:test";
import { buildCrawlManifest } from "./scanner-v2-foundation.ts";
import { extractScannerV2Page } from "./scanner-v2-content.ts";
import {
  decideScannerV2RenderEscalation,
  renderFailureDisposition,
  renderResultToPageInput,
  renderScannerV2Page,
  type ScannerV2BrowserBackend,
} from "./scanner-v2-renderer.ts";
import type { HttpGetFn, LookupFn, SafeHttpResponse } from "./types.ts";

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

test("render escalation triggers only for thin/app-shell HTML", () => {
  assert.deepEqual(
    decideScannerV2RenderEscalation({
      rawHtml:
        '<!doctype html><html><body><div id="root"></div><script src="/app.js"></script></body></html>',
    }),
    { render: true, reason: "app_shell" },
  );

  assert.deepEqual(
    decideScannerV2RenderEscalation({
      rawHtml:
        '<html><body><main><h1>Services</h1><p>We install and repair secure alley gates across Merseyside with full survey information and detailed service descriptions.</p></main><script src="/enhance.js"></script></body></html>',
    }),
    { render: false, reason: "raw_html_sufficient" },
  );

  assert.deepEqual(
    decideScannerV2RenderEscalation({
      rawHtml:
        '<html><body><div></div><script src="/app.js"></script></body></html>',
      extractedVisibleTextChars: 0,
    }),
    { render: true, reason: "thin_html" },
  );
});

test("secure renderer proxy blocks mutation/private/media/analytics requests while allowing public GETs", async () => {
  const seen: string[] = [];
  const lookup: LookupFn = async (hostname) => {
    if (hostname === "fixture.example" || hostname === "cdn.example") {
      return ["203.0.113.10"];
    }
    throw new Error("unexpected lookup " + hostname);
  };
  const get: HttpGetFn = async (url) => {
    seen.push(url.toString());
    if (url.hostname === "fixture.example" && url.pathname === "/") {
      return response(
        url.toString(),
        '<html><body><div id="root"></div><script src="/app.js"></script></body></html>',
      );
    }
    if (url.hostname === "fixture.example" && url.pathname === "/app.js") {
      return response(
        url.toString(),
        'document.getElementById("root").innerHTML="<main><h1>Rendered service</h1><p>Deep app-shell fact.</p><a href=\"/details\">Details</a></main>";',
        "text/javascript",
      );
    }
    return response(url.toString(), "ok", "text/plain");
  };

  const backend: ScannerV2BrowserBackend = async (input) => {
    const main = await input.handleRequest({
      url: input.url,
      method: "GET",
      resourceType: "document",
      headers: { accept: "text/html", cookie: "must-not-forward" },
    });
    assert.equal(main.action, "fulfill");

    const script = await input.handleRequest({
      url: "https://fixture.example/app.js",
      method: "GET",
      resourceType: "script",
      headers: { accept: "*/*", authorization: "must-not-forward" },
    });
    assert.equal(script.action, "fulfill");

    const mutation = await input.handleRequest({
      url: "https://fixture.example/save",
      method: "POST",
      resourceType: "fetch",
      headers: {},
    });
    assert.deepEqual(mutation, {
      action: "abort",
      reason: "mutation_method",
      incomplete: false,
    });

    const privateRequest = await input.handleRequest({
      url: "https://127.0.0.1/private",
      method: "GET",
      resourceType: "fetch",
      headers: {},
    });
    assert.deepEqual(privateRequest, {
      action: "abort",
      reason: "network_policy_denied",
      incomplete: true,
    });

    const media = await input.handleRequest({
      url: "https://fixture.example/video.mp4",
      method: "GET",
      resourceType: "media",
      headers: {},
    });
    assert.deepEqual(media, {
      action: "abort",
      reason: "resource_type_blocked",
      incomplete: false,
    });

    const analytics = await input.handleRequest({
      url: "https://www.google-analytics.com/g/collect",
      method: "GET",
      resourceType: "fetch",
      headers: {},
    });
    assert.deepEqual(analytics, {
      action: "abort",
      reason: "analytics_blocked",
      incomplete: false,
    });

    return {
      html:
        '<html><body><main><h1>Rendered service</h1><p>Deep app-shell fact.</p><a href="/details">Details</a></main></body></html>',
      finalUrl: input.url,
    };
  };

  const result = await renderScannerV2Page("https://fixture.example/", {
    rawHtml:
      '<html><body><div id="root"></div><script src="/app.js"></script></body></html>',
    lookup,
    get,
    backend,
    settleMs: 0,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.match(result.html, /Deep app-shell fact/);
  assert.ok(seen.includes("https://fixture.example/"));
  assert.ok(seen.includes("https://fixture.example/app.js"));
  assert.equal(seen.some((url) => url.includes("127.0.0.1")), false);
  assert.equal(seen.some((url) => url.includes("/save")), false);
  assert.equal(
    result.links.some(
      (row) =>
        row.url === "https://fixture.example/details" &&
        row.discoveryReason === "rendered_link",
    ),
    true,
  );
  assert.equal(
    result.blockedRequests.some(
      (item) =>
        item.url === "https://fixture.example/save" &&
        item.reason === "mutation_method",
    ),
    true,
  );
  assert.equal(
    result.blockedRequests.some(
      (item) =>
        item.url === "https://127.0.0.1/private" &&
        item.reason === "network_policy_denied",
    ),
    true,
  );
});

test("rendered result feeds Stage 4 extraction as fetchMode rendered", async () => {
  const backend: ScannerV2BrowserBackend = async () => ({
    finalUrl: "https://fixture.example/",
    html:
      '<html><head><title>Fixture</title></head><body><main><h1>Emergency cover</h1><p>Emergency repairs are available 24 hours a day.</p></main></body></html>',
  });

  const result = await renderScannerV2Page("https://fixture.example/", {
    rawHtml: '<html><body><div id="root"></div><script></script></body></html>',
    backend,
    lookup: async () => ["203.0.113.10"],
    get: async (url) => response(url.toString(), "<html></html>"),
    settleMs: 0,
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const extraction = extractScannerV2Page(
    renderResultToPageInput({
      requestedUrl: "https://fixture.example/",
      result,
      fetchedAt: "2026-10-02T18:00:00.000Z",
    }),
  );
  assert.equal(extraction.page.fetchMode, "rendered");
  assert.match(extraction.page.visibleText, /Emergency repairs are available 24 hours a day/);
  assert.ok(extraction.chunks.some((chunk) => /Emergency repairs/.test(chunk.text)));
});

test("render request ceilings fail closed instead of returning a truncated success", async () => {
  const backend: ScannerV2BrowserBackend = async (input) => {
    for (let i = 0; i < 4; i += 1) {
      await input.handleRequest({
        url: "https://fixture.example/r-" + i,
        method: "GET",
        resourceType: "fetch",
        headers: {},
      });
    }
    return {
      finalUrl: input.url,
      html: "<html><body>rendered</body></html>",
    };
  };

  const result = await renderScannerV2Page("https://fixture.example/", {
    rawHtml: '<html><body><div id="root"></div><script></script></body></html>',
    backend,
    maxRequests: 2,
    lookup: async () => ["203.0.113.10"],
    get: async (url) => response(url.toString(), "ok", "text/plain"),
    settleMs: 0,
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.reason, "render_request_limit");
  assert.equal(result.incomplete, true);

  const manifest = buildCrawlManifest({
    crawlId: "render-failure",
    origin: "https://fixture.example",
    requestedState: "COMPLETE",
    urls: [renderFailureDisposition("https://fixture.example/", result)],
  });
  assert.equal(manifest.state, "PARTIAL");
  assert.equal(manifest.unresolved, 1);
});

test("render DOM ceiling fails closed", async () => {
  const backend: ScannerV2BrowserBackend = async (input) => ({
    finalUrl: input.url,
    html: "<html><body>" + "x".repeat(20_000) + "</body></html>",
  });

  const result = await renderScannerV2Page("https://fixture.example/", {
    rawHtml: '<html><body><div id="root"></div><script></script></body></html>',
    backend,
    maxDomBytes: 16 * 1024,
    lookup: async () => ["203.0.113.10"],
    get: async (url) => response(url.toString(), "ok", "text/plain"),
    settleMs: 0,
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "render_dom_limit");
    assert.equal(result.incomplete, true);
  }
});

test("normal content does not render when raw HTML is already sufficient", async () => {
  let called = false;
  const backend: ScannerV2BrowserBackend = async () => {
    called = true;
    throw new Error("must not render");
  };
  const result = await renderScannerV2Page("https://fixture.example/", {
    rawHtml:
      '<html><body><main><h1>Full website</h1><p>This is already a complete useful page with enough meaningful business text to be extracted directly without browser rendering.</p></main><script src="/enhance.js"></script></body></html>',
    backend,
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "render_not_required");
    assert.equal(result.incomplete, false);
  }
  assert.equal(called, false);
});

const browserEnabled = process.env.SCANNER_V2_BROWSER_TEST === "1";

test(
  "real Chromium recovers app-shell facts, isolates state and blocks unsafe requests",
  { skip: !browserEnabled },
  async () => {
    const seen: string[] = [];
    const lookup: LookupFn = async (hostname) => {
      if (
        hostname === "fixture.example" ||
        hostname === "api.fixture.example"
      ) {
        return ["203.0.113.10"];
      }
      throw new Error("unexpected lookup " + hostname);
    };
    const get: HttpGetFn = async (url) => {
      seen.push(url.toString());
      if (url.hostname === "fixture.example" && url.pathname === "/") {
        return response(
          url.toString(),
          '<!doctype html><html><head><title>Fixture</title><script src="/app.js"></script></head><body><div id="root"></div></body></html>',
        );
      }
      if (
        url.hostname === "fixture.example" &&
        url.pathname === "/app.js"
      ) {
        return response(
          url.toString(),
          [
            "const root=document.getElementById('root');",
            "const before=document.cookie.includes('carry=1')?'yes':'no';",
            "root.setAttribute('data-cookie-before',before);",
            "root.innerHTML='<main><h1>Rendered Services</h1><p>Rendered-only emergency alley gate repair is available by prior arrangement.</p><a href=\"/deep\">Deep detail</a></main>';",
            "document.cookie='carry=1; SameSite=Lax';",
            "fetch('https://api.fixture.example/data').catch(()=>{});",
            "fetch('/submit',{method:'POST',body:'must-not-send'}).catch(()=>{});",
            "fetch('https://169.254.169.254/latest/meta-data').catch(()=>{});",
          ].join(""),
          "text/javascript; charset=utf-8",
        );
      }
      if (
        url.hostname === "api.fixture.example" &&
        url.pathname === "/data"
      ) {
        return {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
          },
          body: '{"ok":true}',
          url,
        };
      }
      if (
        url.hostname === "fixture.example" &&
        url.pathname === "/deep"
      ) {
        return response(
          url.toString(),
          "<html><body><p>Deep public detail.</p></body></html>",
        );
      }
      throw new Error("unexpected safe fetch " + url.toString());
    };

    const shell =
      '<!doctype html><html><head><title>Fixture</title><script src="/app.js"></script></head><body><div id="root"></div></body></html>';

    async function renderOnce() {
      return renderScannerV2Page("https://fixture.example/", {
        rawHtml: shell,
        lookup,
        get,
        settleMs: 400,
        timeoutMs: 10_000,
      });
    }

    const first = await renderOnce();
    assert.equal(first.ok, true, JSON.stringify(first));
    if (!first.ok) return;
    assert.match(first.html, /Rendered-only emergency alley gate repair/);
    assert.match(first.html, /data-cookie-before="no"/);
    assert.ok(
      first.links.some(
        (row) =>
          row.url === "https://fixture.example/deep" &&
          row.discoveryReason === "rendered_link",
      ),
    );
    assert.ok(seen.includes("https://api.fixture.example/data"));
    assert.equal(seen.some((url) => url.includes("/submit")), false);
    assert.equal(
      seen.some((url) => url.includes("169.254.169.254")),
      false,
    );
    assert.ok(
      first.blockedRequests.some(
        (row) =>
          row.url === "https://fixture.example/submit" &&
          row.reason === "mutation_method",
      ),
    );
    assert.ok(
      first.blockedRequests.some(
        (row) =>
          row.url.startsWith("https://169.254.169.254/") &&
          row.reason === "network_policy_denied",
      ),
    );

    const second = await renderOnce();
    assert.equal(second.ok, true, JSON.stringify(second));
    if (second.ok) {
      assert.match(second.html, /data-cookie-before="no"/);
      assert.doesNotMatch(second.html, /data-cookie-before="yes"/);
    }
  },
);

test(
  "real Chromium fails closed before connecting when DNS resolves private",
  { skip: !browserEnabled },
  async () => {
    let getCalls = 0;
    const result = await renderScannerV2Page(
      "https://private-dns.example/",
      {
        rawHtml:
          '<html><head><script src="/app.js"></script></head><body><div id="root"></div></body></html>',
        lookup: async () => ["127.0.0.1"],
        get: async (url) => {
          getCalls += 1;
          return response(url.toString(), "must not be fetched");
        },
        timeoutMs: 3_000,
      },
    );

    assert.equal(result.ok, false);
    assert.equal(getCalls, 0);
    if (!result.ok) {
      assert.equal(result.incomplete, true);
      assert.ok(
        result.blockedRequests.some(
          (row) => row.reason === "fetch_failed",
        ),
      );
    }
  },
);

