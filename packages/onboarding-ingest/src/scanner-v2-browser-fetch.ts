/**
 * When a public site rejects the identifying HTTPS client with 401/403,
 * retry that one document through Chromium. The browser performs TLS itself
 * (route.continue) after the URL and DNS are checked. No Authorization or
 * Cookie is added. Chromium keeps its own user agent so a host that blocks
 * the scanner token can still return the public page.
 */

import { defaultLookup } from "./fetch-safe.ts";
import { isReaderChallengePage } from "./scan.ts";
import { allowPublicHttpsUrl, assertResolvedAddressesPublic } from "./ssrf.ts";
import type { SafeHttpResponse } from "./types.ts";

export type BrowserDocumentFetch = (input: {
  url: string;
  timeoutMs: number;
}) => Promise<SafeHttpResponse | null>;

const BLOCKED_RESOURCE_TYPES = new Set(["image", "media", "font"]);
const MAX_BROWSER_REQUESTS = 40;
const MAX_BROWSER_ORIGINS = 8;

export function scannerBrowserLaunchOptions(): {
  headless: true;
  args?: string[];
} {
  const uid = typeof process.getuid === "function" ? process.getuid() : 0;
  if (uid === 0) return { headless: true };
  return {
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  };
}

export async function fetchDocumentWithPlaywright(input: {
  url: string;
  timeoutMs: number;
}): Promise<SafeHttpResponse | null> {
  const allowed = allowPublicHttpsUrl(input.url);
  if (!allowed.ok) return null;

  const { chromium } = await import("playwright");
  const browser = await chromium.launch(scannerBrowserLaunchOptions());
  try {
    const context = await browser.newContext({
      acceptDownloads: false,
      locale: "en-GB",
      extraHTTPHeaders: {
        "Accept-Language": "en-GB,en;q=0.8",
      },
      serviceWorkers: "block",
    });
    try {
      let continued = 0;
      const origins = new Set<string>();
      await context.route("**/*", async (route) => {
        try {
          const request = route.request();
          const method = request.method().toUpperCase();
          if (method !== "GET" && method !== "HEAD") {
            await route.abort("blockedbyclient");
            return;
          }
          if (BLOCKED_RESOURCE_TYPES.has(request.resourceType())) {
            await route.abort("blockedbyclient");
            return;
          }
          let target: URL;
          try {
            target = new URL(request.url());
          } catch {
            await route.abort("blockedbyclient");
            return;
          }
          const policy = allowPublicHttpsUrl(target.toString());
          if (!policy.ok) {
            await route.abort("blockedbyclient");
            return;
          }
          if (!origins.has(policy.url.origin) && origins.size >= MAX_BROWSER_ORIGINS) {
            await route.abort("blockedbyclient");
            return;
          }
          if (continued >= MAX_BROWSER_REQUESTS) {
            await route.abort("blockedbyclient");
            return;
          }
          const addresses = await defaultLookup(policy.url.hostname);
          const ipCheck = assertResolvedAddressesPublic(addresses);
          if (!ipCheck.ok) {
            await route.abort("blockedbyclient");
            return;
          }
          origins.add(policy.url.origin);
          continued += 1;
          await route.continue();
        } catch {
          try {
            await route.abort("blockedbyclient");
          } catch {
            // The request already finished.
          }
        }
      });

      const page = await context.newPage();
      page.setDefaultTimeout(input.timeoutMs);
      page.setDefaultNavigationTimeout(input.timeoutMs);
      const response = await page.goto(allowed.url.toString(), {
        waitUntil: "domcontentloaded",
        timeout: input.timeoutMs,
      });
      if (!response) return null;
      const finalUrl = page.url();
      let parsedFinal: URL;
      try {
        parsedFinal = new URL(finalUrl);
      } catch {
        return null;
      }
      if (parsedFinal.protocol !== "https:") return null;
      const html = await page.content();
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(await response.allHeaders())) {
        headers[key] = value;
      }
      if (!headers["content-type"]) headers["content-type"] = "text/html; charset=utf-8";
      return {
        status: response.status(),
        headers,
        body: html.slice(0, 512 * 1024),
        url: parsedFinal,
      };
    } finally {
      await context.close();
    }
  } catch {
    return null;
  } finally {
    await browser.close();
  }
}

export async function recoverAuthBlockedDocument(input: {
  pageUrl: string;
  response: SafeHttpResponse;
  timeoutMs: number;
  browserDocumentFetch?: BrowserDocumentFetch;
  allowPlaywrightLaunch: boolean;
}): Promise<{ response: SafeHttpResponse; usedBrowser: boolean }> {
  if (input.response.status !== 401 && input.response.status !== 403) {
    return { response: input.response, usedBrowser: false };
  }
  const fetchDocument =
    input.browserDocumentFetch ??
    (input.allowPlaywrightLaunch ? fetchDocumentWithPlaywright : undefined);
  if (!fetchDocument) return { response: input.response, usedBrowser: false };
  try {
    const recovered = await fetchDocument({
      url: input.pageUrl,
      timeoutMs: input.timeoutMs,
    });
    if (!recovered || recovered.status < 200 || recovered.status >= 300) {
      return { response: input.response, usedBrowser: false };
    }
    if (isReaderChallengePage(recovered.body)) {
      return { response: input.response, usedBrowser: false };
    }
    return { response: recovered, usedBrowser: true };
  } catch {
    return { response: input.response, usedBrowser: false };
  }
}
