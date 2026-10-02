import {
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_PAGE_TIMEOUT_MS,
  fetchPublicHttps,
} from "./fetch-safe.ts";
import { extractSameOriginHrefs } from "./extract.ts";
import { allowPublicHttpsUrl } from "./ssrf.ts";
import { buildCrawlManifest } from "./scanner-v2-foundation.ts";
import { isPathAllowed, parseRobotsTxt, type RobotsRules } from "./scan.ts";
import {
  ScanError,
  type CrawlManifest,
  type CrawlUrlDisposition,
  type HttpGetFn,
  type LookupFn,
  type ScanPageSource,
} from "./types.ts";

export const DEFAULT_MAX_SITEMAP_DOCUMENTS = 64;
export const DEFAULT_MAX_SITEMAP_DEPTH = 4;
export const DEFAULT_MAX_DISCOVERED_URLS = 10_000;
export const DEFAULT_MAX_HTML_PAGES = 10_000;
export const DEFAULT_MAX_SITEMAP_BYTES = 512 * 1024;
export const DEFAULT_MAX_HTML_BYTES = 512 * 1024;
export const DEFAULT_SITEMAP_TIMEOUT_MS = 5_000;
export const DEFAULT_HTML_TIMEOUT_MS = 5_000;

export type SitemapKind = "urlset" | "sitemapindex" | "unknown";

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
};

export type ParsedSitemap = {
  kind: SitemapKind;
  entries: SitemapEntry[];
};

export type ScannerV2DiscoveryResult = {
  manifest: CrawlManifest;
  sitemapSources: ScanPageSource[];
  pageSources: ScanPageSource[];
  sitemapDocuments: number;
  sitemapUrlsDiscovered: number;
  htmlPagesFetched: number;
  htmlLinksDiscovered: number;
  urlsDroppedByLimit: number;
  warnings: string[];
  limitReached: boolean;
  incomplete: boolean;
};

