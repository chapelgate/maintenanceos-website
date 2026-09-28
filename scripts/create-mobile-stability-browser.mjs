import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs, { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const OUT = path.resolve("out");
const BROWSER = [
  process.env.BROWSER_PATH,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean).find((candidate) => fs.existsSync(candidate));

if (!BROWSER) throw new Error("create mobile stability test requires Chromium");
if (!fs.existsSync(path.join(OUT, "create", "index.html"))) {
  throw new Error("create mobile stability test requires a completed static export");
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const receiverPort = Number(process.env.CREATE_TEST_RECEIVER_PORT || 8787);
const scannerPort = Number(process.env.CREATE_TEST_SCANNER_PORT || 8788);
const submissions = new Map();
let rawPosts = 0;
let storedRequests = 0;
let emailHandoffs = 0;

function sendJson(res, status, body, origin) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": origin || "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, Accept",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

const receiver = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "*";
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, Accept",
    });
    res.end();
    return;
  }
  if (req.method !== "POST" || req.url !== "/leads") {
    sendJson(res, 404, { ok: false, error: "not found" }, origin);
    return;
  }
  rawPosts += 1;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const submissionId = String(body.submission_id || "");
  assert.match(submissionId, /^[A-Za-z0-9_.:-]{8,128}$/);
  assert.ok(String(body.message || "").length > 3000, "create payload must exceed old 3,000-char limit");
  let record = submissions.get(submissionId);
  if (!record) {
    storedRequests += 1;
    const failedEmail = String(body.email || "").toLowerCase() === "mailfail@example.com";
    record = {
      reference: "test-" + submissionId.slice(0, 12),
      confirmation: failedEmail ? "failed" : "accepted",
    };
    submissions.set(submissionId, record);
    if (!failedEmail) emailHandoffs += 1;
  }
  await delay(250);
  sendJson(res, 200, {
    ok: true,
    mode: "accepted",
    reference: record.reference,
    confirmation_email: record.confirmation,
  }, origin);
});

const scanner = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "*";
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, Accept",
    });
    res.end();
    return;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  await delay(700);
  if (String(body.url || "").includes("scan-fail.example")) {
    sendJson(res, 503, { ok: false, error: "temporary scan failure" }, origin);
    return;
  }
  sendJson(res, 200, {
    draft: {
      businessName: "Alley Gates",
      greeting: "",
      hours: "Monday-Friday 09:00-17:00",
      services: "Alley Gate Installation\\nGate Repairs",
      faqs: "How do I order a key?\\nUse the key ordering page."
    },
    fieldMeta: {
      businessName: { source: "title", confidence: "high" },
      hours: { source: "pattern", confidence: "medium" },
      services: { source: "heading", confidence: "medium" },
      faqs: { source: "details", confidence: "medium" }
    },
    facts: {
      website: "https://alleygates.co.uk/",
      businessName: "Alley Gates",
      locations: ["18 Brisbane Avenue Wallasey Merseyside CH45 9JX"],
      contact: { phones: ["0151 230 8476"], emails: ["info@alleygates.co.uk"] },
      hours: "Monday-Friday 09:00-17:00",
      services: ["Alley Gate Installation", "Gate Repairs"],
      faqs: [{ question: "How do I order a key?", answer: "Use the key ordering page." }]
    },
    factMeta: {
      website: { source: "fetched_url", confidence: "high" },
      businessName: { source: "title", confidence: "high" },
      locations: { source: "heading", confidence: "medium" },
      contact: { source: "contact_link", confidence: "high" },
      hours: { source: "pattern", confidence: "medium" },
      services: { source: "heading", confidence: "medium" },
      faqs: { source: "details", confidence: "medium" }
    }
  }, origin);
});

function exportedFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  if (!clean) return path.join(OUT, "index.html");
  const direct = path.join(OUT, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(OUT, clean, "index.html");
  return fs.existsSync(index) ? index : null;
}

function serveExport() {
  const server = http.createServer(async (req, res) => {
    const file = exportedFile(req.url || "/");
    if (!file) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found");
      return;
    }
    const ext = path.extname(file).toLowerCase();
    if (ext === ".js") await delay(1400);
    const contentType =
      ext === ".html" ? "text/html; charset=utf-8" :
      ext === ".css" ? "text/css; charset=utf-8" :
      ext === ".js" ? "text/javascript; charset=utf-8" :
      ext === ".json" ? "application/json; charset=utf-8" :
      ext === ".svg" ? "image/svg+xml" :
      "application/octet-stream";
    res.writeHead(200, { "content-type": contentType, "cache-control": "no-store" });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, origin: "http://127.0.0.1:" + address.port });
    });
  });
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id && this.pending.has(msg.id)) {
        const item = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) item.reject(new Error(JSON.stringify(msg.error)));
        else item.resolve(msg.result);
        return;
      }
      if (msg.method) this.events.push(msg);
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function connectCdp(port) {
  const deadline = Date.now() + 15000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const pages = await fetch("http://127.0.0.1:" + port + "/json/list").then((r) => r.json());
      const page = pages.find((item) => item.type === "page") || pages[0];
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        ws.addEventListener("open", resolve, { once: true });
        ws.addEventListener("error", reject, { once: true });
      });
      return new Cdp(ws);
    } catch (error) {
      lastError = error;
      await delay(100);
    }
  }
  throw lastError;
}

