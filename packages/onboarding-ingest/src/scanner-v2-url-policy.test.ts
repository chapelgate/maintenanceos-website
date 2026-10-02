import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
  DEFAULT_MAX_PATH_DEPTH,
  DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
  extractScannerV2CanonicalLink,
  normalizeScannerV2Url,
  ScannerV2FrontierTrapGuard,
} from "./scanner-v2-url-policy.ts";

const ORIGIN = new URL("https://acme.example/");

test("URL normalization removes fragments/tracking, sorts retained params and normalizes default HTTPS port", () => {
  const result = normalizeScannerV2Url(
    "https://ACME.example:443/services?utm_source=newsletter&b=2&a=3&a=1&gclid=x#team",
    ORIGIN,
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(
    result.url,
    "https://acme.example/services?a=1&a=3&b=2",
  );
  assert.equal(
    result.aliasUrl,
    "https://acme.example/services?a=1&a=3&b=2&gclid=x&utm_source=newsletter",
  );
  assert.deepEqual(result.strippedTrackingParams, ["gclid", "utm_source"]);
});

test("URL normalization rejects cross-origin, insecure, blocked/search and session/token URLs", () => {
  const cases: Array<[string, string]> = [
    ["http://acme.example/about", "insecure_scheme"],
    ["https://other.example/about", "cross_origin"],
    ["https://acme.example/admin/users", "blocked_path"],
    ["https://acme.example/wp-admin/edit.php", "blocked_path"],
    ["https://acme.example/cart", "blocked_path"],
    ["https://acme.example/search?q=boilers", "search_endpoint"],
    ["https://acme.example/catalog?sessionid=abc", "session_or_token_parameter"],
    ["https://acme.example/catalog?access_token=secret", "session_or_token_parameter"],
  ];

  for (const [url, reason] of cases) {
    const result = normalizeScannerV2Url(url, ORIGIN);
    assert.equal(result.ok, false, url);
    if (!result.ok) assert.equal(result.reason, reason, url);
  }
});

test("path-depth ceiling is fail-closed and callers cannot raise the reviewed maximum", () => {
  const tooDeep = "/" + Array.from({ length: DEFAULT_MAX_PATH_DEPTH + 1 }, (_, i) => "p" + i).join("/");
  const denied = normalizeScannerV2Url(
    "https://acme.example" + tooDeep,
    ORIGIN,
    { maxPathDepth: 999_999 },
  );
  assert.equal(denied.ok, false);
  if (!denied.ok) {
    assert.equal(denied.reason, "path_depth_limit");
    assert.equal(denied.incomplete, true);
  }

  const lowered = normalizeScannerV2Url(
    "https://acme.example/a/b/c",
    ORIGIN,
    { maxPathDepth: 2 },
  );
  assert.equal(lowered.ok, false);
});

test("sitemap-document URLs are governed by sitemap ceilings, not content path-depth policy", () => {
  const deepSitemap =
    "https://acme.example/" +
    Array.from({ length: DEFAULT_MAX_PATH_DEPTH + 8 }, (_, i) => "s" + i).join("/") +
    "/sitemap.xml";

  const result = normalizeScannerV2Url(deepSitemap, ORIGIN, {
    maxPathDepth: 2,
    applyContentPolicy: false,
  });
  assert.equal(result.ok, true);
});

test("sitemap-document normalization can bypass business endpoint policy without bypassing origin/security", () => {
  const sitemap = normalizeScannerV2Url(
    "https://acme.example/admin/sitemap.xml?utm_source=x",
    ORIGIN,
    { applyContentPolicy: false },
  );
  assert.equal(sitemap.ok, true);
  if (sitemap.ok) {
    assert.equal(sitemap.url, "https://acme.example/admin/sitemap.xml");
  }

  const external = normalizeScannerV2Url(
    "https://other.example/admin/sitemap.xml",
    ORIGIN,
    { applyContentPolicy: false },
  );
  assert.equal(external.ok, false);
});

test("canonical link parser handles attribute order and only accepts same-origin policy-safe targets", () => {
  const a = extractScannerV2CanonicalLink({
    html: '<html><head><link href="/services?utm_source=x&b=2&a=1" rel="alternate canonical"></head></html>',
    pageUrl: "https://acme.example/services?b=2&a=1",
    origin: ORIGIN.origin,
  });
  assert.ok(a?.ok);
  if (a?.ok) {
    assert.equal(a.url, "https://acme.example/services?a=1&b=2");
  }

  const b = extractScannerV2CanonicalLink({
    html: "<link rel='canonical' href='https://other.example/services'>",
    pageUrl: "https://acme.example/services",
    origin: ORIGIN.origin,
  });
  assert.equal(b?.ok, false);
  if (b && !b.ok) assert.equal(b.reason, "cross_origin");

  const c = extractScannerV2CanonicalLink({
    html: "<link rel='stylesheet' href='/style.css'>",
    pageUrl: "https://acme.example/",
    origin: ORIGIN.origin,
  });
  assert.equal(c, null);
});

test("query-family guard bounds faceted variants and does not count exact duplicates twice", () => {
  const guard = new ScannerV2FrontierTrapGuard({
    maxQueryVariantsPerSignature: 2,
  });

  assert.deepEqual(
    guard.evaluate("https://acme.example/products?colour=red&size=m"),
    { ok: true },
  );
  assert.deepEqual(
    guard.evaluate("https://acme.example/products?colour=blue&size=m"),
    { ok: true },
  );
  // Re-seeing an already admitted URL is harmless.
  assert.deepEqual(
    guard.evaluate("https://acme.example/products?colour=blue&size=m"),
    { ok: true },
  );

  const denied = guard.evaluate(
    "https://acme.example/products?colour=green&size=m",
  );
  assert.equal(denied.ok, false);
  if (!denied.ok) {
    assert.equal(denied.reason, "query_variant_limit");
    assert.equal(denied.incomplete, true);
  }
});

test("calendar guard bounds date-path and date-query loops", () => {
  const pathGuard = new ScannerV2FrontierTrapGuard({
    maxCalendarVariantsPerFamily: 2,
  });
  assert.deepEqual(
    pathGuard.evaluate("https://acme.example/events/2026/10/01"),
    { ok: true },
  );
  assert.deepEqual(
    pathGuard.evaluate("https://acme.example/events/2026/10/02"),
    { ok: true },
  );
  const thirdPath = pathGuard.evaluate(
    "https://acme.example/events/2026/10/03",
  );
  assert.equal(thirdPath.ok, false);
  if (!thirdPath.ok) assert.equal(thirdPath.reason, "calendar_variant_limit");

  const queryGuard = new ScannerV2FrontierTrapGuard({
    maxCalendarVariantsPerFamily: 2,
    maxQueryVariantsPerSignature: DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
  });
  assert.deepEqual(
    queryGuard.evaluate("https://acme.example/events?month=10&year=2026"),
    { ok: true },
  );
  assert.deepEqual(
    queryGuard.evaluate("https://acme.example/events?month=11&year=2026"),
    { ok: true },
  );
  const thirdQuery = queryGuard.evaluate(
    "https://acme.example/events?month=12&year=2026",
  );
  assert.equal(thirdQuery.ok, false);
  if (!thirdQuery.ok) assert.equal(thirdQuery.reason, "calendar_variant_limit");
});

test("caller-supplied trap ceilings cannot exceed reviewed hard maxima", () => {
  const queryGuard = new ScannerV2FrontierTrapGuard({
    maxQueryVariantsPerSignature: 999_999,
  });
  for (let i = 0; i < DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE; i += 1) {
    assert.equal(
      queryGuard.evaluate("https://acme.example/list?filter=" + i).ok,
      true,
    );
  }
  const queryDenied = queryGuard.evaluate(
    "https://acme.example/list?filter=overflow",
  );
  assert.equal(queryDenied.ok, false);

  const calendarGuard = new ScannerV2FrontierTrapGuard({
    maxCalendarVariantsPerFamily: 999_999,
  });
  for (let i = 0; i < DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY; i += 1) {
    const day = String((i % 28) + 1).padStart(2, "0");
    const month = String(Math.floor(i / 28) + 1).padStart(2, "0");
    assert.equal(
      calendarGuard.evaluate(
        `https://acme.example/events/2026/${month}/${day}`,
      ).ok,
      true,
    );
  }
});
