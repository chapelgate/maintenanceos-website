import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs, { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const OUT = path.resolve("out");
const SCAN_PORT = Number(process.env.CREATE_ACCEPTANCE_SCAN_PORT || 18788);
const LEAD_PORT = Number(process.env.CREATE_ACCEPTANCE_LEAD_PORT || 18789);
const EXPECTED_SCAN_ENDPOINT = "http://127.0.0.1:" + SCAN_PORT + "/scan";
const EXPECTED_LEAD_ENDPOINT = "http://127.0.0.1:" + LEAD_PORT + "/leads";

const BROWSER_CANDIDATES = [
  process.env.BROWSER_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
const BROWSER = BROWSER_CANDIDATES.find((candidate) => fs.existsSync(candidate));
if (!BROWSER) throw new Error("mobile create acceptance requires Chromium/Edge; set BROWSER_PATH");
if (!fs.existsSync(path.join(OUT, "create", "index.html"))) {
  throw new Error("mobile create acceptance requires a completed static export in out/");
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const laterChunk = walk(path.join(OUT, "_next", "static"))
  .filter((file) => file.endsWith(".js"))
  .find((file) => fs.readFileSync(file, "utf8").includes("Request received"));
assert.ok(laterChunk, "could not identify the Create later-steps chunk");
const laterChunkRelative = path.relative(OUT, laterChunk).split(path.sep).join("/");

const state = {
  scriptDelayMs: 0,
  laterChunkDelayMs: 0,
  laterChunkDelayed: false,
  scanMode: "success",
  scanDelayMs: 0,
  scanPosts: 0,
  leadMode: "accepted",
  leadDelayMs: 0,
  leadPosts: [],
};

const scanFixture = {
  ok: true,
  draft: {
    businessName: "Alley Gates",
    hours: "Monday-Friday 9am-5pm",
    services: "Alley gate installation\nAlley gate repairs",
    faqs: "Do you repair existing alley gates? Yes.",
  },
  fieldMeta: {
    businessName: { source: "title", confidence: "high" },
    hours: { source: "pattern", confidence: "medium" },
    services: { source: "heading", confidence: "medium" },
    faqs: { source: "details", confidence: "high" },
  },
  facts: {
    website: "https://alleygates.co.uk/",
    businessName: "Alley Gates",
    locations: ["18 Brisbane Avenue Wallasey Merseyside CH45 9XJ"],
    contact: {
      phones: ["0151 230 8476"],
      emails: ["info@alleygates.co.uk"],
    },
    services: ["Alley gate installation", "Alley gate repairs"],
    hours: "Monday-Friday 9am-5pm",
    faqs: [
      {
        question: "Do you repair existing alley gates?",
        answer: "Yes.",
      },
    ],
  },
  factMeta: {
    businessName: { source: "title", confidence: "high" },
    locations: { source: "pattern", confidence: "medium" },
    contact: { source: "contact_link", confidence: "high" },
    services: { source: "heading", confidence: "medium" },
    hours: { source: "pattern", confidence: "medium" },
    faqs: { source: "details", confidence: "high" },
  },
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exportedFile(urlPath) {
  const clean = decodeURIComponent((urlPath || "/").split("?")[0]).replace(/^\/+/, "");
  if (!clean) return path.join(OUT, "index.html");
  const direct = path.join(OUT, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(OUT, clean, "index.html");
  return fs.existsSync(index) ? index : null;
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".woff2") return "font/woff2";
  return "application/octet-stream";
}

function listen(server, host, port = 0) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      assert.ok(address && typeof address === "object");
      resolve(address.port);
    });
  });
}