async function evalValue(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result && result.result.value;
}

async function waitFor(cdp, expression, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      if (await evalValue(cdp, expression)) return;
    } catch {}
    await delay(100);
  }
  throw new Error("timed out waiting for: " + expression);
}

async function setInput(cdp, selector, value) {
  const expression =
    "(() => { const el=document.querySelector(" + JSON.stringify(selector) + ");" +
    "if(!el)return false;el.value=" + JSON.stringify(value) + ";" +
    "el.dispatchEvent(new Event('input',{bubbles:true}));" +
    "el.dispatchEvent(new Event('change',{bubbles:true}));return true;})()";
  assert.equal(await evalValue(cdp, expression), true);
}

async function clickPrimary(cdp, doubleTap = false) {
  const expression =
    "(() => { const b=document.querySelector('[data-create-primary-action]');" +
    "if(!b)return false;b.click();" + (doubleTap ? "b.click();" : "") + "return true;})()";
  assert.equal(await evalValue(cdp, expression), true);
}

async function prepareCreate(cdp, siteOrigin, email, businessUrl = "https://alleygates.co.uk") {
  await cdp.send("Page.navigate", { url: siteOrigin + "/create/" });
  await waitFor(cdp, "Boolean(document.querySelector('[data-create-step=\"1\"]'))", 6000);
  const initial = JSON.parse(await evalValue(cdp,
    "JSON.stringify({href:location.href,historyLength:history.length," +
    "hydrated:document.querySelector('[data-create-hydrated]')?.getAttribute('data-create-hydrated')," +
    "disabled:document.querySelector('[data-create-primary-action]')?.disabled," +
    "nativeForm:Boolean(document.querySelector('.create-journey-card form'))})"
  ));
  assert.equal(initial.hydrated, "false");
  assert.equal(initial.disabled, true);
  assert.equal(initial.nativeForm, false);

  await clickPrimary(cdp, true);
  await delay(350);
  assert.equal(await evalValue(cdp, "location.href"), initial.href);

  await waitFor(cdp,
    "document.querySelector('[data-create-hydrated]')?.getAttribute('data-create-hydrated') === 'true'",
    20000
  );
  await setInput(cdp, 'input[name="businessUrl"]', businessUrl);
  await setInput(cdp, 'input[name="name"]', "Mobile Acceptance");
  await setInput(cdp, 'input[name="email"]', email);
  await setInput(cdp, 'input[name="organisation"]', "Chapelgate");
  await clickPrimary(cdp, true);
  await waitFor(cdp,
    "document.querySelector('[data-create-step]')?.getAttribute('data-create-step') === '2'",
    8000
  );
  assert.equal(await evalValue(cdp, "location.pathname"), "/create/");
  return initial.historyLength;
}

async function finishJourney(cdp, initialHistoryLength) {
  await waitFor(cdp,
    "(() => { const b=document.querySelector('[data-create-primary-action]'); return b && !b.disabled && b.textContent !== 'Checking…'; })()",
    20000
  );
  await clickPrimary(cdp);
  await waitFor(cdp, "document.querySelector('[data-create-step]')?.getAttribute('data-create-step') === '3'");

  await evalValue(cdp, "document.querySelector('[data-agent-type=\"receptionist\"] input')?.click()");
  await waitFor(cdp, "!document.querySelector('[data-create-primary-action]')?.disabled");
  await clickPrimary(cdp);
  await waitFor(cdp, "document.querySelector('[data-create-step]')?.getAttribute('data-create-step') === '4'");

  const prefill = JSON.parse(await evalValue(cdp,
    "JSON.stringify(Array.from(document.querySelectorAll('label')).reduce((out,label)=>{" +
    "const title=label.querySelector('span')?.textContent?.trim()||'';" +
    "const control=label.querySelector('input,textarea');if(control)out[title]=control.value;return out;},{}))"
  ));
  assert.equal(prefill["Business name"], "Alley Gates");
  assert.match(prefill["Locations"] || "", /Brisbane Avenue/);
  assert.match(prefill["Phone"] || "", /0151 230 8476/);
  assert.equal(prefill["Contact email"], "info@alleygates.co.uk");
  assert.match(prefill["Services"] || "", /Alley Gate Installation/);

  await clickPrimary(cdp);
  await waitFor(cdp, "document.querySelector('[data-create-step]')?.getAttribute('data-create-step') === '5'", 15000);

  await clickPrimary(cdp);
  await waitFor(cdp, "document.body.innerText.includes('Complete every required review confirmation before submitting this configuration.')");
  assert.equal(await evalValue(cdp, "location.pathname"), "/create/");

  await evalValue(cdp,
    "(() => { for (const cb of document.querySelectorAll('[data-agent-review-gate] input[type=checkbox]')) {" +
    "if(!cb.checked)cb.click();} return true; })()"
  );
  await waitFor(cdp, "document.body.innerText.includes('All required customer-review confirmations are complete.')");

  await clickPrimary(cdp, true);
  await waitFor(cdp, "document.querySelector('[data-create-submit-state=\"success\"]') !== null", 15000);
  assert.equal(await evalValue(cdp, "location.pathname"), "/create/");
  assert.equal(await evalValue(cdp, "history.length"), initialHistoryLength);
  return await evalValue(cdp, "document.body.innerText");
}

