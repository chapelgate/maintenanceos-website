import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_RENDER_MAX_REQUESTS,
  DEFAULT_RENDER_NETWORK_BYTES,
  DEFAULT_RENDER_TIMEOUT_MS,
  renderAndExtractScannerV2Page,
  renderScannerV2Page,
  shouldRenderScannerV2Page,
} from "./scanner-v2-render.ts";
import type {
  HttpGetFn,
  LookupFn,
  SafeHttpResponse,
} from "./types.ts";

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

test("render escalation is conservative: content-rich HTML stays on raw path", () => {
  const rich = `<!doctype html><html><body><main><h1>Services</h1><p>${"Detailed public business information. ".repeat(18)}</p><script src="/app.js"></script></main></body></html>`;
  assert.equal(shouldRenderScannerV2Page(rich), false);

  const shell = '<!doctype html><html><head><script defer src="/app.js"></script></head><body><div id="root"></div></body></html>';
  assert.equal(shouldRenderScannerV2Page(shell), true);

  const moduleShell = '<!doctype html><html><body><main id="shell"></main><script type="module" src="/main.js"></script></body></html>';
  assert.equal(shouldRenderScannerV2Page(moduleShell), true);
});

test("render limits are hard maxima and ordinary content returns not_needed without launching a browser", async () => {
  const rich = "<html><body>" + "Public business information ".repeat(30) + "</body></html>";
  const result = await renderScannerV2Page("https://acme.example/", rich, {
    timeoutMs: DEFAULT_RENDER_TIMEOUT_MS * 100,
    maxNetworkBytes: DEFAULT_RENDER_NETWORK_BYTES * 100,
    maxRequests: DEFAULT_RENDER_MAX_REQUESTS * 100,
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, "not_needed");
    assert.equal(result.requests, 0);
    assert.equal(result.bytes, 0);
  }
});

const browserEnabled = process.env.SCANNER_V2_BROWSER_TEST === "1";

test(
  "real Playwright renderer recovers app-shell facts, blocks unsafe subrequests and keeps sessions isolated",
  { skip: !browserEnabled },
  async () => {
    const { chromium } = await import("playwright");
    const calls: Array<{ url: string; methodSurface: "safe_get" }> = [];

    const lookup: LookupFn = async () => ["203.0.113.10"];
    const get: HttpGetFn = async (url) => {
      calls.push({ url: url.toString(), methodSurface: "safe_get" });

      if (url.pathname === "/") {
        return response(
          url.toString(),
          '<!doctype html><html><head><title>Acme</title><script src="/app.js"></script></head><body><div id="root"></div></body></html>',
        );
      }
      if (url.pathname === "/app.js") {
        return response(
          url.toString(),
          [
            "const root=document.getElementById('root');",
            "const cookieBefore=document.cookie.includes('carry=1')?'yes':'no';",
            "document.cookie='carry=1; SameSite=Lax';",
            "fetch('https://api.acme.example/data').then(r=>r.json()).then(d=>{",
            "root.innerHTML='<h1>'+d.name+'</h1><p>'+d.fact+'</p><a href=\"/deep\">Deep detail</a>';",
            "root.setAttribute('data-cookie-before',cookieBefore);",
            "});",
            "fetch('/submit',{method:'POST',body:'x'}).catch(()=>{});",
            "fetch('https://169.254.169.254/latest/meta-data').catch(()=>{});",
            "if(navigator.serviceWorker){navigator.serviceWorker.register('/sw.js').catch(()=>{});}",
          ].join(""),
          "application/javascript; charset=utf-8",
        );
      }
      if (url.hostname === "api.acme.example" && url.pathname === "/data") {
        return {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "https://acme.example",
          },
          body: JSON.stringify({
            name: "Rendered Services",
            fact: "Emergency alley gate key replacement is available by prior arrangement.",
          }),
          url,
        };
      }
      if (url.pathname === "/deep") {
        return response(
          url.toString(),
          "<html><body><p>Deep public detail.</p></body></html>",
        );
      }
      throw new Error("unexpected_safe_fetch:" + url.pathname);
    };

    const shell =
      '<!doctype html><html><head><title>Acme</title><script src="/app.js"></script></head><body><div id="root"></div></body></html>';

    const first = await renderScannerV2Page(
      "https://acme.example/",
      shell,
      { browserType: chromium, lookup, get },
    );
    assert.equal(first.ok, true);
    if (!first.ok) return;

    assert.match(first.html, /Rendered Services/);
    assert.match(first.html, /Emergency alley gate key replacement/);
    assert.match(first.html, /data-cookie-before="no"/);
    assert.ok(first.links.includes("https://acme.example/deep"));
    assert.ok(
      first.blockedRequests.some(
        (row) =>
          row.url === "https://acme.example/submit" &&
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
    assert.ok(
      calls.some((row) => row.url === "https://api.acme.example/data"),
      "public cross-origin API should be fetched through the SSRF-safe proxy",
    );
    assert.equal(
      calls.some((row) => row.url.includes("/submit")),
      false,
      "blocked POST must never reach the safe fetch primitive",
    );
    assert.equal(
      calls.some((row) => row.url.includes("/sw.js")),
      false,
      "service worker fetch must remain blocked",
    );

    const second = await renderScannerV2Page(
      "https://acme.example/",
      shell,
      { browserType: chromium, lookup, get },
    );
    assert.equal(second.ok, true);
    if (second.ok) {
      assert.match(second.html, /data-cookie-before="no"/);
    }

    const extracted = await renderAndExtractScannerV2Page({
      requestedUrl: "https://acme.example/",
      rawHtml: shell,
      options: { browserType: chromium, lookup, get },
    });
    assert.equal(extracted.ok, true);
    if (extracted.ok) {
      assert.equal(extracted.extraction.page.fetchMode, "rendered");
      assert.match(
        extracted.extraction.page.visibleText,
        /Emergency alley gate key replacement/,
      );
      assert.ok(
        extracted.extraction.chunks.some((chunk) =>
          chunk.text.includes("Emergency alley gate key replacement"),
        ),
      );
    }
  },
);

test(
  "real renderer fails closed when same-origin DNS resolves private",
  { skip: !browserEnabled },
  async () => {
    const { chromium } = await import("playwright");
    let getCalls = 0;
    const result = await renderScannerV2Page(
      "https://acme.example/",
      '<html><head><script src="/app.js"></script></head><body><div id="root"></div></body></html>',
      {
        browserType: chromium,
        lookup: async () => ["127.0.0.1"],
        get: async () => {
          getCalls += 1;
          throw new Error("must not connect");
        },
        timeoutMs: 3_000,
      },
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(
        result.reason === "render_failed" ||
          result.reason === "render_timeout" ||
          result.reason === "render_no_content",
      );
      assert.ok(
        result.blockedRequests.some((row) => row.reason === "fetch_denied"),
      );
    }
    assert.equal(getCalls, 0);
  },
);
