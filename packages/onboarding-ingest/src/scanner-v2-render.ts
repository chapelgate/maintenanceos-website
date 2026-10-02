import type { Browser, BrowserType, Route } from "playwright";
import {
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_PAGE_TIMEOUT_MS,
  fetchPublicHttps,
} from "./fetch-safe.ts";
import { extractSameOriginHrefs } from "./extract.ts";
import { allowPublicHttpsUrl } from "./ssrf.ts";
import {
  extractScannerV2Page,
  type ScannerV2PageExtraction,
} from "./scanner-v2-content.ts";
import { normalizeScannerV2Url } from "./scanner-v2-url-policy.ts";
import type { HttpGetFn, LookupFn } from "./types.ts";

export const DEFAULT_RENDER_TIMEOUT_MS = 12_000;
export const DEFAULT_RENDER_NETWORK_BYTES = 4 * 1024 * 1024;
export const DEFAULT_RENDER_RESOURCE_BYTES = 1024 * 1024;
export const DEFAULT_RENDER_DOM_CHARS = 1_000_000;
export const DEFAULT_RENDER_MAX_REQUESTS = 120;
export const DEFAULT_RENDER_MAX_ORIGINS = 12;
export const DEFAULT_RENDER_SETTLE_MS = 300;

const BLOCKED_RESOURCE_TYPES = new Set(["image", "media", "font"]);
const ANALYTICS_HOSTS = [
  /(^|\.)google-analytics\.com$/i,
  /(^|\.)googletagmanager\.com$/i,
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)hotjar\.com$/i,
  /(^|\.)segment\.io$/i,
] as const;

export type ScannerV2RenderBlockedRequest = {
  url: string;
  reason:
    | "cross_origin_document"
    | "unsupported_scheme"
    | "network_policy_denied"
    | "mutation_method"
    | "resource_type"
    | "analytics"
    | "websocket"
    | "request_limit"
    | "origin_limit"
    | "network_budget"
    | "fetch_denied";
};

export type ScannerV2RenderResult =
  | {
      ok: true;
      url: string;
      html: string;
      links: string[];
      requests: number;
      bytes: number;
      blockedRequests: ScannerV2RenderBlockedRequest[];
      warnings: string[];
    }
  | {
      ok: false;
      reason:
        | "not_needed"
        | "render_timeout"
        | "render_failed"
        | "render_no_content"
        | "dom_too_large"
        | "network_budget"
        | "request_limit"
        | "origin_limit";
      requests: number;
      bytes: number;
      blockedRequests: ScannerV2RenderBlockedRequest[];
      warnings: string[];
    };

export type ScannerV2RenderOptions = {
  lookup?: LookupFn;
  get?: HttpGetFn;
  browserType?: BrowserType;
  timeoutMs?: number;
  maxNetworkBytes?: number;
  maxResourceBytes?: number;
  maxDomChars?: number;
  maxRequests?: number;
  maxOrigins?: number;
  settleMs?: number;
};

export type ScannerV2RenderedExtraction =
  | {
      ok: true;
      render: Extract<ScannerV2RenderResult, { ok: true }>;
      extraction: ScannerV2PageExtraction;
    }
  | {
      ok: false;
      render: Extract<ScannerV2RenderResult, { ok: false }>;
    };

function bounded(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(value as number)));
}

