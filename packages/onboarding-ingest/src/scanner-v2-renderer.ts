import {
  DEFAULT_MAX_REDIRECTS,
  fetchPublicHttps,
} from "./fetch-safe.ts";
import { extractSameOriginHrefs } from "./extract.ts";
import { allowPublicHttpsUrl } from "./ssrf.ts";
import { normalizeScannerV2Url } from "./scanner-v2-url-policy.ts";
import type { ScannerV2PageInput } from "./scanner-v2-content.ts";
import type {
  CrawlUrlDisposition,
  HttpGetFn,
  LookupFn,
} from "./types.ts";

export const DEFAULT_RENDER_TIMEOUT_MS = 8_000;
export const MAX_RENDER_TIMEOUT_MS = 15_000;
export const DEFAULT_RENDER_MAX_DOM_BYTES = 512 * 1024;
export const MAX_RENDER_DOM_BYTES = 1024 * 1024;
export const DEFAULT_RENDER_MAX_TOTAL_BYTES = 4 * 1024 * 1024;
export const MAX_RENDER_TOTAL_BYTES = 8 * 1024 * 1024;
export const DEFAULT_RENDER_MAX_RESOURCE_BYTES = 1024 * 1024;
export const MAX_RENDER_REQUESTS = 120;
export const MAX_RENDER_ORIGINS = 12;
export const DEFAULT_RENDER_SETTLE_MS = 300;
export const MAX_RENDER_SETTLE_MS = 1_500;
export const DEFAULT_RENDER_MAX_SCROLL_STEPS = 6;
export const MAX_RENDER_SCROLL_STEPS = 12;
export const DEFAULT_RENDER_SCROLL_SETTLE_MS = 120;
export const MAX_RENDER_SCROLL_SETTLE_MS = 500;
export const DEFAULT_RENDER_MAX_SHADOW_HOSTS = 128;
export const MAX_RENDER_SHADOW_HOSTS = 256;

const BLOCKED_RESOURCE_TYPES = new Set(["image", "media", "font"]);
const ANALYTICS_HOST_PATTERNS = [
  /(^|\.)google-analytics\.com$/i,
  /(^|\.)googletagmanager\.com$/i,
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)hotjar\.com$/i,
  /(^|\.)segment\.io$/i,
] as const;

export type ScannerV2RenderEscalationReason =
  | "app_shell"
  | "thin_html"
  | "extractor_empty";

export type ScannerV2RenderEscalationDecision =
  | { render: true; reason: ScannerV2RenderEscalationReason }
  | { render: false; reason: "raw_html_sufficient" };

export type ScannerV2RenderRequest = {
  url: string;
  method: string;
  resourceType: string;
  headers: Record<string, string>;
};

export type ScannerV2RenderResourceResult =
  | {
      action: "fulfill";
      status: number;
      headers: Record<string, string>;
      body: string;
    }
  | {
      action: "abort";
      reason:
        | "mutation_method"
        | "resource_type_blocked"
        | "analytics_blocked"
        | "network_policy_denied"
        | "request_limit"
        | "origin_limit"
        | "byte_limit"
        | "fetch_failed";
      incomplete: boolean;
    };

export type ScannerV2RenderBlockedRequest = {
  url: string;
  method: string;
  resourceType: string;
  reason: ScannerV2RenderResourceResult extends {
    action: "abort";
    reason: infer R;
  }
    ? R
    : never;
};

export type ScannerV2BrowserBackendInput = {
  url: string;
  timeoutMs: number;
  settleMs: number;
  maxScrollSteps: number;
  scrollSettleMs: number;
  maxShadowHosts: number;
  handleRequest: (
    request: ScannerV2RenderRequest,
  ) => Promise<ScannerV2RenderResourceResult>;
};

export type ScannerV2BrowserBackendResult = {
  html: string;
  finalUrl: string;
};

export type ScannerV2BrowserBackend = (
  input: ScannerV2BrowserBackendInput,
) => Promise<ScannerV2BrowserBackendResult>;

