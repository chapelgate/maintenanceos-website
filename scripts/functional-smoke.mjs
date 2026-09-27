import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createFormStubServer } from "./form-stub-server.mjs";

const OUT = path.resolve("out");
if (!fs.existsSync(path.join(OUT, "index.html"))) {
  throw new Error("functional smoke requires a completed static export in out/");
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function exportedFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  if (!clean) return path.join(OUT, "index.html");
  const direct = path.join(OUT, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(OUT, clean, "index.html");
  if (fs.existsSync(index)) return index;
  return null;
}

function staticServer() {
  return http.createServer((req, res) => {
    const file = exportedFile(req.url || "/");
    if (!file) {
      const notFound = path.join(OUT, "404.html");
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fs.existsSync(notFound) ? fs.readFileSync(notFound) : "Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(fs.readFileSync(file));
  });
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  return `http://127.0.0.1:${address.port}`;
}

async function close(server) {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}

const web = staticServer();
const recorded = [];
const { server: forms } = createFormStubServer({
  appendLead: (record) => recorded.push(record),
});

const failures = [];
let origin;
let formOrigin;

try {
  origin = await listen(web);
  formOrigin = await listen(forms);

  const sitemap = await fetch(origin + "/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  assert.ok(paths.length >= 20, "expected full public sitemap");

  for (const route of paths) {
    const response = await fetch(origin + route);
    if (response.status !== 200) failures.push(`${route}: HTTP ${response.status}`);
  }

  const checks = [
    ["/", /Turn maintenance requests into clear, controlled work\./],
    ["/create/", /Website[\s\S]*Check[\s\S]*Review[\s\S]*Pack/],
    ["/demo/", /fictional SAMPLE data|SAMPLE call/i],
    ["/contact/", /Send a message/],
    ["/features/", /VERIFIED[\s\S]*UNDER TEST/],
    ["/security/", /Security and accountability by design/],
  ];
  for (const [route, pattern] of checks) {
    const text = await (await fetch(origin + route)).text();
    if (!pattern.test(text)) failures.push(`${route}: expected content missing`);
  }

  const missing = await fetch(origin + "/definitely-not-a-route/");
  if (missing.status !== 404) failures.push(`404 route returned ${missing.status}`);

  const valid = await fetch(formOrigin + "/leads", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({
      lead_type: "contact",
      email: "smoke@example.test",
      source: "continuation-step6-functional-smoke",
    }),
  });
  if (valid.status !== 200) failures.push(`valid form POST HTTP ${valid.status}`);
  if (recorded.length !== 1) failures.push("valid form did not create one local record");

  const invalid = await fetch(formOrigin + "/leads", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ lead_type: "contact", email: "not-an-email" }),
  });
  if (invalid.status !== 400) failures.push(`invalid form POST HTTP ${invalid.status}`);

  const honeypot = await fetch(formOrigin + "/leads", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({
      lead_type: "contact",
      email: "bot@example.test",
      website: "https://spam.invalid",
    }),
  });
  if (honeypot.status !== 200) failures.push(`honeypot POST HTTP ${honeypot.status}`);
  if (recorded.length !== 1) failures.push("honeypot created a lead record");

  const release = JSON.parse(
    await (await fetch(origin + "/release.json")).text(),
  );
  if (!/^[0-9a-f]{40}$/i.test(String(release.commit || ""))) {
    failures.push("release marker does not contain a full commit SHA");
  }

  console.log(JSON.stringify({
    ok: failures.length === 0,
    origin,
    sitemapRoutes: paths.length,
    localLeadRecords: recorded.length,
    failures,
  }, null, 2));
} finally {
  await Promise.allSettled([close(web), close(forms)]);
}

if (failures.length) process.exitCode = 1;
