import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "out");

const JS_BUDGET = 525 * 1024;
const CSS_BUDGET = 120 * 1024;

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

function localAssetBytes(urlPath) {
  const clean = urlPath.split("?")[0].split("#")[0];
  if (!clean.startsWith("/")) return 0;
  const full = path.join(OUT, clean.replace(/^\/+/, ""));
  return fs.existsSync(full) ? fs.statSync(full).size : 0;
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
  const cssBytes = [...css].reduce((sum, href) => sum + localAssetBytes(href), 0);
  rows.push({ route, jsBytes, cssBytes });

  if (jsBytes > JS_BUDGET) {
    failures.push(
      `${route}: initial first-party JS ${Math.round(jsBytes / 1024)} KB exceeds ${Math.round(JS_BUDGET / 1024)} KB`,
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
  budgets: { jsBytes: JS_BUDGET, cssBytes: CSS_BUDGET },
  largestInitialJs: rows.slice(0, 5).map((r) => ({
    route: r.route,
    jsKB: Math.round(r.jsBytes / 1024),
    cssKB: Math.round(r.cssBytes / 1024),
  })),
  failures,
  ok: failures.length === 0,
}, null, 2));

if (failures.length) process.exitCode = 1;
