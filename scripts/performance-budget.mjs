import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "out");

// Next 16 ships a larger raw framework runtime than Next 15. Guard both the
// uncompressed payload and the network-relevant gzip size so upgrades cannot
// hide transfer regressions behind a raised raw ceiling.
// Budgets can be overridden via environment variables (e.g., for S19 CI gate).
const JS_RAW_BUDGET = parseInt(process.env.JS_RAW_BUDGET || "600", 10) * 1024;
const JS_GZIP_BUDGET = parseInt(process.env.JS_GZIP_BUDGET || "190", 10) * 1024;
const CSS_BUDGET = parseInt(process.env.CSS_BUDGET || "120", 10) * 1024;

if (!fs.existsSync(OUT)) {
  console.error("out/ is missing. Run npm run build first.");
  process.exit(2);
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "index.html") htmlFiles.push(full);
  }
}
walk(OUT);

const failures = [];
const rows = [];

function localAssetBuffer(urlPath) {
  const clean = urlPath.split("?")[0].split("#")[0];
  if (!clean.startsWith("/")) return null;
  const full = path.join(OUT, clean.replace(/^\/+/, ""));
  return fs.existsSync(full) ? fs.readFileSync(full) : null;
}

function localAssetBytes(urlPath) {
  return localAssetBuffer(urlPath)?.length ?? 0;
}

function localAssetGzipBytes(urlPath) {
  const bytes = localAssetBuffer(urlPath);
  return bytes ? zlib.gzipSync(bytes, { level: 9 }).length : 0;
}

for (const htmlFile of htmlFiles) {
  const html = fs.readFileSync(htmlFile, "utf8");
  const rel = path.relative(OUT, htmlFile).replace(/\\/g, "/");
  const route = rel === "index.html" ? "/" : "/" + rel.replace(/index\.html$/, "");

  const js = new Set(
    [...html.matchAll(/<script[^>]+src=["']([^"']+\.js(?:\?[^"']*)?)["']/gi)]
      .map((m) => m[1])
      .filter((src) => src.startsWith("/")),
  );
  const css = new Set(
    [...html.matchAll(/<link[^>]+href=["']([^"']+\.css(?:\?[^"']*)?)["']/gi)]
      .map((m) => m[1])
      .filter((href) => href.startsWith("/")),
  );

  const jsBytes = [...js].reduce((sum, src) => sum + localAssetBytes(src), 0);
  const jsGzipBytes = [...js].reduce(
    (sum, src) => sum + localAssetGzipBytes(src),
    0,
  );
  const cssBytes = [...css].reduce((sum, href) => sum + localAssetBytes(href), 0);
  rows.push({ route, jsBytes, jsGzipBytes, cssBytes });

  if (jsBytes > JS_RAW_BUDGET) {
    failures.push(
      `${route}: initial first-party JS raw ${Math.round(jsBytes / 1024)} KB exceeds ${Math.round(JS_RAW_BUDGET / 1024)} KB`,
    );
  }
  if (jsGzipBytes > JS_GZIP_BUDGET) {
    failures.push(
      `${route}: initial first-party JS gzip ${Math.round(jsGzipBytes / 1024)} KB exceeds ${Math.round(JS_GZIP_BUDGET / 1024)} KB`,
    );
  }
  if (cssBytes > CSS_BUDGET) {
    failures.push(
      `${route}: initial first-party CSS ${Math.round(cssBytes / 1024)} KB exceeds ${Math.round(CSS_BUDGET / 1024)} KB`,
    );
  }
  if (/<script[^>]+src=["']https?:\/\//i.test(html)) {
    failures.push(`${route}: third-party script source found`);
  }
}

rows.sort((a, b) => b.jsBytes - a.jsBytes);
console.log(JSON.stringify({
  checkedPages: rows.length,
  budgets: {
    jsRawBytes: JS_RAW_BUDGET,
    jsGzipBytes: JS_GZIP_BUDGET,
    cssBytes: CSS_BUDGET,
  },
  largestInitialJs: rows.slice(0, 5).map((r) => ({
    route: r.route,
    jsRawKB: Math.round(r.jsBytes / 1024),
    jsGzipKB: Math.round(r.jsGzipBytes / 1024),
    cssKB: Math.round(r.cssBytes / 1024),
  })),
  failures,
  ok: failures.length === 0,
}, null, 2));

if (failures.length) process.exitCode = 1;