function visibleText(html: string): string {
  return html
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<template\b[\s\S]*?<\/template>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulBlocks(html: string): number {
  return [
    ...html.matchAll(
      /<(?:p|li|article|section|table|details|address)\b[^>]*>[\s\S]*?<\/(?:p|li|article|section|table|details|address)>/gi,
    ),
  ].filter((match) => visibleText(match[0]).length >= 40).length;
}

/**
 * Conservative escalation heuristic. Content-rich HTML remains on the cheap
 * deterministic HTTP path. Only genuine scripted shells or extractor-empty
 * pages are eligible for browser rendering.
 */
export function shouldRenderScannerV2Page(html: string): boolean {
  const text = visibleText(html);
  if (text.length >= 320) return false;

  const scriptSrcCount = [...html.matchAll(/<script\b[^>]*\bsrc\s*=/gi)].length;
  const scriptCount = [...html.matchAll(/<script\b[^>]*>/gi)].length;
  const mountPoint =
    /<[^>]+\bid\s*=\s*["'](?:root|app|__next|__nuxt|svelte)["'][^>]*>/i.test(html) ||
    /<[^>]+\bdata-reactroot\b/i.test(html);
  const moduleScript =
    /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/i.test(html);
  const semanticBlocks = meaningfulBlocks(html);

  if (scriptCount > 0 && mountPoint && text.length < 400) return true;
  if (scriptSrcCount > 0 && moduleScript && text.length < 220) return true;
  return scriptCount > 0 && text.length < 120 && semanticBlocks === 0;
}

function filteredFulfillHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const blocked = new Set([
    "connection",
    "content-encoding",
    "content-length",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "set-cookie",
    "set-cookie2",
    "transfer-encoding",
    "upgrade",
  ]);
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!blocked.has(key.toLowerCase())) out[key] = value;
  }
  return out;
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
    Object.entries(headers).filter(([key]) =>
      allowed.has(key.toLowerCase()),
    ),
  );
}

function failureReason(error: unknown): "render_timeout" | "render_failed" {
  const message = error instanceof Error ? error.message : String(error);
  return /timeout/i.test(message) ? "render_timeout" : "render_failed";
}

function isAnalytics(rawUrl: string): boolean {
  try {
    const hostname = new URL(rawUrl).hostname;
    return ANALYTICS_HOSTS.some((pattern) => pattern.test(hostname));
  } catch {
    return false;
  }
}

