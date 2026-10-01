import {
  extractDraftFromHtml,
  stripHtmlToText,
} from "../../packages/onboarding-ingest/src/extract.ts";

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

const NON_SERVICE_PAGE_RE =
  /^(?:home|homepage|contact(?: us)?|gallery|shop|cart|checkout|my account|privacy(?: policy)?|terms(?: and conditions)?|communication preferences|delivery and returns policy|about(?: us)?|blog|news|testimonials?|first inner page)$/i;

function cleanRenderedText(value: unknown): string {
  return stripHtmlToText(asText(value)).replace(/\s+/g, " ").trim();
}

function serviceTitleFromPage(page: WordPressPage): string | null {
  const title = cleanRenderedText(page.title?.rendered).slice(0, 160);
  if (!title || NON_SERVICE_PAGE_RE.test(title)) return null;
  const body = asText(page.content?.rendered) + asText(page.excerpt?.rendered);
  if (cleanRenderedText(body).length < 20) return null;
  return title;
}

function usefulExtractionPage(page: WordPressPage): boolean {
  const title = cleanRenderedText(page.title?.rendered);
  const slug = asText((page as { slug?: unknown }).slug).toLowerCase();
  if (slug === "home" || slug === "homepage") return true;
  if (/faq|frequently-asked/.test(slug)) return true;
  return Boolean(serviceTitleFromPage(page));
}

function sameOriginShopLink(html: string, origin: URL): string | null {
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const raw = match[1] ?? "";
    if (!/\/shop\/?(?:[?#]|$)/i.test(raw)) continue;
    try {
      const link = new URL(raw, origin);
      if (link.protocol === "https:" && link.origin === origin.origin) {
        return link.toString();
      }
    } catch {
      // Ignore malformed public page links.
    }
  }
  return null;
}

function keyOrderFaq(
  pages: WordPressPage[],
  origin: URL,
): { question: string; answer: string } | null {
  for (const page of pages) {
    const html =
      asText(page.excerpt?.rendered) + " " + asText(page.content?.rendered);
    const text = stripHtmlToText(html).replace(/\s+/g, " ").trim();
    if (!/\bkeys?\b/i.test(text)) continue;
    if (!/\b(?:order|ordered|made to order|deliver|delivery|buy|purchase|shop)\b/i.test(text)) {
      continue;
    }

    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const sentence =
      sentences.find(
        (item) =>
          /\bkeys?\b/i.test(item) &&
          /\b(?:order|ordered|made to order|deliver|delivery|buy|purchase|shop)\b/i.test(item),
      ) ??
      text.match(/.{0,80}\bkeys?\b.{0,420}/i)?.[0]?.trim() ??
      "";

    if (!sentence) continue;
    const bounded = sentence.slice(0, 600);
    const shop = sameOriginShopLink(html, origin);
    return {
      question: "How do I order alley gate keys?",
      answer: shop
        ? `${bounded} Online ordering page: ${shop}`
        : bounded,
    };
  }
  return null;
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

  const rawPages = pagesPayload
    .slice(0, WORDPRESS_MAX_PAGES)
    .filter(
      (item): item is WordPressPage =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    );

  if (!rawPages.length) return null;

  const extractionPages = rawPages
    .filter(usefulExtractionPage)
    .map((page) => ({
      url: sameHttpsOriginLink(page.link, origin),
      html:
        `<title>${asText(page.title?.rendered)}</title>` +
        asText(page.excerpt?.rendered) +
        asText(page.content?.rendered),
    }))
    .filter((page) => page.html.trim().length > 15);

  if (!extractionPages.length) return null;

  // Keep the submitted public URL as the provenance root. Only public
  // WordPress pages with business-facing content are passed to the generic
  // extractor; account/policy/cart pages are deliberately excluded.
  const extracted = extractDraftFromHtml([
    { url: origin.toString(), html: "" },
    ...extractionPages,
  ]);

  const draft: Record<string, string> = { ...extracted.draft };
  const facts: Record<string, unknown> = { ...extracted.facts };
  const fieldMeta: Record<string, unknown> = { ...extracted.fieldMeta };
  const factMeta: Record<string, unknown> = { ...extracted.factMeta };

  const serviceTitles = [
    ...new Set(
      rawPages
        .map(serviceTitleFromPage)
        .filter((item): item is string => Boolean(item)),
    ),
  ].slice(0, 40);
  if (serviceTitles.length) {
    draft.services = serviceTitles.join("\n").slice(0, 4000);
    facts.services = serviceTitles;
    fieldMeta.services = {
      confidence: "medium",
      source: "wordpress_rest",
    };
    factMeta.services = {
      confidence: "medium",
      source: "wordpress_rest",
    };
  }

  const keyFaq = keyOrderFaq(rawPages, origin);
  if (keyFaq) {
    draft.faqs = `Q: ${keyFaq.question}\nA: ${keyFaq.answer}`.slice(0, 4000);
    facts.faqs = [keyFaq];
    fieldMeta.faqs = {
      confidence: "high",
      source: "wordpress_rest",
    };
    factMeta.faqs = {
      confidence: "high",
      source: "wordpress_rest",
    };
  } else {
    delete draft.faqs;
    delete facts.faqs;
    delete fieldMeta.faqs;
    delete factMeta.faqs;
  }

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
