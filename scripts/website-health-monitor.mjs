const origin = (process.env.WEBSITE_SITE_URL ||
  "https://worksmartos.co.uk").replace(/\/$/, "");
const controlPlane = (process.env.WEBSITE_CONTROL_PLANE ||
  "https://rsfm-control-plane-production.up.railway.app").replace(/\/$/, "");

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

console.log(JSON.stringify({
  checkedAt: new Date().toISOString(),
  origin,
  internalPathCount: internalPaths.size,
  pagesAndAssetsChecked,
  failures,
  ok: failures.length === 0,
}, null, 2));

if (failures.length) process.exitCode = 1;