export async function renderScannerV2Page(
  rawUrl: string,
  rawHtml: string,
  options: ScannerV2RenderOptions = {},
): Promise<ScannerV2RenderResult> {
  if (!shouldRenderScannerV2Page(rawHtml)) {
    return {
      ok: false,
      reason: "not_needed",
      requests: 0,
      bytes: 0,
      blockedRequests: [],
      warnings: [],
    };
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return {
      ok: false,
      reason: "render_failed",
      requests: 0,
      bytes: 0,
      blockedRequests: [],
      warnings: ["invalid_render_url"],
    };
  }
  const initialPolicy = normalizeScannerV2Url(
    target.toString(),
    new URL(target.origin),
    { applyContentPolicy: true },
  );
  if (!initialPolicy.ok) {
    return {
      ok: false,
      reason: "render_failed",
      requests: 0,
      bytes: 0,
      blockedRequests: [],
      warnings: [initialPolicy.reason],
    };
  }
  target = new URL(initialPolicy.url);
  const targetOrigin = target.origin;

  const timeoutMs = bounded(
    options.timeoutMs,
    DEFAULT_RENDER_TIMEOUT_MS,
    1_000,
    DEFAULT_RENDER_TIMEOUT_MS,
  );
  const maxNetworkBytes = bounded(
    options.maxNetworkBytes,
    DEFAULT_RENDER_NETWORK_BYTES,
    64 * 1024,
    DEFAULT_RENDER_NETWORK_BYTES,
  );
  const maxResourceBytes = bounded(
    options.maxResourceBytes,
    DEFAULT_RENDER_RESOURCE_BYTES,
    16 * 1024,
    DEFAULT_RENDER_RESOURCE_BYTES,
  );
  const maxDomChars = bounded(
    options.maxDomChars,
    DEFAULT_RENDER_DOM_CHARS,
    16_384,
    DEFAULT_RENDER_DOM_CHARS,
  );
  const maxRequests = bounded(
    options.maxRequests,
    DEFAULT_RENDER_MAX_REQUESTS,
    1,
    DEFAULT_RENDER_MAX_REQUESTS,
  );
  const maxOrigins = bounded(
    options.maxOrigins,
    DEFAULT_RENDER_MAX_ORIGINS,
    1,
    DEFAULT_RENDER_MAX_ORIGINS,
  );
  const settleMs = bounded(
    options.settleMs,
    DEFAULT_RENDER_SETTLE_MS,
    0,
    1_500,
  );
  const deadline = Date.now() + timeoutMs;

  const browserType =
    options.browserType ?? (await import("playwright")).chromium;
  let browser: Browser;
  try {
    browser = await browserType.launch({
      headless: true,
      timeout: timeoutMs,
    });
  } catch (error) {
    return {
      ok: false,
      reason: failureReason(error),
      requests: 0,
      bytes: 0,
      blockedRequests: [],
      warnings: ["render_launch_failed"],
    };
  }

  const blockedRequests: ScannerV2RenderBlockedRequest[] = [];
  const warnings: string[] = [];
  const origins = new Set<string>();
  let requests = 0;
  let bytes = 0;
  let fatalReason:
    | "network_budget"
    | "request_limit"
    | "origin_limit"
    | null = null;

  // Serialise proxied browser fetches so concurrent subresources cannot race
  // aggregate byte/request budgets.
  let fetchSerial: Promise<void> = Promise.resolve();

  const context = await browser.newContext({
    acceptDownloads: false,
    serviceWorkers: "block",
  });

  const block = async (
    route: Route,
    reason: ScannerV2RenderBlockedRequest["reason"],
  ) => {
    blockedRequests.push({ url: route.request().url(), reason });
    try {
      await route.abort("blockedbyclient");
    } catch {
      // Route can already be closing during browser teardown.
    }
  };

  await context.route("**/*", async (route) => {
    const request = route.request();
    const requestUrl = request.url();
    const method = request.method().toUpperCase();

    let parsed: URL;
    try {
      parsed = new URL(requestUrl);
    } catch {
      await block(route, "unsupported_scheme");
      return;
    }

    if (parsed.protocol !== "https:") {
      await block(route, "unsupported_scheme");
      return;
    }
    if (
      request.resourceType() === "document" &&
      parsed.origin !== targetOrigin
    ) {
      await block(route, "cross_origin_document");
      return;
    }
    if (method !== "GET" && method !== "HEAD") {
      await block(route, "mutation_method");
      return;
    }
    if (BLOCKED_RESOURCE_TYPES.has(request.resourceType())) {
      await block(route, "resource_type");
      return;
    }
    if (isAnalytics(requestUrl)) {
      await block(route, "analytics");
      return;
    }

    const policy = allowPublicHttpsUrl(parsed.toString());
    if (!policy.ok) {
      await block(route, "network_policy_denied");
      return;
    }
    parsed = policy.url;

    if (!origins.has(parsed.origin) && origins.size >= maxOrigins) {
      fatalReason = "origin_limit";
      await block(route, "origin_limit");
      return;
    }
    origins.add(parsed.origin);

    if (requests >= maxRequests) {
      fatalReason = "request_limit";
      await block(route, "request_limit");
      return;
    }
    requests += 1;

    const current = fetchSerial.then(async () => {
      const remainingBytes = maxNetworkBytes - bytes;
      if (remainingBytes <= 0) {
        fatalReason = "network_budget";
        await block(route, "network_budget");
        return;
      }
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) {
        await block(route, "fetch_denied");
        return;
      }

      try {
        const response = await fetchPublicHttps(parsed.toString(), {
          lookup: options.lookup,
          get: options.get,
          remainingMs,
          timeoutMs: Math.min(DEFAULT_PAGE_TIMEOUT_MS, remainingMs),
          maxBytes: Math.min(maxResourceBytes, remainingBytes),
          maxRedirects: DEFAULT_MAX_REDIRECTS,
          headers: selectedRequestHeaders(await request.allHeaders()),
        });
        const bodyBytes = Buffer.byteLength(response.body, "utf8");
        if (bytes + bodyBytes > maxNetworkBytes) {
          fatalReason = "network_budget";
          await block(route, "network_budget");
          return;
        }
        bytes += bodyBytes;

        await route.fulfill({
          status: response.status,
          headers: filteredFulfillHeaders(response.headers),
          body: method === "HEAD" ? "" : response.body,
        });
      } catch {
        await block(route, "fetch_denied");
      }
    });

    fetchSerial = current.catch(() => undefined);
    await current;
  });

  if ("routeWebSocket" in context) {
    const routeWebSocket = context.routeWebSocket.bind(context);
    await routeWebSocket("**/*", async (socket) => {
      blockedRequests.push({ url: socket.url(), reason: "websocket" });
      await socket.close();
    });
  }

  try {
    await context.clearCookies();
    const page = await context.newPage();
    page.setDefaultTimeout(timeoutMs);
    page.setDefaultNavigationTimeout(timeoutMs);

    await page.goto(target.toString(), {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });

    if (settleMs > 0) await page.waitForTimeout(settleMs);
    await fetchSerial;
    await page
      .waitForLoadState("networkidle", {
        timeout: Math.min(2_000, Math.max(250, deadline - Date.now())),
      })
      .catch(() => undefined);
    await fetchSerial;

    if (fatalReason) {
      return {
        ok: false,
        reason: fatalReason,
        requests,
        bytes,
        blockedRequests,
        warnings: [...new Set([...warnings, fatalReason])],
      };
    }

    const html = await page.content();
    if (html.length > maxDomChars) {
      return {
        ok: false,
        reason: "dom_too_large",
        requests,
        bytes,
        blockedRequests,
        warnings: ["dom_too_large"],
      };
    }

    if (
      shouldRenderScannerV2Page(html) &&
      visibleText(html).length <= visibleText(rawHtml).length
    ) {
      return {
        ok: false,
        reason: "render_no_content",
        requests,
        bytes,
        blockedRequests,
        warnings: ["render_no_content"],
      };
    }

    const renderedPageUrl = new URL(page.url());
    const renderedOrigin = new URL(targetOrigin);
    const links = [
      ...new Set(
        extractSameOriginHrefs(html, renderedPageUrl)
          .map((href) =>
            normalizeScannerV2Url(href, renderedOrigin, {
              applyContentPolicy: true,
            }),
          )
          .filter(
            (
              value,
            ): value is Extract<
              ReturnType<typeof normalizeScannerV2Url>,
              { ok: true }
            > => value.ok,
          )
          .map((value) => value.url),
      ),
    ];

    if (blockedRequests.length) warnings.push("render_subrequests_blocked");

    return {
      ok: true,
      url: page.url(),
      html,
      links,
      requests,
      bytes,
      blockedRequests,
      warnings: [...new Set(warnings)],
    };
  } catch (error) {
    const reason = failureReason(error);
    warnings.push(reason);
    return {
      ok: false,
      reason,
      requests,
      bytes,
      blockedRequests,
      warnings: [...new Set(warnings)],
    };
  } finally {
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  }
}

export async function renderAndExtractScannerV2Page(input: {
  requestedUrl: string;
  rawHtml: string;
  discoveredFrom?: string;
  fetchedAt?: string;
  options?: ScannerV2RenderOptions;
}): Promise<ScannerV2RenderedExtraction> {
  const render = await renderScannerV2Page(
    input.requestedUrl,
    input.rawHtml,
    input.options,
  );
  if (!render.ok) return { ok: false, render };

  return {
    ok: true,
    render,
    extraction: extractScannerV2Page({
      requestedUrl: input.requestedUrl,
      canonicalUrl: render.url,
      html: render.html,
      contentType: "text/html",
      fetchMode: "rendered",
      ...(input.discoveredFrom ? { discoveredFrom: input.discoveredFrom } : {}),
      ...(input.fetchedAt ? { fetchedAt: input.fetchedAt } : {}),
    }),
  };
}