export type ScannerV2RenderOptions = {
  rawHtml?: string;
  extractedVisibleTextChars?: number;
  lookup?: LookupFn;
  get?: HttpGetFn;
  backend?: ScannerV2BrowserBackend;
  timeoutMs?: number;
  settleMs?: number;
  maxScrollSteps?: number;
  scrollSettleMs?: number;
  maxShadowHosts?: number;
  maxDomBytes?: number;
  maxTotalBytes?: number;
  maxResourceBytes?: number;
  maxRequests?: number;
  maxOrigins?: number;
  maxPathDepth?: number;
};

export type ScannerV2RenderSuccess = {
  ok: true;
  html: string;
  finalUrl: string;
  links: CrawlUrlDisposition[];
  totalFetchedBytes: number;
  observedRequests: number;
  blockedRequests: ScannerV2RenderBlockedRequest[];
  warnings: string[];
};

export type ScannerV2RenderFailure = {
  ok: false;
  reason:
    | "render_not_required"
    | "render_launch_failed"
    | "render_navigation_failed"
    | "render_timeout"
    | "render_dom_limit"
    | "render_request_limit"
    | "render_origin_limit"
    | "render_byte_limit";
  incomplete: boolean;
  totalFetchedBytes: number;
  observedRequests: number;
  blockedRequests: ScannerV2RenderBlockedRequest[];
  warnings: string[];
};

export type ScannerV2RenderResult =
  | ScannerV2RenderSuccess
  | ScannerV2RenderFailure;

function boundedInt(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(
    minimum,
    Math.min(maximum, Math.trunc(value as number)),
  );
}

function visibleText(html: string): string {
  return html
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<template\b[\s\S]*?<\/template>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function decideScannerV2RenderEscalation(input: {
  rawHtml: string;
  extractedVisibleTextChars?: number;
}): ScannerV2RenderEscalationDecision {
  const text = visibleText(input.rawHtml);
  const scripts = [...input.rawHtml.matchAll(/<script\b[^>]*>/gi)].length;
  const meaningfulBlocks = [
    ...input.rawHtml.matchAll(
      /<(?:p|li|article|section|table|details|address)\b[^>]*>[\s\S]*?<\/(?:p|li|article|section|table|details|address)>/gi,
    ),
  ].filter((match) => visibleText(match[0]).length >= 40).length;
  const hasAppRoot =
    /<(?:div|main)\b[^>]*(?:id|data-app|data-reactroot)=["'][^"']*(?:root|app|application)[^"']*["'][^>]*>\s*<\/(?:div|main)>/i.test(
      input.rawHtml,
    ) ||
    /<div\b[^>]*id=["'](?:root|app|__next)["'][^>]*>\s*<\/div>/i.test(
      input.rawHtml,
    );

  if (scripts > 0 && hasAppRoot && text.length < 400) {
    return { render: true, reason: "app_shell" };
  }
  if (scripts > 0 && text.length < 180 && meaningfulBlocks === 0) {
    return { render: true, reason: "thin_html" };
  }
  if (
    Number.isFinite(input.extractedVisibleTextChars) &&
    (input.extractedVisibleTextChars as number) === 0 &&
    scripts > 0
  ) {
    return { render: true, reason: "extractor_empty" };
  }
  return { render: false, reason: "raw_html_sufficient" };
}

function isAnalyticsUrl(raw: string): boolean {
  try {
    const hostname = new URL(raw).hostname;
    return ANALYTICS_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

function sanitizeFulfillHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const blocked = new Set([
    "content-encoding",
    "content-length",
    "transfer-encoding",
    "connection",
    "set-cookie",
    "set-cookie2",
  ]);
  return Object.fromEntries(
    Object.entries(headers).filter(
      ([key]) => !blocked.has(key.toLowerCase()),
    ),
  );
}

function selectedRequestHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const allowed = new Set([
    "accept",
    "accept-language",
    "content-type",
    "origin",
    "referer",
  ]);
  return Object.fromEntries(
    Object.entries(headers).filter(
      ([key]) => allowed.has(key.toLowerCase()),
    ),
  );
}

type ShadowSnapshot = {
  text: string;
  links: Array<{ href: string; text: string }>;
};

function escapeHtmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtmlText(value).replaceAll('"', "&quot;");
}

