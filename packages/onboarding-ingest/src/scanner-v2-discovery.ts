import {
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_PAGE_TIMEOUT_MS,
  fetchPublicHttps,
} from "./fetch-safe.ts";
import { extractSameOriginHrefs } from "./extract.ts";
import { allowPublicHttpsUrl } from "./ssrf.ts";
import {
  buildCrawlManifest,
  stableContentHash,
} from "./scanner-v2-foundation.ts";
import {
  DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
  DEFAULT_MAX_PATH_DEPTH,
  DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
  extractScannerV2CanonicalLink,
  normalizeScannerV2Url,
  ScannerV2FrontierTrapGuard,
} from "./scanner-v2-url-policy.ts";
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
  /** Test callers may lower ceilings; values are clamped to hard maxima. */
  maxSitemapDocuments?: number;
  maxSitemapDepth?: number;
  maxDiscoveredUrls?: number;
  maxHtmlPages?: number;
  maxSitemapBytes?: number;
  maxHtmlBytes?: number;
  sitemapTimeoutMs?: number;
  htmlTimeoutMs?: number;
  maxPathDepth?: number;
  maxQueryVariantsPerSignature?: number;
  maxCalendarVariantsPerFamily?: number;
};

function boundedInt(
  value: number | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(
    maximum,
    Math.max(minimum, Math.trunc(value as number)),
  );
}

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
  options: {
    maxPathDepth?: number;
    applyContentPolicy?: boolean;
  } = {},
): string | null {
  const result = normalizeScannerV2Url(raw, origin, {
    maxPathDepth: options.maxPathDepth,
    applyContentPolicy: options.applyContentPolicy,
  });
  return result.ok ? result.url : null;
}