await new Promise((resolve) => receiver.listen(receiverPort, "127.0.0.1", resolve));
await new Promise((resolve) => scanner.listen(scannerPort, "127.0.0.1", resolve));
const site = await serveExport();
const siteOrigin = site.origin;

const debugPort = 9800 + Math.floor(Math.random() * 100);
const profile = mkdtempSync(path.join(os.tmpdir(), "mos-create-mobile-"));
const child = spawn(BROWSER, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--no-first-run",
  "--no-default-browser-check",
  "--user-data-dir=" + profile,
  "--remote-debugging-port=" + debugPort,
  "--remote-allow-origins=*",
  "about:blank"
], { stdio: "ignore" });

let cdp;
try {
  cdp = await connectCdp(debugPort);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390, height: 844, deviceScaleFactor: 3, mobile: true
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 250,
    downloadThroughput: 180000,
    uploadThroughput: 75000,
    connectionType: "cellular3g"
  });

  const history1 = await prepareCreate(cdp, siteOrigin, "success@example.com");
  const successText = await finishJourney(cdp, history1);
  assert.match(successText, /Test submission completed/);
  assert.match(successText, /preview receiver accepted the test submission/i);
  assert.equal(rawPosts, 1);
  assert.equal(storedRequests, 1);
  assert.equal(emailHandoffs, 1);

  const history2 = await prepareCreate(cdp, siteOrigin, "mailfail@example.com");
  const degradedText = await finishJourney(cdp, history2);
  assert.match(degradedText, /Test submission completed/);
  assert.match(degradedText, /preview receiver accepted the test submission/i);
  assert.equal(rawPosts, 2);
  assert.equal(storedRequests, 2);
  assert.equal(emailHandoffs, 1);

  await prepareCreate(cdp, siteOrigin, "scan@example.com", "https://scan-fail.example");
  await waitFor(cdp, "document.body.innerText.includes('The scan service could not process this URL')", 20000);
  await waitFor(cdp, "!document.querySelector('[data-create-primary-action]')?.disabled");
  await clickPrimary(cdp);
  await waitFor(cdp, "document.querySelector('[data-create-step]')?.getAttribute('data-create-step') === '3'");
  assert.equal(await evalValue(cdp, "location.pathname"), "/create/");

  const exceptions = cdp.events.filter((event) => event.method === "Runtime.exceptionThrown");
  const unexpectedNavigations = cdp.events
    .filter((event) => event.method === "Page.frameNavigated")
    .map((event) => event.params && event.params.frame && event.params.frame.url)
    .filter((url) => typeof url === "string" && url && !url.startsWith(siteOrigin + "/create/") && url !== "about:blank");
  assert.deepEqual(exceptions, []);
  assert.deepEqual(unexpectedNavigations, []);

  console.log(JSON.stringify({
    ok: true,
    browser: BROWSER,
    siteOrigin,
    mobileViewport: "390x844@3",
    cpuThrottle: 6,
    networkLatencyMs: 250,
    jsDelayMs: 1400,
    rawPosts,
    storedRequests,
    emailHandoffs,
    submissions: submissions.size,
    observedNetworkRequests: cdp.events.filter((event) => event.method === "Network.requestWillBeSent").length
  }, null, 2));
} finally {
  try { if (cdp) cdp.ws.close(); } catch {}
  child.kill("SIGTERM");
  receiver.close();
  scanner.close();
  site.server.close();
  await delay(300);
  rmSync(profile, { recursive: true, force: true, maxRetries: 4 });
}