export type ScannerV2DiscoveryOptions = {
  lookup?: LookupFn;
  get?: HttpGetFn;
  maxSitemapDocuments?: number;
  maxSitemapDepth?: number;
  maxDiscoveredUrls?: number;
  maxHtmlPages?: number;
  maxSitemapBytes?: number;
  maxHtmlBytes?: number;
  sitemapTimeoutMs?: number;
  htmlTimeoutMs?: number;
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function tagText(xml: string, name: string): string | undefined {
  const match = new RegExp(
    `<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`,
    "i",
  ).exec(xml);
  const value = match?.[1] ? decodeXml(match[1]).trim() : "";
  return value || undefined;
}

export function parseSitemapXml(xml: string): ParsedSitemap {
  const root = /<sitemapindex\b/i.test(xml)
    ? "sitemapindex"
    : /<urlset\b/i.test(xml)
      ? "urlset"
      : "unknown";

  if (root === "unknown") return { kind: root, entries: [] };

  const itemTag = root === "sitemapindex" ? "sitemap" : "url";
  const items = [
    ...xml.matchAll(
      new RegExp(`<${itemTag}\\b[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, "gi"),
    ),
  ];

  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const body = item[1] ?? "";
    const loc = tagText(body, "loc");
    if (!loc || seen.has(loc)) continue;
    seen.add(loc);
    const lastmod = tagText(body, "lastmod");
    entries.push(lastmod ? { loc, lastmod } : { loc });
  }
  return { kind: root, entries };
}

/**
 * Sitemap records are parsed independently from robots user-agent groups.
 * This deliberately leaves the existing V1 robots parser semantics untouched.
 */
export function parseRobotsSitemaps(
  body: string,
  baseOrigin: URL,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    const match = /^sitemap\s*:\s*(\S.*?)\s*$/i.exec(line);
    if (!match?.[1]) continue;
    let url: URL;
    try {
      url = new URL(match[1], baseOrigin);
    } catch {
      continue;
    }
    url.hash = "";
    if (url.protocol !== "https:" || url.origin !== baseOrigin.origin) continue;
    const allow = allowPublicHttpsUrl(url.toString());
    if (!allow.ok) continue;
    const canonical = allow.url.toString();
    if (!seen.has(canonical)) {
      seen.add(canonical);
      out.push(canonical);
    }
  }

  return out;
}

function normalizeDiscoveredUrl(
  raw: string,
  origin: URL,
): string | null {
  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return null;
  }
  url.hash = "";
  if (url.protocol !== "https:" || url.origin !== origin.origin) return null;
  const allow = allowPublicHttpsUrl(url.toString());
  if (!allow.ok) return null;
  return allow.url.toString();
}

function displayRejectedUrl(raw: string, origin: URL): string {
  try {
    const parsed = new URL(raw, origin);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return raw.trim() || "invalid-url";
  }
}

export function discoverHtmlLinks(input: {
  html: string;
  pageUrl: string;
  origin: string;
}): CrawlUrlDisposition[] {
  let page: URL;
  let origin: URL;
  try {
    page = new URL(input.pageUrl);
    origin = new URL(input.origin);
  } catch {
    return [];
  }
  if (page.origin !== origin.origin || origin.protocol !== "https:") return [];

  const out: CrawlUrlDisposition[] = [];
  const seen = new Set<string>();
  for (const href of extractSameOriginHrefs(input.html, page)) {
    const normalized = normalizeDiscoveredUrl(href, origin);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push({
      url: normalized,
      status: "queued",
      discoveryReason: "html_link",
      discoveredFrom: page.toString(),
    });
  }
  return out;
}

class UrlAccumulator {
  private readonly rows = new Map<string, CrawlUrlDisposition>();
  private readonly maxUrls: number;
  limitReached = false;
  droppedByLimit = 0;

  constructor(maxUrls: number) {
    this.maxUrls = maxUrls;
  }

  add(row: CrawlUrlDisposition): boolean {
    if (this.rows.has(row.url)) return false;
    if (this.rows.size >= this.maxUrls) {
      this.limitReached = true;
      this.droppedByLimit += 1;
      return false;
    }
    this.rows.set(row.url, structuredClone(row));
    return true;
  }

  update(
    url: string,
    patch: Partial<Omit<CrawlUrlDisposition, "url" | "discoveryReason">>,
  ): void {
    const current = this.rows.get(url);
    if (!current) return;
    this.rows.set(url, { ...current, ...structuredClone(patch) });
  }

  get(url: string): CrawlUrlDisposition | undefined {
    const row = this.rows.get(url);
    return row ? structuredClone(row) : undefined;
  }

  values(): CrawlUrlDisposition[] {
    return [...this.rows.values()].map((row) => structuredClone(row));
  }
}

type RobotsDiscovery = {
  body: string;
  rules: RobotsRules;
  source?: ScanPageSource;
  warning?: string;
  incomplete: boolean;
};

async function fetchRobotsForDiscovery(
  origin: URL,
  options: ScannerV2DiscoveryOptions,
): Promise<RobotsDiscovery> {
  const url = new URL("/robots.txt", origin);
  try {
    const response = await fetchPublicHttps(url.toString(), {
      lookup: options.lookup,
      get: options.get,
      timeoutMs: Math.min(
        options.sitemapTimeoutMs ?? DEFAULT_SITEMAP_TIMEOUT_MS,
        DEFAULT_PAGE_TIMEOUT_MS,
      ),
      maxBytes: 64 * 1024,
      maxRedirects: 2,
    });

    if (response.status === 404 || response.status === 410) {
      return {
        body: "",
        rules: parseRobotsTxt(""),
        warning: "robots_not_found",
        incomplete: false,
      };
    }
    if (response.status >= 400) {
      return {
        body: "",
        rules: parseRobotsTxt(""),
        warning: `robots_http_${response.status}`,
        incomplete: true,
      };
    }

    return {
      body: response.body,
      rules: parseRobotsTxt(response.body),
      source: {
        url: response.url.toString(),
        status: response.status,
        bytes: Buffer.byteLength(response.body, "utf8"),
      },
      incomplete: false,
    };
  } catch {
    return {
      body: "",
      rules: parseRobotsTxt(""),
      warning: "robots_unavailable",
      incomplete: true,
    };
  }
}

function responseContentType(
  headers: Record<string, string>,
): string {
  return (
    Object.entries(headers).find(
      ([key]) => key.toLowerCase() === "content-type",
    )?.[1] ?? ""
  );
}

function isHtmlType(contentType: string): boolean {
  return /(?:text\/html|application\/xhtml\+xml)/i.test(contentType);
}

function isPlainTextType(contentType: string): boolean {
  return /^text\/plain\b/i.test(contentType);
}

function terminalHttpDisposition(status: number): {
  status: "policy_skipped" | "unresolved";
  reason: string;
} {
  if ([401, 403, 404, 410].includes(status)) {
    return { status: "policy_skipped", reason: `http_${status}` };
  }
  return { status: "unresolved", reason: `http_${status}` };
}

export async function discoverScannerV2Frontier(
  rawUrl: string,
  options: ScannerV2DiscoveryOptions = {},
): Promise<ScannerV2DiscoveryResult> {
  const initial = allowPublicHttpsUrl(rawUrl);
  if (!initial.ok) {
    throw new Error(`scanner_v2_discovery_denied:${initial.reason}`);
  }

  const origin = new URL(initial.url.origin);
  const maxSitemapDocuments =
    options.maxSitemapDocuments ?? DEFAULT_MAX_SITEMAP_DOCUMENTS;
  const maxSitemapDepth =
    options.maxSitemapDepth ?? DEFAULT_MAX_SITEMAP_DEPTH;
  const maxDiscoveredUrls =
    options.maxDiscoveredUrls ?? DEFAULT_MAX_DISCOVERED_URLS;
  const maxHtmlPages =
    options.maxHtmlPages ?? DEFAULT_MAX_HTML_PAGES;
  const maxSitemapBytes =
    options.maxSitemapBytes ?? DEFAULT_MAX_SITEMAP_BYTES;
  const maxHtmlBytes =
    options.maxHtmlBytes ?? DEFAULT_MAX_HTML_BYTES;
  const sitemapTimeoutMs =
    options.sitemapTimeoutMs ?? DEFAULT_SITEMAP_TIMEOUT_MS;
  const htmlTimeoutMs =
    options.htmlTimeoutMs ?? DEFAULT_HTML_TIMEOUT_MS;

  const warnings: string[] = [];
  const sitemapSources: ScanPageSource[] = [];
  const pageSources: ScanPageSource[] = [];
  const urls = new UrlAccumulator(maxDiscoveredUrls);
  urls.add({
    url: initial.url.toString(),
    status: "queued",
    discoveryReason: "submitted",
  });

  const robots = await fetchRobotsForDiscovery(origin, options);
  if (robots.warning) warnings.push(robots.warning);
  if (robots.source) sitemapSources.push(robots.source);

  let discoveryIncomplete = robots.incomplete;
  const declared = parseRobotsSitemaps(robots.body, origin);
  const sitemapQueue: Array<{ url: string; depth: number; declared: boolean }> =
    declared.length > 0
      ? declared.map((url) => ({ url, depth: 0, declared: true }))
      : [{
          url: new URL("/sitemap.xml", origin).toString(),
          depth: 0,
          declared: false,
        }];
  const sitemapSeen = new Set<string>();

  let sitemapUrlsDiscovered = 0;

  while (sitemapQueue.length > 0) {
    if (sitemapSeen.size >= maxSitemapDocuments) {
      warnings.push("sitemap_document_limit");
      discoveryIncomplete = true;
      break;
    }

    const next = sitemapQueue.shift();
    if (!next || sitemapSeen.has(next.url)) continue;

    if (next.depth > maxSitemapDepth) {
      warnings.push("sitemap_depth_limit");
      discoveryIncomplete = true;
      continue;
    }

    const normalizedSitemap = normalizeDiscoveredUrl(next.url, origin);
    if (!normalizedSitemap) {
      warnings.push("sitemap_url_rejected");
      if (next.declared) discoveryIncomplete = true;
      continue;
    }
    sitemapSeen.add(normalizedSitemap);

    let response;
    try {
      response = await fetchPublicHttps(normalizedSitemap, {
        lookup: options.lookup,
        get: options.get,
        timeoutMs: sitemapTimeoutMs,
        maxBytes: maxSitemapBytes,
        maxDecompressedBytes: maxSitemapBytes,
        acceptCompressed: true,
        maxRedirects: DEFAULT_MAX_REDIRECTS,
      });
    } catch {
      warnings.push("sitemap_fetch_failed");
      discoveryIncomplete = true;
      continue;
    }

    if (response.status === 404 || response.status === 410) {
      if (!next.declared && next.depth === 0 && sitemapSeen.size === 1) {
        warnings.push("sitemap_not_found");
      } else {
        warnings.push(`sitemap_http_${response.status}`);
        discoveryIncomplete = true;
      }
      continue;
    }
    if (response.status >= 400) {
      warnings.push(`sitemap_http_${response.status}`);
      discoveryIncomplete = true;
      continue;
    }

    const type = responseContentType(response.headers);
    if (
      type &&
      !/(?:xml|text\/plain|application\/octet-stream|application\/gzip|application\/x-gzip)/i.test(type)
    ) {
      warnings.push("sitemap_content_type_rejected");
      discoveryIncomplete = true;
      continue;
    }

    const bytes = Buffer.byteLength(response.body, "utf8");
    if (bytes > maxSitemapBytes) {
      warnings.push("sitemap_byte_limit");
      discoveryIncomplete = true;
      continue;
    }

    sitemapSources.push({
      url: response.url.toString(),
      status: response.status,
      bytes,
    });

    const parsed = parseSitemapXml(response.body);
    if (parsed.kind === "unknown") {
      warnings.push("sitemap_invalid_xml");
      discoveryIncomplete = true;
      continue;
    }

    if (parsed.kind === "sitemapindex") {
      for (const entry of parsed.entries) {
        const normalized = normalizeDiscoveredUrl(entry.loc, origin);
        if (!normalized) {
          warnings.push("sitemap_child_rejected");
          discoveryIncomplete = true;
          continue;
        }
        if (next.depth >= maxSitemapDepth) {
          warnings.push("sitemap_depth_limit");
          discoveryIncomplete = true;
          continue;
        }
        if (!sitemapSeen.has(normalized)) {
          sitemapQueue.push({
            url: normalized,
            depth: next.depth + 1,
            declared: true,
          });
        }
      }
      continue;
    }

    for (const entry of parsed.entries) {
      const normalized = normalizeDiscoveredUrl(entry.loc, origin);
      if (!normalized) {
        warnings.push("sitemap_page_rejected");
        urls.add({
          url: displayRejectedUrl(entry.loc, origin),
          status: "policy_skipped",
          discoveryReason: "sitemap",
          discoveredFrom: response.url.toString(),
          reason: "sitemap_page_rejected",
          ...(entry.lastmod ? { sitemapLastModified: entry.lastmod } : {}),
        });
        continue;
      }
      const added = urls.add({
        url: normalized,
        status: "queued",
        discoveryReason: "sitemap",
        discoveredFrom: response.url.toString(),
        ...(entry.lastmod ? { sitemapLastModified: entry.lastmod } : {}),
      });
      if (added) sitemapUrlsDiscovered += 1;
    }
  }

  if (urls.limitReached) {
    warnings.push("discovered_url_limit");
    discoveryIncomplete = true;
  }

  // Walk every accepted same-origin HTML page so a deep page reachable only by
  // internal links joins the same frontier as sitemap-discovered pages.
  const pageQueue = urls
    .values()
    .filter((row) => row.status === "queued")
    .map((row) => row.url);
  const pageQueued = new Set(pageQueue);
  const pageAttempted = new Set<string>();
  let htmlFetchAttempts = 0;
  let htmlPagesFetched = 0;
  let htmlLinksDiscovered = 0;

  while (pageQueue.length > 0) {
    const pageUrl = pageQueue.shift();
    if (!pageUrl || pageAttempted.has(pageUrl)) continue;
    pageAttempted.add(pageUrl);

    const current = urls.get(pageUrl);
    if (!current || current.status !== "queued") continue;

    let parsed: URL;
    try {
      parsed = new URL(pageUrl);
    } catch {
      urls.update(pageUrl, {
        status: "unresolved",
        reason: "invalid_queued_url",
      });
      discoveryIncomplete = true;
      continue;
    }

    if (!isPathAllowed(robots.rules, parsed.pathname || "/")) {
      urls.update(pageUrl, {
        status: "robots_skipped",
        reason: "robots_disallow",
      });
      continue;
    }

    if (htmlFetchAttempts >= maxHtmlPages) {
      warnings.push("html_page_limit");
      discoveryIncomplete = true;
      break;
    }
    htmlFetchAttempts += 1;

    let response;
    try {
      response = await fetchPublicHttps(pageUrl, {
        lookup: options.lookup,
        get: options.get,
        timeoutMs: htmlTimeoutMs,
        maxBytes: maxHtmlBytes,
        maxRedirects: DEFAULT_MAX_REDIRECTS,
      });
    } catch (error) {
      urls.update(pageUrl, {
        status: "unresolved",
        reason:
          error instanceof ScanError
            ? error.code
            : "fetch_failed",
      });
      discoveryIncomplete = true;
      continue;
    }

    if (response.url.origin !== origin.origin) {
      urls.update(pageUrl, {
        status: "policy_skipped",
        reason: "cross_origin_redirect",
      });
      warnings.push("cross_origin_redirect");
      continue;
    }

    if (response.status >= 400) {
      const terminal = terminalHttpDisposition(response.status);
      urls.update(pageUrl, terminal);
      if (terminal.status === "unresolved") discoveryIncomplete = true;
      continue;
    }

    const contentType = responseContentType(response.headers);
    const bytes = Buffer.byteLength(response.body, "utf8");
    pageSources.push({
      url: response.url.toString(),
      status: response.status,
      bytes,
    });

    if (!isHtmlType(contentType) && !isPlainTextType(contentType)) {
      urls.update(pageUrl, {
        status: "policy_skipped",
        reason: "content_type_not_stage2_html",
      });
      continue;
    }

    urls.update(pageUrl, {
      status: "fetched",
      canonicalUrl: response.url.toString(),
      fetchedAt: new Date().toISOString(),
    });

    if (!isHtmlType(contentType)) continue;

    htmlPagesFetched += 1;
    const discovered = discoverHtmlLinks({
      html: response.body,
      pageUrl: response.url.toString(),
      origin: origin.origin,
    });

    for (const row of discovered) {
      const added = urls.add(row);
      if (!added) continue;
      htmlLinksDiscovered += 1;
      if (!pageQueued.has(row.url)) {
        pageQueued.add(row.url);
        pageQueue.push(row.url);
      }
    }

    if (urls.limitReached) {
      warnings.push("discovered_url_limit");
      discoveryIncomplete = true;
      break;
    }
  }

  // If a page limit stopped the walk, queued rows remain visibly queued and
  // therefore cannot later be mistaken for a COMPLETE manifest.
  const stillQueued = urls.values().some((row) => row.status === "queued");
  if (stillQueued) discoveryIncomplete = true;

  const requestedState = discoveryIncomplete ? "PARTIAL" : "DISCOVERING";
  const manifest = buildCrawlManifest({
    crawlId: "scanner-v2-discovery",
    origin: origin.origin,
    requestedState,
    urls: urls.values(),
  });

  return {
    manifest,
    sitemapSources,
    pageSources,
    sitemapDocuments: sitemapSeen.size,
    sitemapUrlsDiscovered,
    htmlPagesFetched,
    htmlLinksDiscovered,
    urlsDroppedByLimit: urls.droppedByLimit,
    warnings: [...new Set(warnings)],
    limitReached: urls.limitReached,
    incomplete: discoveryIncomplete,
  };
}