function cors(req) {
  return {
    "Access-Control-Allow-Origin": String(req.headers.origin || "*"),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "60",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

const staticServer = http.createServer(async (req, res) => {
  const file = exportedFile(req.url || "/");
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
    return;
  }
  const rel = path.relative(OUT, file).split(path.sep).join("/");
  let delay = file.endsWith(".js") ? state.scriptDelayMs : 0;
  if (rel === laterChunkRelative && state.laterChunkDelayMs > 0) {
    delay = Math.max(delay, state.laterChunkDelayMs);
    state.laterChunkDelayed = true;
  }
  if (delay) await wait(delay);
  res.writeHead(200, {
    "Content-Type": contentType(file),
    "Cache-Control": "no-store",
  });
  res.end(fs.readFileSync(file));
});

const scanServer = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors(req));
    res.end();
    return;
  }
  if (req.url !== "/scan" || req.method !== "POST") {
    res.writeHead(404, cors(req));
    res.end(JSON.stringify({ ok: false }));
    return;
  }
  state.scanPosts += 1;
  await readJson(req);
  if (state.scanDelayMs) await wait(state.scanDelayMs);
  if (state.scanMode === "failure") {
    res.writeHead(503, { ...cors(req), "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "synthetic scan failure" }));
    return;
  }
  res.writeHead(200, { ...cors(req), "Content-Type": "application/json" });
  res.end(JSON.stringify(scanFixture));
});

const leadServer = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors(req));
    res.end();
    return;
  }
  if (req.url !== "/leads" || req.method !== "POST") {
    res.writeHead(404, cors(req));
    res.end(JSON.stringify({ ok: false }));
    return;
  }
  const body = await readJson(req);
  state.leadPosts.push(body);
  if (state.leadDelayMs) await wait(state.leadDelayMs);
  res.setHeader("Content-Type", "application/json");
  for (const [key, value] of Object.entries(cors(req))) res.setHeader(key, value);
  if (state.leadMode === "email_failure") {
    res.statusCode = 503;
    res.end(JSON.stringify({
      detail: "lead recorded; customer confirmation is temporarily unavailable",
    }));
    return;
  }
  if (state.leadMode === "operator_failure") {
    res.statusCode = 503;
    res.end(JSON.stringify({
      detail: "lead recorded; operator notification is temporarily unavailable",
    }));
    return;
  }
  if (state.leadMode === "rejected") {
    res.statusCode = 422;
    res.end(JSON.stringify({ detail: "synthetic request rejected" }));
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify({
    ok: true,
    mode: "accepted",
    reference: "acceptance-ref-" + String(state.leadPosts.length).padStart(3, "0"),
    confirmation_email: "accepted",
  }));
});

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id && this.pending.has(msg.id)) {
        const pending = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) pending.reject(new Error(JSON.stringify(msg.error)));
        else pending.resolve(msg.result);
        return;
      }
      if (msg.method && this.handlers.has(msg.method)) {
        for (const handler of this.handlers.get(msg.method)) handler(msg.params || {});
      }
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(method, handler) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(handler);
  }
}

async function connectCdp(port) {
  const deadline = Date.now() + 15000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const pages = await fetch("http://127.0.0.1:" + port + "/json/list").then((r) => r.json());
      const page = pages.find((item) => item.type === "page") || pages[0];
      if (!page || !page.webSocketDebuggerUrl) throw new Error("no page target");
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        ws.addEventListener("open", resolve, { once: true });
        ws.addEventListener("error", reject, { once: true });
      });
      return new Cdp(ws);
    } catch (error) {
      lastError = error;
      await wait(150);
    }
  }
  throw lastError;
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error("browser evaluation failed: " + JSON.stringify(result.exceptionDetails));
  }
  return result.result ? result.result.value : undefined;
}

async function waitFor(cdp, expression, label, timeout = 20000) {
  const deadline = Date.now() + timeout;
  let last;
  while (Date.now() < deadline) {
    try {
      last = await evaluate(cdp, expression);
      if (last) return last;
    } catch (error) {
      last = String(error);
    }
    await wait(100);
  }
  throw new Error("timed out waiting for " + label + "; last=" + String(last));
}

async function setNamed(cdp, name, value) {
  const ok = await evaluate(
    cdp,
    "(() => { const el=document.querySelector('[name=" + JSON.stringify(name) + "]');" +
      " if(!el) return false;" +
      " const setter=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value').set;" +
      " setter.call(el," + JSON.stringify(value) + ");" +
      " el.dispatchEvent(new Event('input',{bubbles:true}));" +
      " el.dispatchEvent(new Event('change',{bubbles:true})); return true; })()",
  );
  assert.equal(ok, true, "field " + name + " must exist");
}

