import assert from "node:assert/strict";
import fs, { mkdirSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { firefox, webkit } from "playwright";

const OUT = path.resolve("out");
const ARTIFACTS = path.resolve(".browser-cross-engine");
const routes = ["/", "/create/", "/demo/", "/features/", "/pricing/", "/security/"];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];
const engines = [
  { name: "firefox", browserType: firefox },
  { name: "webkit", browserType: webkit },
];

if (!fs.existsSync(path.join(OUT, "index.html"))) {
  throw new Error("cross-engine smoke requires a completed static export in out/");
}

function exportedFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
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
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

function serveExport() {
  const server = http.createServer((req, res) => {
    const file = exportedFile(req.url || "/");
    if (!file) {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(path.join(OUT, "404.html")));
      return;
    }
    res.writeHead(200, {
      "content-type": contentType(file),
      "cache-control": "no-store",
    });
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

function routeSlug(route) {
  return route === "/" ? "home" : route.replaceAll("/", "-").replace(/^-|-$/g, "");
}

rmSync(ARTIFACTS, { recursive: true, force: true });
mkdirSync(ARTIFACTS, { recursive: true });

const { server, origin } = await serveExport();
const failures = [];
const observations = [];

try {
  for (const engine of engines) {
    let browser;
    try {
      browser = await engine.browserType.launch({ headless: true });
    } catch (error) {
      throw new Error(
        `${engine.name} browser is unavailable. Run "npm run browser:install". ${error.message}`,
      );
    }

    try {
      for (const viewport of viewports) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const page = await context.newPage();
        await page.route("**/v1/public/website-events", (route) =>
          route.fulfill({
            status: 202,
            contentType: "application/json",
            body: '{"status":"accepted_for_browser_smoke"}',
          }),
        );
        const pageErrors = [];
        const consoleErrors = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });

        for (const route of routes) {
          pageErrors.length = 0;
          consoleErrors.length = 0;
          const response = await page.goto(origin + route, {
            waitUntil: "networkidle",
            timeout: 30000,
          });
          await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
          await page.waitForTimeout(100);

          const state = await page.evaluate(() => ({
            route: location.pathname,
            title: document.title,
            h1: document.querySelector("h1")?.textContent?.trim() || "",
            innerWidth,
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body?.scrollWidth || 0,
            main: Boolean(document.querySelector("#main")),
            focusables: document.querySelectorAll(
              "a[href],button,input,select,textarea,summary",
            ).length,
            createCta: Boolean(document.querySelector('a[href="/create/"]')),
            nativeForms: document.querySelectorAll("form").length,
            bodyText: document.body?.innerText || "",
          }));

          const prefix = `${engine.name} ${viewport.name} ${route}`;
          const maxWidth = Math.max(state.scrollWidth, state.bodyScrollWidth);
          if (!response?.ok()) failures.push(`${prefix}: HTTP ${response?.status() ?? "none"}`);
          if (maxWidth > state.clientWidth + 1) {
            failures.push(`${prefix}: horizontal overflow ${maxWidth} > ${state.clientWidth}`);
          }
          if (!state.main) failures.push(`${prefix}: #main missing`);
          if (!state.h1) failures.push(`${prefix}: h1 missing`);
          if (state.focusables < 1) failures.push(`${prefix}: no focusable controls`);
          if (route !== "/create/" && !state.createCta) {
            failures.push(`${prefix}: Create CTA missing`);
          }
          if (route === "/create/") {
            if (state.nativeForms !== 0) failures.push(`${prefix}: native form regression`);
            if (!state.bodyText.includes("Check this website")) {
              failures.push(`${prefix}: create journey content missing`);
            }
          }
          for (const message of pageErrors) failures.push(`${prefix}: pageerror: ${message}`);
          for (const message of consoleErrors) failures.push(`${prefix}: console error: ${message}`);

          observations.push({
            engine: engine.name,
            viewport: viewport.name,
            route,
            status: response?.status() ?? null,
            clientWidth: state.clientWidth,
            scrollWidth: maxWidth,
            h1: state.h1,
            focusables: state.focusables,
            pageErrors: pageErrors.length,
            consoleErrors: consoleErrors.length,
          });

          if (failures.some((failure) => failure.startsWith(prefix))) {
            await page.screenshot({
              path: path.join(
                ARTIFACTS,
                `${engine.name}-${viewport.name}-${routeSlug(route)}.png`,
              ),
              fullPage: true,
            });
          }
        }
        await context.close();
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  server.close();
}

const report = {
  ok: failures.length === 0,
  engines: engines.map((engine) => engine.name),
  viewportCount: viewports.length,
  routeCount: routes.length,
  checks: observations.length,
  failures,
  observations,
};
writeFileSync(
  path.join(ARTIFACTS, "latest.json"),
  JSON.stringify(report, null, 2) + "\n",
);

console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
