const origin = (process.env.WEBSITE_SITE_URL ||
  "https://worksmartos.co.uk").replace(/\/$/, "");
const strict = process.env.REQUIRE_SECURITY_HEADERS === "1";

const desired = [
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];

const response = await fetch(
  origin + "/?security_audit=" + Date.now(),
  { headers: { "cache-control": "no-cache", pragma: "no-cache" } },
);
const html = await response.text();
const headers = Object.fromEntries(
  [...response.headers.entries()].filter(([name]) =>
    [...desired, "strict-transport-security", "cache-control", "content-type"].includes(name),
  ),
);

const missingHeaders = desired.filter((name) => !response.headers.get(name));
const failures = [];

if (response.status !== 200) failures.push(`homepage HTTP ${response.status}`);
if (!/http-equiv=["']Content-Security-Policy["']/i.test(html)) {
  failures.push("exported page is missing enforcing meta CSP");
}
if (!/name=["']referrer["'][^>]*content=["']strict-origin-when-cross-origin["']/i.test(html) &&
    !/content=["']strict-origin-when-cross-origin["'][^>]*name=["']referrer["']/i.test(html)) {
  failures.push("exported page is missing strict-origin-when-cross-origin referrer meta");
}
if (/unsafe-eval/i.test(html.match(/<meta[^>]+Content-Security-Policy[^>]+>/i)?.[0] || "")) {
  failures.push("production meta CSP contains unsafe-eval");
}
if (strict && missingHeaders.length) {
  failures.push("required HTTP security headers missing: " + missingHeaders.join(", "));
}

console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  origin,
  status: response.status,
  strict,
  headers,
  missingHeaders,
  htmlControls: {
    metaCsp: /http-equiv=["']Content-Security-Policy["']/i.test(html),
    referrerMeta: /strict-origin-when-cross-origin/i.test(html),
  },
  transportNote: new URL(origin).hostname.endsWith(".app")
    ? ".app is HSTS-preloaded by browser policy; this is not an HSTS response-header claim"
    : "custom/non-.app domain requires separate transport-header review",
  failures,
  ok: failures.length === 0,
}, null, 2));

if (failures.length) process.exitCode = 1;
