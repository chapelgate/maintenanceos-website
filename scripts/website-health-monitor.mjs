import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");

const origin = (process.env.WEBSITE_SITE_URL ||
  "https://worksmartos.co.uk").replace(/\/$/, "");
const controlPlaneRaw = process.env.WEBSITE_CONTROL_PLANE;
const controlPlane = controlPlaneRaw && controlPlaneRaw.trim() !== ""
  ? controlPlaneRaw.replace(/\/$/, "")
  : null;

function bust(url) {
  return url + (url.includes("?") ? "&" : "?") + "website_check=" + Date.now();
}

async function request(url, options = {}, cacheBust = true) {
  const response = await fetch(cacheBust ? bust(url) : url, {
    redirect: "follow",
    headers: {
      "user-agent": "MaintenanceOS-Website-Monitor/1.0",
      "cache-control": "no-cache",
      pragma: "no-cache",
      ...(options.headers || {}),
    },
    ...options,
  });
  return response;
}

const failures = [];
const internalPaths = new Set();
const assetUrls = new Set();
let pagesAndAssetsChecked = 0;

const sitemapResponse = await request(origin + "/sitemap.xml");
const sitemap = await sitemapResponse.text();
if (sitemapResponse.status !== 200) failures.push("sitemap.xml is not 200");

for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(match[1]);
  if (url.origin === new URL(origin).origin) internalPaths.add(url.pathname);
}

for (const path of [...internalPaths]) {
  const response = await request(origin + path);
  pagesAndAssetsChecked += 1;
  if (response.status !== 200) {
    failures.push(`${path}: HTTP ${response.status}`);
    continue;
  }
  const html = await response.text();

  if (/<script[^>]+src=["']https?:\/\//i.test(html)) {
    failures.push(`${path}: third-party script source found`);
  }

  for (const match of html.matchAll(/href=["']([^"']+)["']/g)) {
    const href = match[1];
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) continue;
    let url;
    try {
      url = new URL(href, origin);
    } catch {
      continue;
    }
    if (url.origin !== new URL(origin).origin) continue;
    internalPaths.add(url.pathname);
  }

  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    let url;
    try {
      url = new URL(match[1], origin);
    } catch {
      continue;
    }
    if (
      url.origin === new URL(origin).origin &&
      (url.pathname.startsWith("/_next/") ||
        /\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname))
    ) {
      assetUrls.add(url.toString());
    }
  }
}

for (const path of [...internalPaths].sort()) {
  if ([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].some((m) => new URL(m[1]).pathname === path)) {
    continue;
  }
  const response = await request(origin + path);
  pagesAndAssetsChecked += 1;
  if (response.status >= 400) {
    failures.push(`${path}: broken internal link HTTP ${response.status}`);
  }
}

for (const url of [...assetUrls].sort()) {
  const response = await request(url);
  pagesAndAssetsChecked += 1;
  if (response.status >= 400) {
    failures.push(`${new URL(url).pathname}: asset HTTP ${response.status}`);
  }
}

if (controlPlane) {
  const ready = await request(controlPlane + "/ready");
  const readyText = await ready.text();
  if (ready.status !== 200 || !/"backend"\s*:\s*"postgres"/.test(readyText)) {
    failures.push("control plane backend is not ready on durable Postgres");
  }

  const preflight = await request(
    controlPlane + "/v1/public/website-events",
    {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    },
    false,
  );
  if (preflight.status >= 400) {
    failures.push(`website event CORS preflight HTTP ${preflight.status}`);
  }
  if (preflight.headers.get("access-control-allow-origin") !== origin) {
    failures.push("website event CORS origin mismatch");
  }
}

for (const path of [...internalPaths].sort()) {
  if (!isContentHtmlPage(path)) continue;
  const htmlPath = exportedHtmlFile(path);
  if (!htmlPath) continue;
  const html = fs.readFileSync(htmlPath, "utf8");
  if (!/<html lang="en-GB">/.test(html)) {
    failures.push(`${path}: missing lang="en-GB"`);
  }
  if (!/<main id="main"/.test(html)) {
    failures.push(`${path}: missing main landmark #main`);
  }
  if (!/Skip to main content/.test(html)) {
    failures.push(`${path}: missing skip-to-main link`);
  }
  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=/.test(img[0])) {
      failures.push(`${path}: image without alt text`);
    }
  }
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  let previous = 0;
  let headingOrderOk = true;
  for (const [, level] of headings) {
    const current = Number(level);
    if (previous > 0 && current > previous + 1) headingOrderOk = false;
    previous = current;
  }
  if (!headingOrderOk) {
    failures.push(`${path}: heading levels skip`);
  }
}

function isContentHtmlPage(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  if (!clean) return true;
  if (clean.startsWith("_next/")) return false;
  if (clean.startsWith(".well-known/")) return false;
  if (clean === "humans.txt") return false;
  if (clean === "icon.png") return false;
  if (clean === "robots.txt") return false;
  if (clean === "sitemap.xml") return false;
  if (clean.startsWith("cdn-cgi/")) return false;
  if (/\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?|txt|xml|json)$/i.test(clean)) return false;
  return true;
}

function exportedHtmlFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/^\/+/, "");
  if (!clean) return path.join(OUT, "index.html");
  const direct = path.join(OUT, clean);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const index = path.join(OUT, clean, "index.html");
  if (fs.existsSync(index)) return index;
  return null;
}

console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  origin,
  internalPathCount: internalPaths.size,
  pagesAndAssetsChecked,
  failures,
  ok: failures.length === 0,
}, null, 2));

if (failures.length) process.exitCode = 1;