async function clickPrimary(cdp) {
  const ok = await evaluate(
    cdp,
    "(() => { const b=document.querySelector('[data-create-primary-action]');" +
      " if(!b || b.disabled) return false; b.click(); return true; })()",
  );
  assert.equal(ok, true, "primary action should be clickable");
}

async function clickPrimaryTwice(cdp) {
  const ok = await evaluate(
    cdp,
    "(() => { const b=document.querySelector('[data-create-primary-action]');" +
      " if(!b || b.disabled) return false; b.click(); b.click(); return true; })()",
  );
  assert.equal(ok, true, "primary action should accept synthetic double tap");
}

async function valueForLabel(cdp, labelText) {
  return evaluate(
    cdp,
    "(() => { const labels=[...document.querySelectorAll('label')];" +
      " const label=labels.find(x => x.textContent.trim().startsWith(" + JSON.stringify(labelText) + "));" +
      " if(!label) return null; const el=label.querySelector('input,textarea,select');" +
      " return el ? el.value : null; })()",
  );
}

async function prepareCreate(cdp, origin) {
  await cdp.send("Page.navigate", { url: origin + "/create/" });
  await waitFor(
    cdp,
    "document.querySelector('[data-create-step=\"1\"]') && document.querySelector('[data-create-primary-action]')",
    "Create step 1",
  );
  await waitFor(
    cdp,
    "!document.querySelector('[data-create-primary-action]').disabled",
    "hydrated Create primary action",
  );
}

async function enterStepOne(cdp, email) {
  await setNamed(cdp, "businessUrl", "https://alleygates.co.uk/");
  await setNamed(cdp, "name", "Mobile Acceptance");
  await setNamed(cdp, "email", email);
  await setNamed(cdp, "organisation", "Chapelgate acceptance");
  await clickPrimaryTwice(cdp);
  await waitFor(
    cdp,
    "document.querySelector('[data-create-step=\"2\"]')",
    "Create step 2",
  );
  assert.equal(await evaluate(cdp, "location.pathname"), "/create/");
}

async function waitForScanAndAssertPrefill(cdp) {
  await waitFor(
    cdp,
    "document.querySelector('[data-create-step=\"2\"] [data-create-primary-action]') && !document.querySelector('[data-create-step=\"2\"] [data-create-primary-action]').disabled",
    "scan completion",
    30000,
  );
  await clickPrimary(cdp);
  await waitFor(cdp, "document.querySelector('[data-create-step=\"3\"]')", "Create step 3");
  const radio = await evaluate(
    cdp,
    "(() => { const r=document.querySelector('input[name=\"agent-type\"]'); if(!r) return false; r.click(); return true; })()",
  );
  assert.equal(radio, true, "an agent role must be available");
  await clickPrimary(cdp);
  await waitFor(cdp, "document.querySelector('[data-create-step=\"4\"]')", "Create step 4");

  assert.equal(await valueForLabel(cdp, "Business name"), "Alley Gates");
  assert.equal(await valueForLabel(cdp, "Greeting"), "", "greeting must not be invented");
  assert.match(await valueForLabel(cdp, "Locations"), /18 Brisbane Avenue/);
  assert.equal(await valueForLabel(cdp, "Phone"), "0151 230 8476");
  assert.equal(await valueForLabel(cdp, "Contact email"), "info@alleygates.co.uk");
  assert.match(await valueForLabel(cdp, "Hours"), /Monday-Friday 9am-5pm/);
  assert.match(await valueForLabel(cdp, "Services"), /Alley gate repairs/);
  assert.match(await valueForLabel(cdp, "FAQs"), /Do you repair existing alley gates/);
}

async function generateReview(cdp) {
  await clickPrimary(cdp);
  await waitFor(cdp, "document.querySelector('[data-create-step=\"5\"]')", "Create step 5", 30000);
}

async function assertMissingReviewFeedback(cdp) {
  const before = state.leadPosts.length;
  await clickPrimary(cdp);
  await waitFor(
    cdp,
    "document.querySelector('[role=\"alert\"]') && document.querySelector('[role=\"alert\"]').textContent.includes('Complete every required review confirmation')",
    "visible missing-review error",
  );
  assert.equal(state.leadPosts.length, before, "invalid review must not post a lead");
  const focused = await evaluate(
    cdp,
    "document.activeElement && document.activeElement.getAttribute('role') === 'alert'",
  );
  assert.equal(focused, true, "review error should receive focus");
}

