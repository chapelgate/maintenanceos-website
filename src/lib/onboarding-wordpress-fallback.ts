import { extractDraftFromHtml } from "../../packages/onboarding-ingest/src/extract.ts";

const WORDPRESS_TIMEOUT_MS = 14_000;
const WORDPRESS_SITE_MAX_BYTES = 128 * 1024;
const WORDPRESS_PAGES_MAX_BYTES = 512 * 1024;
const WORDPRESS_MAX_PAGES = 20;

type WordPressRendered = { rendered?: unknown };
type WordPressPage = {
  link?: unknown;
  title?: WordPressRendered;
  excerpt?: WordPressRendered;
  content?: WordPressRendered;
};

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function sameHttpsOriginLink(value: unknown, origin: URL): string {
  if (typeof value !== "string") return origin.toString();
  try {
    const parsed = new URL(value);
    if (parsed.protocol === "https:" && parsed.origin === origin.origin) {
      return parsed.toString();
    }
  } catch {
    // Fall back to the already validated business origin.
  }
  return origin.toString();
}

async function readBoundedJson(
  response: Response,
  maxBytes: number,
): Promise<unknown | null> {
  if (!response.ok) return null;
  const type = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!type.includes("application/json")) return null;

  const declared = Number(response.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) return null;

  const text = await response.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function isWordPressFallbackEligible(
  status: number,
  body: unknown,
): boolean {
  if (status !== 422 || !body || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }
  return (body as { error?: unknown }).error === "fetch_failed";
}

export function mapWordPressRestFallback(
  businessUrl: string,
  sitePayload: unknown,
  pagesPayload: unknown,
): Record<string, unknown> | null {
  let origin: URL;
  try {
    origin = new URL(businessUrl);
  } catch {
    return null;
  }
  if (origin.protocol !== "https:") return null;
  if (!Array.isArray(pagesPayload) || pagesPayload.length === 0) return null;

  const pages = pagesPayload
    .slice(0, WORDPRESS_MAX_PAGES)
    .filter((item): item is WordPressPage => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((page) => ({
      url: sameHttpsOriginLink(page.link, origin),
      html:
        `<title>${asText(page.title?.rendered)}</title>` +
        asText(page.excerpt?.rendered) +
        asText(page.content?.rendered),
    }))
    .filter((page) => page.html.trim().length > 15);

  if (!pages.length) return null;

  // Keep the submitted public URL as the provenance root. The rendered
  // WordPress page bodies remain untrusted website content.
  const extracted = extractDraftFromHtml([
    { url: origin.toString(), html: "" },
    ...pages,
  ]);

  const draft: Record<string, string> = { ...extracted.draft };
  const facts: Record<string, unknown> = { ...extracted.facts };
  const fieldMeta: Record<string, unknown> = { ...extracted.fieldMeta };
  const factMeta: Record<string, unknown> = { ...extracted.factMeta };

  const site =
    sitePayload && typeof sitePayload === "object" && !Array.isArray(sitePayload)
      ? (sitePayload as Record<string, unknown>)
      : null;
  const siteName = typeof site?.name === "string" ? site.name.trim().slice(0, 200) : "";
  if (siteName) {
    draft.businessName = siteName;
    facts.businessName = siteName;
    fieldMeta.businessName = {
      confidence: "high",
      source: "wordpress_rest",
    };
    factMeta.businessName = {
      confidence: "high",
      source: "wordpress_rest",
    };
  }

  facts.website = origin.toString();
  factMeta.website = {
    confidence: "high",
    source: "fetched_url",
  };

  if (!Object.keys(draft).length) return null;

  return {
    ok: true,
    untrusted: true,
    draft,
    facts,
    fieldMeta,
    factMeta,
    warnings: [
      "wordpress_rest_browser_fallback",
      ...extracted.warnings,
    ],
  };
}

/**
 * Browser-only recovery path for a public WordPress site after the server
 * scanner has already passed URL/DNS SSRF validation but could not fetch any
 * public page. CORS remains authoritative: no proxying, credentials or bypass.
 */
export async function requestWordPressRestFallback(
  businessUrl: string,
): Promise<Record<string, unknown> | null> {
  let origin: URL;
  try {
    origin = new URL(businessUrl);
  } catch {
    return null;
  }
  if (origin.protocol !== "https:") return null;

  const siteUrl = new URL("/wp-json/", origin);
  const pagesUrl = new URL("/wp-json/wp/v2/pages", origin);
  pagesUrl.searchParams.set("per_page", String(WORDPRESS_MAX_PAGES));
  pagesUrl.searchParams.set("_fields", "link,title,content,excerpt,slug");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WORDPRESS_TIMEOUT_MS);
  const init: RequestInit = {
    method: "GET",
    mode: "cors",
    credentials: "omit",
    cache: "no-store",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    signal: controller.signal,
  };

  try {
    const [siteResult, pagesResult] = await Promise.allSettled([
      fetch(siteUrl, init).then((res) =>
        readBoundedJson(res, WORDPRESS_SITE_MAX_BYTES),
      ),
      fetch(pagesUrl, init).then((res) =>
        readBoundedJson(res, WORDPRESS_PAGES_MAX_BYTES),
      ),
    ]);

    const sitePayload =
      siteResult.status === "fulfilled" ? siteResult.value : null;
    const pagesPayload =
      pagesResult.status === "fulfilled" ? pagesResult.value : null;
    return mapWordPressRestFallback(
      origin.toString(),
      sitePayload,
      pagesPayload,
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
