const origin = (process.env.WEBSITE_SITE_URL ||
  "https://maintenanceos.chapelgatetechnologies.com").replace(/\/$/, "");

const failures = [];
const observations = [];
const ua = "MaintenanceOS-Staging-RedTeam/1.0";

async function request(path, options = {}) {
  return fetch(origin + path, {
    redirect: options.redirect ?? "manual",
    method: options.method ?? "GET",
    headers: {
      "user-agent": ua,
      "cache-control": "no-cache",
      ...(options.headers || {}),
    },
    body: options.body,
  });
}

function fail(message) {
  failures.push(message);
}

const home = await request("/?redteam=" + Date.now(), { redirect: "follow" });
const homeHtml = await home.text();
if (home.status !== 200) fail(`homepage HTTP ${home.status}`);
if (!/http-equiv=["']Content-Security-Policy["']/i.test(homeHtml)) {
  fail("homepage meta CSP missing");
}
if (/<script[^>]+src=["']https?:\/\//i.test(homeHtml)) {
  fail("third-party absolute script source exposed");
}

const sensitivePaths = [
  "/.env",
  "/.git/config",
  "/package.json",
  "/package-lock.json",
  "/next.config.ts",
  "/src/app/page.tsx",
  "/.do/app.yaml",
  "/server.js",
];
for (const path of sensitivePaths) {
  const response = await request(path);
  const text = await response.text();
  observations.push({ check: "sensitive-path", path, status: response.status });
  if (response.status >= 200 && response.status < 300) {
    fail(`${path} unexpectedly public (HTTP ${response.status})`);
  }
  if (/BEGIN [A-Z ]*PRIVATE KEY|OPENAI_API_KEY|TWILIO_AUTH_TOKEN|DATABASE_URL/i.test(text)) {
    fail(`${path} response leaked a secret-shaped value`);
  }
}

for (const method of ["POST", "PUT", "PATCH", "DELETE", "TRACE"]) {
  let response;
  try {
    response = await request("/", {
      method,
      body: method === "POST" || method === "PUT" || method === "PATCH"
        ? "{}"
        : undefined,
      headers: { "content-type": "application/json" },
    });
    observations.push({ check: "unsafe-method", method, status: response.status });
    if (response.status >= 200 && response.status < 300) {
      fail(`${method} / unexpectedly succeeded with HTTP ${response.status}`);
    }
  } catch (error) {
    observations.push({
      check: "unsafe-method",
      method,
      networkRejected: true,
      message: String(error?.message || error),
    });
  }
}

const marker = "MOS_REDTEAM_" + Date.now();
const injected = encodeURIComponent(`<script>${marker}</script>`);
const reflected = await request("/?q=" + injected, { redirect: "follow" });
const reflectedHtml = await reflected.text();
if (reflectedHtml.includes(marker)) {
  fail("query marker reflected into homepage HTML");
}
observations.push({
  check: "query-reflection",
  status: reflected.status,
  reflected: reflectedHtml.includes(marker),
});

const redirectTarget = "https://example.invalid/mos-redteam";
const redirectProbe = await request("/?next=" + encodeURIComponent(redirectTarget));
observations.push({
  check: "open-redirect",
  status: redirectProbe.status,
  location: redirectProbe.headers.get("location"),
});
if ((redirectProbe.headers.get("location") || "").startsWith("https://example.invalid")) {
  fail("homepage query produced external redirect");
}

const missing = await request("/redteam-definitely-missing-" + Date.now(), {
  redirect: "follow",
});
const missingText = await missing.text();
observations.push({ check: "missing-route", status: missing.status });
if (missing.status !== 404) fail(`missing route returned HTTP ${missing.status}`);
if (/stack trace|node_modules|at \w+ \([^\n]+:\d+:\d+\)/i.test(missingText)) {
  fail("404 response appears to expose a stack trace");
}

const evilOrigin = "https://evil.example.invalid";
const corsProbe = await request("/", {
  headers: { origin: evilOrigin },
  redirect: "follow",
});
observations.push({
  check: "cors-observation",
  status: corsProbe.status,
  allowOrigin: corsProbe.headers.get("access-control-allow-origin"),
});

console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  origin,
  requestBudget: 1 + sensitivePaths.length + 5 + 1 + 1 + 1 + 1,
  failures,
  observations,
  ok: failures.length === 0,
}, null, 2));

if (failures.length) process.exitCode = 1;