async function completeReview(cdp) {
  const count = await evaluate(
    cdp,
    "(() => { const boxes=[...document.querySelectorAll('[data-create-step=\"5\"] input[type=\"checkbox\"]')].filter(x=>!x.disabled);" +
      " boxes.forEach(x=>{ if(!x.checked) x.click(); }); return boxes.length; })()",
  );
  assert.ok(count >= 1, "required review checkboxes should exist");
  await waitFor(
    cdp,
    "document.body.textContent.includes('All required customer-review confirmations are complete.')",
    "complete review status",
  );
}

async function finishAcceptedJourney(cdp, email, expectedMode) {
  const before = state.leadPosts.length;
  state.leadMode = expectedMode;
  state.leadDelayMs = 900;
  await clickPrimaryTwice(cdp);
  await wait(200);
  assert.equal(state.leadPosts.length, before + 1, "double tap must create exactly one lead POST");
  await waitFor(cdp, "document.querySelector('[data-create-success]')", "persistent request receipt", 20000);

  const receipt = await evaluate(cdp, "document.querySelector('[data-create-success]').textContent");
  assert.match(receipt, /Request received/);
  assert.match(receipt, /request has been recorded/i);
  if (expectedMode === "accepted") {
    assert.match(receipt, /acceptance-ref-/);
    assert.equal(receipt.includes("Confirmation email: accepted for delivery to " + email), true);
  } else if (expectedMode === "email_failure") {
    assert.match(receipt, /delivery handoff failed/i);
    assert.match(receipt, /request remains recorded/i);
    assert.doesNotMatch(receipt, /accepted for delivery/i);
  }
  await wait(400);
  assert.equal(state.leadPosts.length, before + 1, "success state must not resubmit");
  const submitted = state.leadPosts[state.leadPosts.length - 1];
  assert.equal(submitted.lead_type, "create_receptionist");
  assert.match(String(submitted.submission_id || ""), /^create-[A-Za-z0-9-]{8,}$/);
  assert.ok(String(submitted.message || "").length > 3000, "reviewed Create payload must reproduce the legacy 3,000-character rejection class");
}

async function runFullJourney(cdp, origin, email, leadMode) {
  state.scanMode = "success";
  state.scanDelayMs = 1000;
  state.laterChunkDelayMs = 1400;
  state.laterChunkDelayed = false;
  await prepareCreate(cdp, origin);
  await enterStepOne(cdp, email);
  await waitForScanAndAssertPrefill(cdp);
  await generateReview(cdp);
  await assertMissingReviewFeedback(cdp);
  await completeReview(cdp);
  await finishAcceptedJourney(cdp, email, leadMode);
}

const staticPort = await listen(staticServer, "127.0.0.1", 0);
await listen(scanServer, "127.0.0.1", SCAN_PORT);
await listen(leadServer, "127.0.0.1", LEAD_PORT);
const origin = "http://127.0.0.1:" + staticPort;

const debugPort = 9700 + Math.floor(Math.random() * 200);
const profile = mkdtempSync(path.join(os.tmpdir(), "mos-create-mobile-"));
const child = spawn(BROWSER, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-background-networking",
  "--disable-component-update",
  "--user-data-dir=" + profile,
  "--remote-debugging-port=" + debugPort,
  "--remote-allow-origins=*",
  origin + "/",
], { stdio: "ignore" });

const consoleErrors = [];
const exceptions = [];
const navigations = [];
let cdp;

