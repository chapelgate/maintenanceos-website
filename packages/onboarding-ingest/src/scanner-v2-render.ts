import type { BrowserType, Route } from "playwright";
import {
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_PAGE_TIMEOUT_MS,
  fetchPublicHttps,
} from "./fetch-safe.ts";
import { extractSameOriginHrefs } from "./extract.ts";
import { normalizeScannerV2Url } from "./scanner-v2-url-policy.ts";
import { extractScannerV2Page, type ScannerV2PageExtraction } from "./scanner-v2-content.ts";
import type { HttpGetFn, LookupFn } from "./types.ts";

export const DEFAULT_RENDER_TIMEOUT_MS = 12_000;
export const DEFAULT_RENDER_NETWORK_BYTES = 2 * 1024 * 1024;
export const DEFAULT_RENDER_RESOURCE_BYTES = 512 * 1024;
export const DEFAULT_RENDER_DOM_CHARS = 1_000_000;
export const DEFAULT_RENDER_MAX_REQUESTS = 96;

export type ScannerV2RenderBlockedRequest = {
  url: string;
  reason:
    | "cross_origin"
    | "unsupported_scheme"
    | "mutation_method"
    | "resource_type"
    | "request_limit"
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
        | "dom_too_large"
        | "network_budget"
        | "request_limit";
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
    .replace(/<!--[sS]*?-->/g, " ")
    .replace(/<script\b[sS]*?<\/script>/gi, " ")
    .replace(/<style\b[sS]*?<\/style>/gi, " ")
    .replace(/<noscript\b[sS]*?<\/noscript>/gi, " ")
    .replace(/<template\b[sS]*?<\/template>/gi, " ")
    .replace(/<svg\b[sS]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Conservative escalation heuristic. Normal content-rich HTML stays on the
 * cheap deterministic HTTP path; rendering is reserved for obvious app shells.
 */
export function shouldRenderScannerV2Page(html: string): boolean {
  const text = visibleText(html);
  if (text.length >= 320) return false;

  const scriptSrcCount = [...html.matchAll(/<script\b[^>]*\bsrc\s*=/gi)].length;
  const mountPoint =
    /<[^>]+\bid\s*=\s*["'](?:root|app|__next|__nuxt|svelte)["'][^>]*>/i.test(html) ||
    /<[^>]+\bdata-reactroot\b/i.test(html);
  const moduleScript =
    /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/i.test(html);

  return scriptSrcCount > 0 && (mountPoint || moduleScript || text.length < 120);
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
    "transfer-encoding",
    "upgrade",
  ]);
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!blocked.has(key.toLowerCase())) out[key] = value;
  }
  return out;
}

function failureReason(error: unknown): "render_timeout" | "render_failed" {
  const message = error instanceof Error ? error.message : String(error);
  return /timeout/i.test(message) ? "render_timeout" : "render_failed";
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

  const target = new URL(rawUrl);
  const origin = target.origin;
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
    8,
    DEFAULT_RENDER_MAX_REQUESTS,
  );

  const browserType =
    options.browserType ?? (await import("playwright")).chromium;
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: false,
    serviceWorkers: "block",
  });

  let requests = 0;
  let bytes = 0;
  const warnings: string[] = [];
  const blockedRequests: ScannerV2RenderBlockedRequest[] = [];
  let fatalReason:
    | "network_budget"
    | "request_limit"
    | null = null;

  // Serialise SSRF-safe fetches so the aggregate transfer budget cannot be
  // raced by concurrent browser subrequests.
  let fetchSerial: Promise<void> = Promise.resolve();

  const block = async (
    route: Route,
    reason: ScannerV2RenderBlockedRequest["reason"],
  ) => {
    blockedRequests.push({ url: route.request().url(), reason });
    try {
      await route.abort("blockedbyclient");
    } catch {
      // Route may already be closed because the page is shutting down.
    }
  };

  await context.route("**/*", async (route) => {
    const request = route.request();
    const requestUrl = request.url();
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
    if (parsed.origin !== origin) {
      await block(route, "cross_origin");
      return;
    }
    if (!["GET", "HEAD"].includes(request.method().toUpperCase())) {
      await block(route, "mutation_method");
      return;
    }
    if (["image", "media", "font"].includes(request.resourceType())) {
      await block(route, "resource_type");
      return;
    }
    if (requests >= maxRequests) {
      fatalReason = "request_limit";
      await block(route, "request_limit");
      return;
    }

    requests += 1;

    const current = fetchSerial.then(async () => {
      const remaining = maxNetworkBytes - bytes;
      if (remaining <= 0) {
        fatalReason = "network_budget";
        await block(route, "network_budget");
        return;
      }

      try {
        const response = await fetchPublicHttps(requestUrl, {
          lookup: options.lookup,
          get: options.get,
          timeoutMs: Math.min(DEFAULT_PAGE_TIMEOUT_MS, timeoutMs),
          maxBytes: Math.min(maxResourceBytes, remaining),
          maxRedirects: DEFAULT_MAX_REDIRECTS,
          headers: {
            Accept:
              request.headers().accept ??
              "text/html,application/javascript,application/json,text/plain,*/*;q=0.1",
          },
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
          body: request.method().toUpperCase() === "HEAD" ? "" : response.body,
        });
      } catch {
        await block(route, "fetch_denied");
      }
    });

    fetchSerial = current.catch(() => undefined);
    await current;
  });

  try {
    await context.clearCookies();
    const page = await context.newPage();
    page.setDefaultTimeout(timeoutMs);

    await page.goto(rawUrl, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    });

    // Give already-loaded application scripts a short deterministic window to
    // settle without waiting for analytics or external resources (which are
    // blocked above).
    await page.waitForTimeout(150);
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

    const renderedPageUrl = new URL(page.url());
    const renderedOrigin = new URL(origin);
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