export function discoverHtmlLinks(input: {
  html: string;
  pageUrl: string;
  origin: string;
  maxPathDepth?: number;
  discoveryReason?: "html_link" | "rendered_link";
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
    const normalized = normalizeDiscoveredUrl(href, origin, {
      maxPathDepth: input.maxPathDepth,
      applyContentPolicy: true,
    });
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push({
      url: normalized,
      status: "queued",
      discoveryReason: input.discoveryReason ?? "html_link",
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
  const maxSitemapDocuments = boundedInt(
    options.maxSitemapDocuments,
    DEFAULT_MAX_SITEMAP_DOCUMENTS,
    1,
    DEFAULT_MAX_SITEMAP_DOCUMENTS,
  );
  const maxSitemapDepth = boundedInt(
    options.maxSitemapDepth,
    DEFAULT_MAX_SITEMAP_DEPTH,
    0,
    DEFAULT_MAX_SITEMAP_DEPTH,
  );
  const maxDiscoveredUrls = boundedInt(
    options.maxDiscoveredUrls,
    DEFAULT_MAX_DISCOVERED_URLS,
    1,
    DEFAULT_MAX_DISCOVERED_URLS,
  );
  const maxHtmlPages = boundedInt(
    options.maxHtmlPages,
    DEFAULT_MAX_HTML_PAGES,
    1,
    DEFAULT_MAX_HTML_PAGES,
  );
  const maxSitemapBytes = boundedInt(
    options.maxSitemapBytes,
    DEFAULT_MAX_SITEMAP_BYTES,
    1024,
    DEFAULT_MAX_SITEMAP_BYTES,
  );
  const maxHtmlBytes = boundedInt(
    options.maxHtmlBytes,
    DEFAULT_MAX_HTML_BYTES,
    1024,
    DEFAULT_MAX_HTML_BYTES,
  );
  const sitemapTimeoutMs = boundedInt(
    options.sitemapTimeoutMs,
    DEFAULT_SITEMAP_TIMEOUT_MS,
    250,
    DEFAULT_SITEMAP_TIMEOUT_MS,
  );
  const htmlTimeoutMs = boundedInt(
    options.htmlTimeoutMs,
    DEFAULT_HTML_TIMEOUT_MS,
    250,
    DEFAULT_HTML_TIMEOUT_MS,
  );
  const maxPathDepth = boundedInt(
    options.maxPathDepth,
    DEFAULT_MAX_PATH_DEPTH,
    1,
    DEFAULT_MAX_PATH_DEPTH,
  );
  const maxQueryVariantsPerSignature = boundedInt(
    options.maxQueryVariantsPerSignature,
    DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
    1,
    DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
  );
  const maxCalendarVariantsPerFamily = boundedInt(
    options.maxCalendarVariantsPerFamily,
    DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
    1,
    DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
  );

  const warnings: string[] = [];
  const sitemapSources: ScanPageSource[] = [];
  const pageSources: ScanPageSource[] = [];
  const urls = new UrlAccumulator(maxDiscoveredUrls);
  const trapGuard = new ScannerV2FrontierTrapGuard({
    maxQueryVariantsPerSignature,
    maxCalendarVariantsPerFamily,
  });
  const contentOwnerByHash = new Map<string, string>();
  let discoveryIncomplete = false;

  const root = normalizeScannerV2Url(initial.url.toString(), origin, {
    maxPathDepth,
    applyContentPolicy: true,
  });
  if (!root.ok) {
    throw new Error(`scanner_v2_discovery_policy:${root.reason}`);
  }
  if (root.aliasUrl) {
    urls.add({
      url: root.aliasUrl,
      canonicalUrl: root.url,
      status: "duplicate",
      discoveryReason: "submitted",
      reason: "normalized_url_variant",
    });
  }
  urls.add({
    url: root.url,
    status: "queued",
    discoveryReason: "submitted",
  });
  trapGuard.evaluate(root.url);

  const robots = await fetchRobotsForDiscovery(origin, options);
  if (robots.warning) warnings.push(robots.warning);
  if (robots.source) sitemapSources.push(robots.source);
  discoveryIncomplete = discoveryIncomplete || robots.incomplete;

  function admitPageCandidate(
    raw: string,
    metadata: Pick<CrawlUrlDisposition, "discoveryReason"> &
      Partial<
        Pick<
          CrawlUrlDisposition,
          "discoveredFrom" | "sitemapLastModified"
        >
      >,
  ): { url: string; added: boolean } | null {
    const normalized = normalizeScannerV2Url(raw, origin, {
      maxPathDepth,
      applyContentPolicy: true,
    });

    if (!normalized.ok) {
      urls.add({
        url: normalized.displayUrl,
        status: "policy_skipped",
        discoveryReason: metadata.discoveryReason,
        ...(metadata.discoveredFrom
          ? { discoveredFrom: metadata.discoveredFrom }
          : {}),
        ...(metadata.sitemapLastModified
          ? { sitemapLastModified: metadata.sitemapLastModified }
          : {}),
        reason: normalized.reason,
      });
      if (normalized.incomplete) {
        discoveryIncomplete = true;
        warnings.push(normalized.reason);
      }
      return null;
    }

    const trap = trapGuard.evaluate(normalized.url);
    if (!trap.ok) {
      urls.add({
        url: normalized.url,
        status: "policy_skipped",
        discoveryReason: metadata.discoveryReason,
        ...(metadata.discoveredFrom
          ? { discoveredFrom: metadata.discoveredFrom }
          : {}),
        ...(metadata.sitemapLastModified
          ? { sitemapLastModified: metadata.sitemapLastModified }
          : {}),
        reason: trap.reason,
      });
      discoveryIncomplete = true;
      warnings.push(trap.reason);
      return null;
    }

    const added = urls.add({
      url: normalized.url,
      status: "queued",
      discoveryReason: metadata.discoveryReason,
      ...(metadata.discoveredFrom
        ? { discoveredFrom: metadata.discoveredFrom }
        : {}),
      ...(metadata.sitemapLastModified
        ? { sitemapLastModified: metadata.sitemapLastModified }
        : {}),
    });

    if (normalized.aliasUrl && normalized.aliasUrl !== normalized.url) {
      urls.add({
        url: normalized.aliasUrl,
        canonicalUrl: normalized.url,
        status: "duplicate",
        discoveryReason: metadata.discoveryReason,
        ...(metadata.discoveredFrom
          ? { discoveredFrom: metadata.discoveredFrom }
          : {}),
        ...(metadata.sitemapLastModified
          ? { sitemapLastModified: metadata.sitemapLastModified }
          : {}),
        reason: "normalized_url_variant",
      });
    }

    return { url: normalized.url, added };
  }

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
    const next = sitemapQueue.shift();
    if (!next) continue;

    const normalizedSitemap = normalizeDiscoveredUrl(next.url, origin, {
      maxPathDepth,
      applyContentPolicy: false,
    });
    if (!normalizedSitemap) {
      warnings.push("sitemap_url_rejected");
      if (next.declared) discoveryIncomplete = true;
      continue;
    }
    if (sitemapSeen.has(normalizedSitemap)) continue;

    if (next.depth > maxSitemapDepth) {
      warnings.push("sitemap_depth_limit");
      discoveryIncomplete = true;
      continue;
    }
    if (sitemapSeen.size >= maxSitemapDocuments) {
      warnings.push("sitemap_document_limit");
      discoveryIncomplete = true;
      break;
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
        const normalized = normalizeDiscoveredUrl(entry.loc, origin, {
          maxPathDepth,
          applyContentPolicy: false,
        });
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
      const admitted = admitPageCandidate(entry.loc, {
        discoveryReason: "sitemap",
        discoveredFrom: response.url.toString(),
        ...(entry.lastmod ? { sitemapLastModified: entry.lastmod } : {}),
      });
      if (!admitted) {
        warnings.push("sitemap_page_rejected");
        continue;
      }
      if (admitted.added) sitemapUrlsDiscovered += 1;
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

    const finalUrlPolicy = normalizeScannerV2Url(
      response.url.toString(),
      origin,
      {
        maxPathDepth,
        applyContentPolicy: true,
      },
    );
    if (!finalUrlPolicy.ok) {
      urls.update(pageUrl, {
        status: "policy_skipped",
        reason: finalUrlPolicy.reason,
      });
      if (finalUrlPolicy.incomplete) {
        discoveryIncomplete = true;
        warnings.push(finalUrlPolicy.reason);
      }
      continue;
    }

    const effectiveUrl = finalUrlPolicy.url;
    const fetchedAt = new Date().toISOString();
    const contentHash = stableContentHash(response.body);

    if (effectiveUrl !== pageUrl) {
      const existingFinal = urls.get(effectiveUrl);
      if (existingFinal) {
        urls.update(effectiveUrl, {
          status: "fetched",
          canonicalUrl: effectiveUrl,
          fetchedAt,
          contentHash,
        });
      } else {
        urls.add({
          url: effectiveUrl,
          status: "fetched",
          discoveryReason: "canonical",
          discoveredFrom: pageUrl,
          canonicalUrl: effectiveUrl,
          fetchedAt,
          contentHash,
        });
      }
      urls.update(pageUrl, {
        status: "duplicate",
        canonicalUrl: effectiveUrl,
        reason: "redirect_canonical",
        contentHash,
        fetchedAt,
      });
    }

    let canonicalTarget = effectiveUrl;
    let canonicalReason: "rel_canonical" | "content_hash_duplicate" | null =
      null;

    if (isHtmlType(contentType)) {
      const canonical = extractScannerV2CanonicalLink({
        html: response.body,
        pageUrl: response.url.toString(),
        origin: origin.origin,
        maxPathDepth,
      });
      if (canonical?.ok && canonical.url !== effectiveUrl) {
        const admittedCanonical = admitPageCandidate(canonical.url, {
          discoveryReason: "canonical",
          discoveredFrom: effectiveUrl,
        });
        if (admittedCanonical) {
          canonicalTarget = admittedCanonical.url;
          canonicalReason = "rel_canonical";
          if (
            admittedCanonical.added &&
            !pageQueued.has(admittedCanonical.url)
          ) {
            pageQueued.add(admittedCanonical.url);
            pageQueue.push(admittedCanonical.url);
          }
        }
      } else if (canonical && !canonical.ok) {
        warnings.push("canonical_rejected");
      }
    }

    if (!canonicalReason) {
      const existingOwner = contentOwnerByHash.get(contentHash);
      if (existingOwner && existingOwner !== effectiveUrl) {
        canonicalTarget = existingOwner;
        canonicalReason = "content_hash_duplicate";
      } else {
        contentOwnerByHash.set(contentHash, effectiveUrl);
      }
    } else {
      contentOwnerByHash.set(contentHash, canonicalTarget);
    }

    if (canonicalReason) {
      const existingEffective = urls.get(effectiveUrl);
      if (existingEffective) {
        urls.update(effectiveUrl, {
          status: "duplicate",
          canonicalUrl: canonicalTarget,
          reason: canonicalReason,
          contentHash,
          fetchedAt,
        });
      } else {
        urls.add({
          url: effectiveUrl,
          status: "duplicate",
          discoveryReason: "canonical",
          discoveredFrom: pageUrl,
          canonicalUrl: canonicalTarget,
          reason: canonicalReason,
          contentHash,
          fetchedAt,
        });
      }
      if (pageUrl !== effectiveUrl) {
        urls.update(pageUrl, {
          status: "duplicate",
          canonicalUrl: canonicalTarget,
          reason:
            canonicalReason === "rel_canonical"
              ? "redirect_then_rel_canonical"
              : "redirect_then_content_hash_duplicate",
          contentHash,
          fetchedAt,
        });
      }
    } else {
      const existingEffective = urls.get(effectiveUrl);
      if (existingEffective) {
        urls.update(effectiveUrl, {
          status: "fetched",
          canonicalUrl: effectiveUrl,
          contentHash,
          fetchedAt,
        });
      }
      if (pageUrl === effectiveUrl) {
        urls.update(pageUrl, {
          status: "fetched",
          canonicalUrl: effectiveUrl,
          contentHash,
          fetchedAt,
        });
      }
    }

    if (!isHtmlType(contentType)) continue;

    htmlPagesFetched += 1;
    const hrefs = extractSameOriginHrefs(response.body, response.url);
    for (const href of hrefs) {
      const admitted = admitPageCandidate(href, {
        discoveryReason: "html_link",
        discoveredFrom: effectiveUrl,
      });
      if (!admitted?.added) continue;
      htmlLinksDiscovered += 1;
      if (!pageQueued.has(admitted.url)) {
        pageQueued.add(admitted.url);
        pageQueue.push(admitted.url);
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