try {
  cdp = await connectCdp(debugPort);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Log.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 120,
    downloadThroughput: 700 * 1024,
    uploadThroughput: 300 * 1024,
    connectionType: "cellular3g",
  });

  cdp.on("Runtime.consoleAPICalled", (params) => {
    if (params.type === "error") consoleErrors.push(params);
  });
  cdp.on("Runtime.exceptionThrown", (params) => exceptions.push(params));
  cdp.on("Page.frameNavigated", (params) => {
    if (params.frame && !params.frame.parentId) navigations.push(params.frame.url);
  });
  cdp.on("Log.entryAdded", (params) => {
    if (params.entry && params.entry.level === "error") consoleErrors.push(params.entry);
  });

  state.scriptDelayMs = 2500;
  const navBefore = navigations.length;
  await cdp.send("Page.navigate", { url: origin + "/create/" });
  await waitFor(
    cdp,
    "document.querySelector('[data-create-step=\"1\"]') && document.querySelector('[data-create-primary-action]')",
    "server-rendered Create controls",
  );
  const preHydration = JSON.parse(await evaluate(cdp, "JSON.stringify((() => { const b=document.querySelector('[data-create-primary-action]'); return {type:b.type,disabled:b.disabled,text:b.textContent.trim(),path:location.pathname}; })())"));
  assert.deepEqual(preHydration, {
    type: "button",
    disabled: true,
    text: "Loading form…",
    path: "/create/",
  });
  await evaluate(cdp, "document.querySelector('[data-create-primary-action]').click()");
  await wait(300);
  assert.equal(await evaluate(cdp, "location.pathname"), "/create/");
  assert.equal(navigations.length, navBefore + 1, "pre-hydration tap must not cause a second navigation");

  state.scriptDelayMs = 0;
  state.leadPosts.length = 0;
  state.scanPosts = 0;
  await runFullJourney(cdp, origin, "mobile.acceptance@example.com", "accepted");
  assert.ok(state.laterChunkDelayed, "Step 2 dynamic chunk must have been deliberately delayed");
  assert.equal(state.scanPosts, 1, "Step 1 double tap must trigger one scan");
  assert.equal(state.leadPosts.length, 1, "final double tap must store one request");

  await evaluate(cdp, "history.back()");
  await waitFor(cdp, "location.pathname === '/'", "browser Back to previous page");
  await evaluate(cdp, "history.forward()");
  await waitFor(cdp, "location.pathname === '/create/'", "browser Forward to Create");
  await waitFor(cdp, "document.querySelector('[data-create-step=\"1\"]')", "fresh Step 1 after deliberate navigation");

  state.scanMode = "failure";
  state.scanDelayMs = 700;
  const scanPostsBefore = state.scanPosts;
  await enterStepOne(cdp, "scan.failure@example.com");
  await waitFor(
    cdp,
    "document.body.textContent.includes('The scan service could not process this URL')",
    "visible scan failure",
    30000,
  );
  assert.equal(await evaluate(cdp, "location.pathname"), "/create/");
  assert.equal(state.scanPosts, scanPostsBefore + 1);
  assert.equal(
    await evaluate(cdp, "!document.querySelector('[data-create-step=\"2\"] [data-create-primary-action]').disabled"),
    true,
    "scan failure must not dead-end the journey",
  );

  state.leadPosts.length = 0;
  state.scanMode = "success";
  await runFullJourney(cdp, origin, "email.failure@example.com", "email_failure");
  assert.equal(state.leadPosts.length, 1);

  assert.equal(exceptions.length, 0, "browser must not raise uncaught JavaScript exceptions");
  assert.equal(consoleErrors.length, 0, "browser must not emit console errors");

  console.log(JSON.stringify({
    ok: true,
    browser: BROWSER,
    viewport: "390x844@2x",
    cpuThrottle: 4,
    network: {
      latencyMs: 120,
      downloadBytesPerSecond: 700 * 1024,
      uploadBytesPerSecond: 300 * 1024,
    },
    expectedScanEndpoint: EXPECTED_SCAN_ENDPOINT,
    expectedLeadEndpoint: EXPECTED_LEAD_ENDPOINT,
    delayedLaterChunk: laterChunkRelative,
    navigations,
    scanPosts: state.scanPosts,
    finalLeadPosts: state.leadPosts.length,
    finalSubmissionId: state.leadPosts[0] ? state.leadPosts[0].submission_id : null,
    finalMessageChars: state.leadPosts[0] ? String(state.leadPosts[0].message || "").length : 0,
    consoleErrors: consoleErrors.length,
    exceptions: exceptions.length,
  }, null, 2));
} finally {
  try { if (cdp) cdp.ws.close(); } catch {}
  child.kill("SIGTERM");
  staticServer.close();
  scanServer.close();
  leadServer.close();
  await wait(300);
  rmSync(profile, { recursive: true, force: true, maxRetries: 4 });
}
