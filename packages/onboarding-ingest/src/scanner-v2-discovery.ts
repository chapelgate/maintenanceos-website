import {
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_PAGE_TIMEOUT_MS,
  fetchPublicHttps,
} from "./fetch-safe.ts";
import { extractSameOriginHrefs } from "./extract.ts";
import { allowPublicHttpsUrl } from "./ssrf.ts";
import { buildCrawlManifest } from "./scanner-v2-foundation.ts";
import type {
  CrawlManifest,
  CrawlUrlDisposition,
  HttpGetFn,
  LookupFn,
  ScanPageSource,
} from "./types.ts";

export const DEFAULT_MAX_SITEMAP_DOCUMENTS = 64;
export const DEFAULT_MAX_DISCOVERED_URLS = 10_000;
export const DEFAULT_MAX_SITEMAP_BYTES = 512 * 1024;
export const DEFAULT_SITEMAP_TIMEOUT_MS = 5_000;

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
  sitemapDocuments: number;
  sitemapUrlsDiscovered: number;
  warnings: string[];
  limitReached: boolean;
};

export type ScannerV2DiscoveryOptions = {
  lookup?: LookupFn;
  get?: HttpGetFn;
  maxSitemapDocuments?: number;
  maxDiscoveredUrls?: number;
  maxSitemapBytes?: number;
  sitemapTimeoutMs?: number;
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
  limitReached = false;

  constructor(private readonly maxUrls: number) {}

  add(row: CrawlUrlDisposition): boolean {
    if (this.rows.has(row.url)) return false;
    if (this.rows.size >= this.maxUrls) {
      this.limitReached = true;
      return false;
    }
    this.rows.set(row.url, row);
    return true;
  }

  values(): CrawlUrlDisposition[] {
    return [...this.rows.values()];
  }
}

async function fetchRobotsForSitemaps(
  origin: URL,
  options: ScannerV2DiscoveryOptions,
): Promise<{ body: string; source?: ScanPageSource; warning?: string }> {
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
    if (response.status >= 400) {
      return { body: "", warning: `robots_http_${response.status}` };
    }
    return {
      body: response.body,
      source: {
        url: response.url.toString(),
        status: response.status,
        bytes: Buffer.byteLength(response.body, "utf8"),
      },
    };
  } catch {
    return { body: "", warning: "robots_unavailable" };
  }
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
  const maxDiscoveredUrls =
    options.maxDiscoveredUrls ?? DEFAULT_MAX_DISCOVERED_URLS;
  const maxSitemapBytes =
    options.maxSitemapBytes ?? DEFAULT_MAX_SITEMAP_BYTES;
  const sitemapTimeoutMs =
    options.sitemapTimeoutMs ?? DEFAULT_SITEMAP_TIMEOUT_MS;

  const warnings: string[] = [];
  const sitemapSources: ScanPageSource[] = [];
  const urls = new UrlAccumulator(maxDiscoveredUrls);
  urls.add({
    url: initial.url.toString(),
    status: "queued",
    discoveryReason: "submitted",
  });

  const robots = await fetchRobotsForSitemaps(origin, options);
  if (robots.warning) warnings.push(robots.warning);
  if (robots.source) sitemapSources.push(robots.source);

  const declared = parseRobotsSitemaps(robots.body, origin);
  const sitemapQueue =
    declared.length > 0
      ? [...declared]
      : [new URL("/sitemap.xml", origin).toString()];
  const sitemapSeen = new Set<string>();

  let sitemapUrlsDiscovered = 0;
  while (sitemapQueue.length > 0) {
    if (sitemapSeen.size >= maxSitemapDocuments) {
      warnings.push("sitemap_document_limit");
      break;
    }

    const next = sitemapQueue.shift();
    if (!next || sitemapSeen.has(next)) continue;

    const normalizedSitemap = normalizeDiscoveredUrl(next, origin);
    if (!normalizedSitemap) {
      warnings.push("sitemap_url_rejected");
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
        maxRedirects: DEFAULT_MAX_REDIRECTS,
      });
    } catch {
      warnings.push("sitemap_fetch_failed");
      continue;
    }

    if (response.status === 404 || response.status === 410) {
      if (declared.length === 0 && sitemapSeen.size === 1) {
        warnings.push("sitemap_not_found");
      } else {
        warnings.push(`sitemap_http_${response.status}`);
      }
      continue;
    }
    if (response.status >= 400) {
      warnings.push(`sitemap_http_${response.status}`);
      continue;
    }

    const type =
      Object.entries(response.headers).find(
        ([key]) => key.toLowerCase() === "content-type",
      )?.[1] ?? "";
    if (
      type &&
      !/(?:xml|text\/plain|application\/octet-stream)/i.test(type)
    ) {
      warnings.push("sitemap_content_type_rejected");
      continue;
    }

    const bytes = Buffer.byteLength(response.body, "utf8");
    if (bytes > maxSitemapBytes) {
      warnings.push("sitemap_byte_limit");
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
      continue;
    }

    if (parsed.kind === "sitemapindex") {
      for (const entry of parsed.entries) {
        const normalized = normalizeDiscoveredUrl(entry.loc, origin);
        if (!normalized) {
          warnings.push("sitemap_child_rejected");
          continue;
        }
        if (!sitemapSeen.has(normalized)) sitemapQueue.push(normalized);
      }
      continue;
    }

    for (const entry of parsed.entries) {
      const normalized = normalizeDiscoveredUrl(entry.loc, origin);
      if (!normalized) {
        warnings.push("sitemap_page_rejected");
        continue;
      }
      sitemapUrlsDiscovered += 1;
      urls.add({
        url: normalized,
        status: "queued",
        discoveryReason: "sitemap",
        discoveredFrom: response.url.toString(),
      });
    }
  }

  if (urls.limitReached) warnings.push("discovered_url_limit");

  const requestedState = urls.limitReached ? "PARTIAL" : "DISCOVERING";
  const manifest = buildCrawlManifest({
    crawlId: "scanner-v2-discovery",
    origin: origin.origin,
    requestedState,
    urls: urls.values(),
  });

  return {
    manifest,
    sitemapSources,
    sitemapDocuments: sitemapSeen.size,
    sitemapUrlsDiscovered,
    warnings: [...new Set(warnings)],
    limitReached: urls.limitReached,
  };
}