function appendShadowSnapshots(html: string, snapshots: ShadowSnapshot[]): string {
  if (!snapshots.length) return html;
  const safe = snapshots
    .map((snapshot) => {
      const text = escapeHtmlText(snapshot.text);
      const links = snapshot.links
        .map(
          (link) =>
            `<a data-scanner-shadow-link="" href="${escapeHtmlAttribute(link.href)}">${escapeHtmlText(link.text)}</a>`,
        )
        .join(" ");
      return `<section data-scanner-shadow-root="open">${text}${links ? ` ${links}` : ""}</section>`;
    })
    .join("");
  const bodyClose = /<\/body\s*>/i;
  return bodyClose.test(html)
    ? html.replace(bodyClose, `${safe}</body>`)
    : `${html}${safe}`;
}

function extractRenderedFrameUrls(html: string, pageUrl: URL): string[] {
  const urls: string[] = [];
  const re = /<(?:iframe|frame)\b[^>]*\bsrc\s*=\s*(?:["']([^"']+)["']|([^\s>]+))/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const raw = (match[1] ?? match[2] ?? "").trim();
    if (!raw) continue;
    let next: URL;
    try {
      next = new URL(raw, pageUrl);
    } catch {
      continue;
    }
    if (next.protocol !== "https:" || next.origin !== pageUrl.origin) continue;
    next.hash = "";
    urls.push(next.toString());
  }
  return [...new Set(urls)];
}

function renderLinks(input: {
  html: string;
  pageUrl: string;
  origin: string;
  maxPathDepth?: number;
}): CrawlUrlDisposition[] {
  let page: URL;
  let origin: URL;
  try {
    page = new URL(input.pageUrl);
    origin = new URL(input.origin);
  } catch {
    return [];
  }

  const out: CrawlUrlDisposition[] = [];
  const seen = new Set<string>();
  const candidates = [
    ...extractSameOriginHrefs(input.html, page),
    ...extractRenderedFrameUrls(input.html, page),
  ];
  for (const href of candidates) {
    const normalized = normalizeScannerV2Url(href, origin, {
      maxPathDepth: input.maxPathDepth,
      applyContentPolicy: true,
    });
    if (!normalized.ok || seen.has(normalized.url)) continue;
    seen.add(normalized.url);
    out.push({
      url: normalized.url,
      status: "queued",
      discoveryReason: "rendered_link",
      discoveredFrom: page.toString(),
    });
  }
  return out;
}

export function renderFailureDisposition(
  url: string,
  failure: ScannerV2RenderFailure,
  discoveredFrom?: string,
): CrawlUrlDisposition {
  return {
    url,
    status: "unresolved",
    discoveryReason: "rendered_link",
    ...(discoveredFrom ? { discoveredFrom } : {}),
    reason: failure.reason,
  };
}

export function renderResultToPageInput(input: {
  requestedUrl: string;
  result: ScannerV2RenderSuccess;
  discoveredFrom?: string;
  fetchedAt?: string;
}): ScannerV2PageInput {
  return {
    requestedUrl: input.requestedUrl,
    canonicalUrl: input.result.finalUrl,
    html: input.result.html,
    contentType: "text/html",
    fetchMode: "rendered",
    ...(input.discoveredFrom ? { discoveredFrom: input.discoveredFrom } : {}),
    ...(input.fetchedAt ? { fetchedAt: input.fetchedAt } : {}),
  };
}

