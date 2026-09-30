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

if (!BROWSER) throw new Error("create interactive acceptance requires Chromium");
if (!fs.existsSync(path.join(OUT, "create", "index.html"))) {
  throw new Error("create interactive acceptance requires a completed static export");
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    if (ext === ".js") await delay(500);
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
    returnByValue: true,
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

async function setControl(cdp, selector, value) {
  const expression = `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return false;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (!setter) return false;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`;
  assert.equal(await evalValue(cdp, expression), true);
}

async function setByLabel(cdp, labelText, value) {
  const expression = `(() => {
    const label = Array.from(document.querySelectorAll("label")).find((item) =>
      (item.querySelector("span")?.textContent || "").trim().startsWith(${JSON.stringify(labelText)})
    );
    const el = label?.querySelector("input,textarea");
    if (!el) return false;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (!setter) return false;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  })()`;
  assert.equal(await evalValue(cdp, expression), true, "missing field: " + labelText);
}

async function clickPrimary(cdp) {
  assert.equal(await evalValue(cdp, `(() => {
    const b = document.querySelector("[data-create-primary-action]");
    if (!b || b.disabled) return false;
    b.click();
    return true;
  })()`), true);
}

function leadRequests(cdp) {
  return cdp.events.filter((event) => {
    if (event.method !== "Network.requestWillBeSent") return false;
    const url = event.params?.request?.url || "";
    return url.includes("/v1/public/website-leads") || url.includes("127.0.0.1:8787/leads");
  });
}

const site = await serveExport();
const debugPort = 9850 + Math.floor(Math.random() * 100);
const profile = mkdtempSync(path.join(os.tmpdir(), "mos-create-interactive-"));
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
  "about:blank",
], { stdio: "ignore" });

let cdp;
try {
  cdp = await connectCdp(debugPort);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  });

  await cdp.send("Page.navigate", { url: site.origin + "/create/" });
  await waitFor(cdp, `document.querySelector("[data-create-hydrated]")?.getAttribute("data-create-hydrated") === "true"`, 20000);

  await setControl(cdp, 'input[name="businessUrl"]', "https://alleygates.co.uk");
  await setControl(cdp, 'input[name="name"]', "Interactive Acceptance");
  await setControl(cdp, 'input[name="email"]', "interactive@example.com");
  await setControl(cdp, 'input[name="organisation"]', "Chapelgate");
  await clickPrimary(cdp);

  await waitFor(cdp, `document.querySelector("[data-create-step]")?.getAttribute("data-create-step") === "2"`);
  await waitFor(cdp, `(() => { const b=document.querySelector("[data-create-primary-action]"); return Boolean(b && !b.disabled); })()`, 10000);
  await clickPrimary(cdp);

  await waitFor(cdp, `document.querySelector("[data-create-step]")?.getAttribute("data-create-step") === "3"`);
  assert.equal(await evalValue(cdp, `(() => { const el=document.querySelector('[data-agent-type="receptionist"] input'); if(!el)return false; el.click(); return true; })()`), true);
  await waitFor(cdp, `(() => { const b=document.querySelector("[data-create-primary-action]"); return Boolean(b && !b.disabled); })()`);
  await clickPrimary(cdp);

  await waitFor(cdp, `document.querySelector("[data-create-step]")?.getAttribute("data-create-step") === "4"`);
  await setByLabel(cdp, "Greeting", "Thank you for calling Alley Gates. How can I help?");
  await setByLabel(cdp, "Hours", "Monday-Friday 09:00-17:00");
  await setByLabel(cdp, "Services", "Alley Gate Installation\nGate Repairs");
  await clickPrimary(cdp);

  await waitFor(cdp, `document.querySelector("[data-create-step]")?.getAttribute("data-create-step") === "5"`, 15000);
  await waitFor(cdp, `Boolean(document.getElementById("interactive-receptionist-demo"))`, 15000);
  assert.equal(await evalValue(cdp, `document.querySelector("[data-create-primary-action]")?.textContent?.trim()`), "Try your receptionist");
  assert.equal(leadRequests(cdp).length, 0, "no lead/email request should occur before optional save");

  await clickPrimary(cdp);
  assert.equal(leadRequests(cdp).length, 0, "Try your receptionist must not submit a lead");

  await waitFor(cdp, `Array.from(document.querySelectorAll("#interactive-receptionist-demo button")).some((b) => b.textContent?.trim() === "Start demo call")`);
  assert.equal(await evalValue(cdp, `(() => {
    const b = Array.from(document.querySelectorAll("#interactive-receptionist-demo button")).find((item) => item.textContent?.trim() === "Start demo call");
    if (!b) return false;
    b.click();
    return true;
  })()`), true);

  await waitFor(cdp, `document.querySelector("[data-demo-transcript]")?.innerText.includes("Thank you for calling Alley Gates")`);
  await setControl(cdp, '#interactive-receptionist-demo input[placeholder="e.g. What time are you open?"]', "What services do you offer?");
  assert.equal(await evalValue(cdp, `(() => {
    const b = Array.from(document.querySelectorAll("#interactive-receptionist-demo button")).find((item) => item.textContent?.trim() === "Send");
    if (!b || b.disabled) return false;
    b.click();
    return true;
  })()`), true);

  await waitFor(cdp, `document.querySelector("[data-demo-transcript]")?.innerText.includes("Alley Gate Installation")`);
  const transcript = await evalValue(cdp, `document.querySelector("[data-demo-transcript]")?.innerText || ""`);
  assert.match(transcript, /What services do you offer\?/);
  assert.match(transcript, /Alley Gate Installation/);
  assert.match(transcript, /Gate Repairs/);
  assert.equal(leadRequests(cdp).length, 0, "interactive demo must remain independent of lead/email submission");
  assert.equal(await evalValue(cdp, `Boolean(document.querySelector('[data-create-submit-state="success"]'))`), false);

  const exceptions = cdp.events.filter((event) => event.method === "Runtime.exceptionThrown");
  assert.deepEqual(exceptions, []);

  console.log(JSON.stringify({
    ok: true,
    browser: BROWSER,
    siteOrigin: site.origin,
    viewport: "390x844@3",
    primaryAction: "Try your receptionist",
    interactiveDemo: true,
    callerQuestion: "What services do you offer?",
    packAwareReply: /Alley Gate Installation/.test(transcript) && /Gate Repairs/.test(transcript),
    leadRequestsBeforeOptionalSave: leadRequests(cdp).length,
    runtimeExceptions: exceptions.length,
  }));
} finally {
  try { cdp?.ws?.close(); } catch {}
  try { child.kill(); } catch {}
  await new Promise((resolve) => site.server.close(resolve));
  rmSync(profile, { recursive: true, force: true });
}
