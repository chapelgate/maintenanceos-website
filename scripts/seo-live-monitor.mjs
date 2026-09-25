const origin = (process.env.SEO_SITE_URL || "https://seahorse-app-4oasq.ondigitalocean.app").replace(/\/$/, "");
const pages = [
  "/", "/property-maintenance-software/", "/ai-receptionist/", "/features/", "/how-it-works/",
  "/industries/", "/industries/landlords/", "/industries/letting-agents/",
  "/industries/property-managers/", "/industries/maintenance-companies/",
  "/industries/housing-associations/", "/industries/facilities-management/",
  "/industries/councils/", "/industries/holiday-lets/",
];

function firstMatch(html, pattern) { return html.match(pattern)?.[1]?.trim() || ""; }
async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "MaintenanceOS-SEO-Monitor/1.0" }, redirect: "follow" });
  return { response, text: await response.text() };
}

const results = [], failures = [], seenTitles = new Map(), seenDescriptions = new Map();
for (const path of pages) {
  const url = origin + path;
  try {
    const { response, text: html } = await fetchText(url);
    const title = firstMatch(html, /<title>([^<]*)<\/title>/i);
    const description = firstMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    const canonical = firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
    const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>/gi)].length;
    results.push({ path, status: response.status, title, description, canonical, noindex, jsonLdBlocks });
    if (response.status !== 200) failures.push(`${path}: HTTP ${response.status}`);
    if (!title) failures.push(`${path}: missing title`);
    if (!description) failures.push(`${path}: missing meta description`);
    if (canonical !== url) failures.push(`${path}: canonical mismatch (${canonical || "missing"})`);
    if (noindex) failures.push(`${path}: noindex present`);
    if (jsonLdBlocks < 1) failures.push(`${path}: missing JSON-LD`);
    if (title) { const prior = seenTitles.get(title); if (prior) failures.push(`${path}: duplicate title with ${prior}`); seenTitles.set(title, path); }
    if (description) { const prior = seenDescriptions.get(description); if (prior) failures.push(`${path}: duplicate description with ${prior}`); seenDescriptions.set(description, path); }
  } catch (error) {
    failures.push(`${path}: fetch failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

try {
  const [{ response: robotsResponse, text: robots }, { response: sitemapResponse, text: sitemap }] =
    await Promise.all([fetchText(origin + "/robots.txt"), fetchText(origin + "/sitemap.xml")]);
  if (robotsResponse.status !== 200) failures.push("robots.txt: not 200");
  if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) failures.push("robots.txt: sitemap declaration missing or wrong");
  if (sitemapResponse.status !== 200) failures.push("sitemap.xml: not 200");
  for (const path of pages) if (!sitemap.includes(`<loc>${origin + path}</loc>`)) failures.push(`${path}: missing from sitemap`);
} catch (error) {
  failures.push(`robots/sitemap fetch failed: ${error instanceof Error ? error.message : String(error)}`);
}

const report = { checkedAt: new Date().toISOString(), origin, pages: results, failures, ok: failures.length === 0 };
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