export async function playwrightScannerV2BrowserBackend(
  input: ScannerV2BrowserBackendInput,
): Promise<ScannerV2BrowserBackendResult> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      acceptDownloads: false,
      serviceWorkers: "block",
    });

    try {
      await context.route("**/*", async (route) => {
        const request = route.request();
        const outcome = await input.handleRequest({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          headers: await request.allHeaders(),
        });

        if (outcome.action === "abort") {
          await route.abort("blockedbyclient");
          return;
        }

        await route.fulfill({
          status: outcome.status,
          headers: outcome.headers,
          body: outcome.body,
        });
      });

      if ("routeWebSocket" in context) {
        const routeWebSocket = context.routeWebSocket.bind(context);
        await routeWebSocket("**/*", async (socket) => {
          await socket.close();
        });
      }

      const page = await context.newPage();
      page.setDefaultTimeout(input.timeoutMs);
      page.setDefaultNavigationTimeout(input.timeoutMs);

      await page.goto(input.url, {
        waitUntil: "domcontentloaded",
        timeout: input.timeoutMs,
      });

      try {
        await page.waitForLoadState("networkidle", {
          timeout: Math.min(2_000, input.timeoutMs),
        });
      } catch {
        // Long-polling apps often never become network-idle. The hard render
        // deadline and bounded settle interval remain authoritative.
      }
      if (input.settleMs > 0) {
        await page.waitForTimeout(input.settleMs);
      }

      // Bounded scrolling exposes text loaded through IntersectionObserver or
      // other viewport-driven lazy-loading. It never clicks, submits forms or
      // bypasses the existing network policy: every resulting request still
      // passes through handleRequest above.
      for (let step = 0; step < input.maxScrollSteps; step += 1) {
        const advanced = await page.evaluate(() => {
          const root = document.scrollingElement ?? document.documentElement;
          const current = window.scrollY;
          const viewport = Math.max(window.innerHeight, 600);
          const maxY = Math.max(0, root.scrollHeight - window.innerHeight);
          if (current >= maxY) return false;
          window.scrollTo(0, Math.min(maxY, current + viewport));
          return true;
        });
        if (!advanced) break;
        if (input.scrollSettleMs > 0) {
          await page.waitForTimeout(input.scrollSettleMs);
        }
      }

      // Open Shadow DOM is public rendered page content but page.content()
      // does not serialize it. Read a bounded snapshot of text + navigable
      // links only. Do not clone nodes back into the live document: that could
      // re-activate custom elements, scripts, frames or resource loads.
      const shadowSnapshots: ShadowSnapshot[] =
        input.maxShadowHosts > 0
          ? await page.evaluate((maxHosts) => {
              const queue = Array.from(document.querySelectorAll("*"));
              const snapshots: ShadowSnapshot[] = [];
              let exposed = 0;
              for (
                let index = 0;
                index < queue.length && exposed < maxHosts;
                index += 1
              ) {
                const element = queue[index];
                const shadow = element.shadowRoot;
                if (!shadow) continue;
                queue.push(...Array.from(shadow.querySelectorAll("*")));

                const text = (shadow.textContent ?? "")
                  .replace(/\s+/g, " ")
                  .trim();
                const links = Array.from(
                  shadow.querySelectorAll("a[href], iframe[src], frame[src]"),
                )
                  .slice(0, 64)
                  .map((node) => {
                    const href =
                      node.getAttribute("href") ?? node.getAttribute("src") ?? "";
                    return {
                      href,
                      text: (node.textContent ?? "").replace(/\s+/g, " ").trim(),
                    };
                  })
                  .filter((link) => Boolean(link.href));
                if (text || links.length) snapshots.push({ text, links });
                exposed += 1;
              }
              return snapshots;
            }, input.maxShadowHosts)
          : [];

      await page.evaluate(() => window.scrollTo(0, 0));
      const html = appendShadowSnapshots(
        await page.content(),
        shadowSnapshots,
      );

      return {
        html,
        finalUrl: page.url(),
      };
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

export async function renderScannerV2Page(
  rawUrl: string,
  options: ScannerV2RenderOptions = {},
): Promise<ScannerV2RenderResult> {
  const rawHtml = options.rawHtml ?? "";
  if (rawHtml) {
    const decision = decideScannerV2RenderEscalation({
      rawHtml,
      extractedVisibleTextChars: options.extractedVisibleTextChars,
    });
    if (!decision.render) {
      return {
        ok: false,
        reason: "render_not_required",
        incomplete: false,
        totalFetchedBytes: 0,
        observedRequests: 0,
        blockedRequests: [],
        warnings: [],
      };
    }
  }

  let submitted: URL;
  try {
    submitted = new URL(rawUrl);
  } catch {
    return {
      ok: false,
      reason: "render_navigation_failed",
      incomplete: true,
      totalFetchedBytes: 0,
      observedRequests: 0,
      blockedRequests: [],
      warnings: ["invalid_render_url"],
    };
  }

  const normalized = normalizeScannerV2Url(
    submitted.toString(),
    new URL(submitted.origin),
    { applyContentPolicy: true, maxPathDepth: options.maxPathDepth },
  );
  if (!normalized.ok) {
    return {
      ok: false,
      reason: "render_navigation_failed",
      incomplete: true,
      totalFetchedBytes: 0,
      observedRequests: 0,
      blockedRequests: [],
      warnings: [normalized.reason],
    };
  }

  const timeoutMs = boundedInt(
    options.timeoutMs,
    DEFAULT_RENDER_TIMEOUT_MS,
    500,
    MAX_RENDER_TIMEOUT_MS,
  );
  const settleMs = boundedInt(
    options.settleMs,
    DEFAULT_RENDER_SETTLE_MS,
    0,
    MAX_RENDER_SETTLE_MS,
  );
  const maxScrollSteps = boundedInt(
    options.maxScrollSteps,
    DEFAULT_RENDER_MAX_SCROLL_STEPS,
    0,
    MAX_RENDER_SCROLL_STEPS,
  );
  const scrollSettleMs = boundedInt(
    options.scrollSettleMs,
    DEFAULT_RENDER_SCROLL_SETTLE_MS,
    0,
    MAX_RENDER_SCROLL_SETTLE_MS,
  );
  const maxShadowHosts = boundedInt(
    options.maxShadowHosts,
    DEFAULT_RENDER_MAX_SHADOW_HOSTS,
    0,
    MAX_RENDER_SHADOW_HOSTS,
  );
  const maxDomBytes = boundedInt(
    options.maxDomBytes,
    DEFAULT_RENDER_MAX_DOM_BYTES,
    16 * 1024,
    MAX_RENDER_DOM_BYTES,
  );
  const maxTotalBytes = boundedInt(
    options.maxTotalBytes,
    DEFAULT_RENDER_MAX_TOTAL_BYTES,
    64 * 1024,
    MAX_RENDER_TOTAL_BYTES,
  );
  const maxResourceBytes = boundedInt(
    options.maxResourceBytes,
    DEFAULT_RENDER_MAX_RESOURCE_BYTES,
    16 * 1024,
    DEFAULT_RENDER_MAX_RESOURCE_BYTES,
  );
  const maxRequests = boundedInt(
    options.maxRequests,
    MAX_RENDER_REQUESTS,
    1,
    MAX_RENDER_REQUESTS,
  );
  const maxOrigins = boundedInt(
    options.maxOrigins,
    MAX_RENDER_ORIGINS,
    1,
    MAX_RENDER_ORIGINS,
  );
  const deadline = Date.now() + timeoutMs;
  const origins = new Set<string>();
  const blockedRequests: ScannerV2RenderBlockedRequest[] = [];
  const warnings: string[] = [];
  let observedRequests = 0;
  let totalFetchedBytes = 0;
  let fatalReason:
    | "render_request_limit"
    | "render_origin_limit"
    | "render_byte_limit"
    | null = null;

  const abort = (
    request: ScannerV2RenderRequest,
    reason: ScannerV2RenderBlockedRequest["reason"],
    incomplete: boolean,
  ): ScannerV2RenderResourceResult => {
    blockedRequests.push({
      url: request.url,
      method: request.method,
      resourceType: request.resourceType,
      reason,
    });
    if (incomplete) warnings.push(reason);
    return { action: "abort", reason, incomplete };
  };

  const handleRequest = async (
    request: ScannerV2RenderRequest,
  ): Promise<ScannerV2RenderResourceResult> => {
    observedRequests += 1;
    if (observedRequests > maxRequests) {
      fatalReason = "render_request_limit";
      return abort(request, "request_limit", true);
    }

    const method = request.method.toUpperCase();
    if (method !== "GET" && method !== "HEAD") {
      return abort(request, "mutation_method", false);
    }
    if (BLOCKED_RESOURCE_TYPES.has(request.resourceType)) {
      return abort(request, "resource_type_blocked", false);
    }
    if (isAnalyticsUrl(request.url)) {
      return abort(request, "analytics_blocked", false);
    }

    let requestUrl: URL;
    try {
      requestUrl = new URL(request.url);
    } catch {
      return abort(request, "network_policy_denied", true);
    }
    if (requestUrl.protocol !== "https:") {
      return abort(request, "network_policy_denied", true);
    }
    const networkPolicy = allowPublicHttpsUrl(requestUrl.toString());
    if (!networkPolicy.ok) {
      return abort(request, "network_policy_denied", true);
    }
    requestUrl = networkPolicy.url;

    const origin = requestUrl.origin;
    if (!origins.has(origin) && origins.size >= maxOrigins) {
      fatalReason = "render_origin_limit";
      return abort(request, "origin_limit", true);
    }
    origins.add(origin);

    const remainingBytes = maxTotalBytes - totalFetchedBytes;
    if (remainingBytes <= 0) {
      fatalReason = "render_byte_limit";
      return abort(request, "byte_limit", true);
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      return abort(request, "fetch_failed", true);
    }

    try {
      const response = await fetchPublicHttps(requestUrl.toString(), {
        lookup: options.lookup,
        get: options.get,
        remainingMs,
        timeoutMs: Math.min(5_000, remainingMs),
        maxBytes: Math.min(maxResourceBytes, remainingBytes),
        maxRedirects: DEFAULT_MAX_REDIRECTS,
        headers: selectedRequestHeaders(request.headers),
      });
      const bytes = Buffer.byteLength(response.body, "utf8");
      totalFetchedBytes += bytes;
      if (totalFetchedBytes > maxTotalBytes) {
        fatalReason = "render_byte_limit";
        return abort(request, "byte_limit", true);
      }

      return {
        action: "fulfill",
        status: response.status,
        headers: sanitizeFulfillHeaders(response.headers),
        body: method === "HEAD" ? "" : response.body,
      };
    } catch {
      return abort(request, "fetch_failed", true);
    }
  };

  const backend = options.backend ?? playwrightScannerV2BrowserBackend;
  let rendered: ScannerV2BrowserBackendResult;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    rendered = await Promise.race([
      backend({
        url: normalized.url,
        timeoutMs,
        settleMs,
        maxScrollSteps,
        scrollSettleMs,
        maxShadowHosts,
        handleRequest,
      }),
      new Promise<never>((_resolve, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error("scanner_v2_render_timeout")),
          timeoutMs,
        );
      }),
    ]);
  } catch (error) {
    const timeout =
      error instanceof Error &&
      /timeout/i.test(error.message);
    return {
      ok: false,
      reason: timeout ? "render_timeout" : "render_navigation_failed",
      incomplete: true,
      totalFetchedBytes,
      observedRequests,
      blockedRequests,
      warnings: [...new Set(warnings)],
    };
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }

  if (fatalReason) {
    return {
      ok: false,
      reason: fatalReason,
      incomplete: true,
      totalFetchedBytes,
      observedRequests,
      blockedRequests,
      warnings: [...new Set(warnings)],
    };
  }

  const domBytes = Buffer.byteLength(rendered.html, "utf8");
  if (domBytes > maxDomBytes) {
    return {
      ok: false,
      reason: "render_dom_limit",
      incomplete: true,
      totalFetchedBytes,
      observedRequests,
      blockedRequests,
      warnings: [...new Set([...warnings, "render_dom_limit"])],
    };
  }

  let finalUrl = rendered.finalUrl;
  try {
    const parsed = new URL(rendered.finalUrl);
    const final = normalizeScannerV2Url(parsed.toString(), new URL(submitted.origin), {
      applyContentPolicy: true,
      maxPathDepth: options.maxPathDepth,
    });
    if (!final.ok) {
      return {
        ok: false,
        reason: "render_navigation_failed",
        incomplete: true,
        totalFetchedBytes,
        observedRequests,
        blockedRequests,
        warnings: [...new Set([...warnings, final.reason])],
      };
    }
    finalUrl = final.url;
  } catch {
    return {
      ok: false,
      reason: "render_navigation_failed",
      incomplete: true,
      totalFetchedBytes,
      observedRequests,
      blockedRequests,
      warnings: [...new Set([...warnings, "invalid_final_url"])],
    };
  }

  return {
    ok: true,
    html: rendered.html,
    finalUrl,
    links: renderLinks({
      html: rendered.html,
      pageUrl: finalUrl,
      origin: submitted.origin,
      maxPathDepth: options.maxPathDepth,
    }),
    totalFetchedBytes,
    observedRequests,
    blockedRequests,
    warnings: [...new Set(warnings)],
  };
}
