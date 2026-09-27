import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs, { mkdtempSync, rmSync } from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const OUT = path.resolve("out");
const EDGE_CANDIDATES = [
  process.env.BROWSER_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/microsoft-edge",
  "/usr/bin/microsoft-edge-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
].filter(Boolean);
const BROWSER = EDGE_CANDIDATES.find((candidate) => fs.existsSync(candidate));
if (!BROWSER) {
  throw new Error("browser smoke requires Microsoft Edge/Chromium; set BROWSER_PATH");
}
if (!fs.existsSync(path.join(OUT, "index.html"))) {
  throw new Error("browser smoke requires a completed static export in out/");
}

const routes = ["/", "/create/", "/demo/", "/features/", "/pricing/", "/security/"];
const viewports = [
  { name: "mobile", width: 390, height: 844, mobile: true },
  { name: "tablet", width: 768, height: 1024, mobile: true },
  { name: "desktop", width: 1440, height: 900, mobile: false },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exportedFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  if (!clean) return path.join(OUT, "index.html");
  const direct = path.join(OUT, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(OUT, clean, "index.html");
  return fs.existsSync(index) ? index : null;
}

function serveExport() {
  const server = http.createServer((req, res) => {
    const file = exportedFile(req.url || "/");
    if (!file) {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(path.join(OUT, "404.html")));
      return;
    }
    const ext = path.extname(file).toLowerCase();
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
      assert.ok(address && typeof address === "object");
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
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
}

async function connectCdp(port) {
  const deadline = Date.now() + 15000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      const page = pages.find((item) => item.type === "page") || pages[0];
      if (!page?.webSocketDebuggerUrl) throw new Error("no page target");
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
  return result.result?.value;
}

async function waitForReady(cdp) {
  for (let i = 0; i < 60; i++) {
    if ((await evaluate(cdp, "document.readyState")) === "complete") break;
    await wait(100);
  }
  await evaluate(
    cdp,
    "document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)",
  );
  await wait(150);
}

const { server, origin } = await serveExport();
const debugPort = 9440 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(path.join(os.tmpdir(), "mos-browser-smoke-"));
const child = spawn(BROWSER, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${profile}`,
  `--remote-debugging-port=${debugPort}`,
  "--remote-allow-origins=*",
  origin + "/",
], { stdio: "ignore" });

const failures = [];
const observations = [];
let cdp;

try {
  cdp = await connectCdp(debugPort);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  for (const viewport of viewports) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile,
    });

    for (const route of routes) {
      await cdp.send("Page.navigate", { url: origin + route });
      await waitForReady(cdp);
      const raw = await evaluate(cdp, `JSON.stringify({
        route: location.pathname,
        title: document.title,
        h1: document.querySelector("h1")?.textContent?.trim() || "",
        innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body?.scrollWidth || 0,
        main: Boolean(document.querySelector("#main")),
        focusables: document.querySelectorAll("a[href],button,input,select,textarea,summary").length,
        createCta: Boolean(document.querySelector('a[href="/create/"]')),
      })`);
      const state = JSON.parse(raw);
      observations.push({ viewport: viewport.name, ...state });

      const maxWidth = Math.max(state.scrollWidth, state.bodyScrollWidth);
      if (maxWidth > state.clientWidth + 1) {
        failures.push(
          `${viewport.name} ${route}: horizontal overflow ${maxWidth} > ${state.clientWidth}`,
        );
      }
      if (!state.main) failures.push(`${viewport.name} ${route}: #main missing`);
      if (!state.h1) failures.push(`${viewport.name} ${route}: h1 missing`);
      if (state.focusables < 1) failures.push(`${viewport.name} ${route}: no focusable controls`);
      if (route !== "/create/" && !state.createCta) {
        failures.push(`${viewport.name} ${route}: Create CTA missing`);
      }
    }
  }

  console.log(JSON.stringify({
    ok: failures.length === 0,
    browser: BROWSER,
    origin,
    viewportCount: viewports.length,
    routeCount: routes.length,
    checks: observations.length,
    failures,
    observations,
  }, null, 2));
} finally {
  try { cdp?.ws.close(); } catch {}
  child.kill("SIGTERM");
  server.close();
  await wait(300);
  rmSync(profile, { recursive: true, force: true, maxRetries: 4 });
}

if (failures.length) process.exitCode = 1;
