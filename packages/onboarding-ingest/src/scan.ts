/**
 * Feature-flagged website scan: robots-aware, capped, SSRF-safe.
 * Returns only fields extracted from fetched pages. Never invents copy.
 */

import {
  extractDraftFromHtml,
  extractSameOriginHrefs,
  extractSameOriginScriptSrcs,
  extractStructuredBusinessHtmlFromScript,
  rankCandidateUrls,
  extractVisiblePhones,
  extractVisibleEmails,
} from "./extract.ts";
import {
  DEFAULT_MAX_BYTES_PER_PAGE,
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_PAGE_TIMEOUT_MS,
  fetchPublicHttps,
  isHtmlOrText,
  ssrfMessage,
} from "./fetch-safe.ts";
import { siteBlockedScan, warningsWithSiteBlock } from "./site-block.ts";
import { allowPublicHttpsUrl, sameRegistrableSite } from "./ssrf.ts";
import {
  ScanError,
  type HttpGetFn,
  type LookupFn,
  type ScanDeps,
  type ScanPageSource,
  type ScanResult,
} from "./types.ts";

export const MAX_PAGES = 5;
export const MAX_TOTAL_BYTES = 768 * 1024;
export const TOTAL_DEADLINE_MS = 12_000;
export const MAX_STATIC_SCRIPT_ASSETS = 1;
export const MAX_STATIC_SCRIPT_BYTES = 640 * 1024;
export const READER_FALLBACK_ORIGIN = "https://r.jina.ai";
export const READER_FALLBACK_TIMEOUT_MS = 9_000;
export const READER_FALLBACK_MAX_BYTES = 256 * 1024;
export const MAX_READER_PAGES = 4;
export const OUR_USER_AGENT_TOKEN = "MaintenanceOS-OnboardingScan";

export function isWebIngestEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.ONBOARDING_WEB_INGEST;
  return value === "true" || value === "1";
}

export type RobotsRules = {
  allow: string[];
  disallow: string[];
  unavailable: boolean;
};

function pathMatches(rule: string, pathname: string): boolean {
  if (!rule) return false;
  if (rule === "/") return true;
  return pathname.startsWith(rule);
}

export function parseRobotsTxt(body: string, userAgent = OUR_USER_AGENT_TOKEN): RobotsRules {
  const lines = body.split(/\r?\n/).map((line) => line.replace(/#.*$/, "").trim());
  type Group = { agents: string[]; allow: string[]; disallow: string[] };
  const groups: Group[] = [];
  let current: Group | null = null;

  for (const line of lines) {
    if (!line) continue;
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();
    if (key === "user-agent") {
      if (!current || current.allow.length || current.disallow.length) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (key === "allow" && current) {
      current.allow.push(value);
    } else if (key === "disallow" && current) {
      current.disallow.push(value);
    }
  }

  const ua = userAgent.toLowerCase();
  const specific = groups.find((group) =>
    group.agents.some((agent) => agent !== "*" && ua.includes(agent)),
  );
  const star = groups.find((group) => group.agents.includes("*"));
  const chosen = specific ?? star;
  return {
    allow: chosen?.allow ?? [],
    disallow: chosen?.disallow ?? [],
    unavailable: false,
  };
}

export function isPathAllowed(rules: RobotsRules, pathname: string): boolean {
  if (rules.unavailable) return true;
  const path = pathname || "/";
  let decision: boolean | null = null;
  let matchedLen = -1;
  for (const rule of rules.disallow) {
    if (pathMatches(rule, path) && rule.length >= matchedLen) {
      decision = false;
      matchedLen = rule.length;
    }
  }
  for (const rule of rules.allow) {
    if (pathMatches(rule, path) && rule.length >= matchedLen) {
      decision = true;
      matchedLen = rule.length;
    }
  }
  return decision !== false;
}

async function loadRobots(
  origin: URL,
  deps: ScanDeps,
  remainingMs: number,
): Promise<RobotsRules> {
  const robotsUrl = new URL("/robots.txt", origin).toString();
  try {
    const res = await fetchPublicHttps(robotsUrl, {
      lookup: deps.lookup,
      get: deps.get,
      remainingMs,
      timeoutMs: Math.min(DEFAULT_PAGE_TIMEOUT_MS, remainingMs),
      maxBytes: 64 * 1024,
      maxRedirects: 2,
    });
    if (res.status === 404 || res.status === 410) {
      return { allow: [], disallow: [], unavailable: false };
    }
    if (res.status >= 400) {
      return { allow: [], disallow: [], unavailable: true };
    }
    return parseRobotsTxt(res.body);
  } catch {
    return { allow: [], disallow: [], unavailable: true };
  }
}

export type RunScanOptions = ScanDeps & {
  enabled?: boolean;
  now?: () => number;
  /**
   * Public reader fallback is production-default but opt-in for dependency-
   * injected tests so mocked direct fetches never cause accidental network I/O.
   */
  readerFallback?: boolean;
  readerLookup?: LookupFn;
  readerGet?: HttpGetFn;
};

export function isReaderChallengePage(html: string): boolean {
  const title = /<title[^>]*>\s*([^<]{1,160})\s*<\/title>/i.exec(html)?.[1]?.trim() ?? "";
  if (/^security verification$/i.test(title)) return true;

  const text = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();

  const challengeMarkers = [
    "verify you are human",
    "verify you're human",
    "verify you’re human",
    "checking your browser",
    "security verification",
    "captcha",
  ];
  const markerCount = challengeMarkers.filter((marker) => text.includes(marker)).length;
  return markerCount >= 2;
}

const CONTACT_PAGE_PATH_RE = /^\/(contact|contact-us|get-in-touch|find-us|about|about-us)\/?$/i;

async function fetchContactPage(
  baseUrl: URL,
  deps: RunScanOptions,
  remainingMs: () => number,
): Promise<string | undefined> {
  const contactPaths = ["/contact", "/contact-us", "/get-in-touch", "/find-us", "/about", "/about-us"];
  for (const path of contactPaths) {
    if (remainingMs() < 1000) break;
    const targetUrl = new URL(path, baseUrl);
    if (targetUrl.hostname !== baseUrl.hostname) continue;
    if (!isPathAllowed({ allow: [], disallow: [], unavailable: false }, targetUrl.pathname)) continue;
    try {
      const res = await fetchPublicHttps(targetUrl.toString(), {
        lookup: deps.lookup,
        get: deps.get,
        remainingMs: remainingMs(),
        timeoutMs: 5000,
        maxBytes: 128 * 1024,
        maxRedirects: 2,
      });
      if (res.status === 200 && isHtmlOrText(
        Object.entries(res.headers).find(([key]) => key.toLowerCase() === "content-type")?.[1] ?? ""
      )) {
        return res.body;
      }
    } catch {
      continue;
    }
  }
  return undefined;
}

export async function runScan(
  rawUrl: string,
  options: RunScanOptions = {},
): Promise<ScanResult> {
  const enabled = options.enabled ?? isWebIngestEnabled();
  if (!enabled) {
    return {
      ok: false,
      error: "scan_disabled",
      message:
        "Onboarding web ingest is disabled. Set ONBOARDING_WEB_INGEST=true to enable crawling.",
      warnings: ["scan_disabled"],
    };
  }

  const allow = allowPublicHttpsUrl(rawUrl);
  if (!allow.ok) {
    return {
      ok: false,
      error: allow.reason,
      message: ssrfMessage(allow.reason),
      warnings: ["ssrf_denied"],
    };
  }

  const now = options.now ?? Date.now;
  const started = now();
  const remaining = () => TOTAL_DEADLINE_MS - (now() - started);

  const warnings: string[] = [];
  const sources: ScanPageSource[] = [];
  const pages: { url: string; html: string }[] = [];
  let totalBytes = 0;
  const readerFallbackEnabled =
    options.readerFallback ?? (!options.lookup && !options.get);

  const robots = await loadRobots(allow.url, options, remaining());
  if (robots.unavailable) warnings.push("robots_unavailable");
  if (!isPathAllowed(robots, allow.url.pathname || "/")) {
    return {
      ok: false,
      error: "robots_disallow",
      message: "robots.txt disallows fetching this URL. No content was invented.",
      warnings: ["robots_disallow"],
    };
  }

  const queued = [allow.url.toString()];
  const seen = new Set<string>();

  while (queued.length && pages.length < MAX_PAGES) {
    if (remaining() < 400) {
      warnings.push("time_budget");
      break;
    }
    if (totalBytes >= MAX_TOTAL_BYTES) {
      warnings.push("byte_budget");
      break;
    }

    const next = queued.shift();
    if (!next || seen.has(next)) continue;
    seen.add(next);

    let nextUrl: URL;
    try {
      nextUrl = new URL(next);
    } catch {
      continue;
    }
    if (!isPathAllowed(robots, nextUrl.pathname || "/")) {
      warnings.push("robots_skipped_path");
      continue;
    }

    try {
      const res = await fetchPublicHttps(next, {
        lookup: options.lookup,
        get: options.get,
        remainingMs: remaining(),
        timeoutMs: DEFAULT_PAGE_TIMEOUT_MS,
        maxBytes: Math.min(
          DEFAULT_MAX_BYTES_PER_PAGE,
          MAX_TOTAL_BYTES - totalBytes,
        ),
        maxRedirects: DEFAULT_MAX_REDIRECTS,
      });
      const type = Object.entries(res.headers).find(
        ([key]) => key.toLowerCase() === "content-type",
      )?.[1] ?? "";
      if (!isHtmlOrText(type)) {
        warnings.push("skipped_non_html");
        continue;
      }
      if (res.status >= 400) {
        warnings.push(`http_${res.status}`);
        continue;
      }
      const bytes = Buffer.byteLength(res.body, "utf8");
      totalBytes += bytes;
      sources.push({ url: res.url.toString(), status: res.status, bytes });
      pages.push({ url: res.url.toString(), html: res.body });

      if (pages.length === 1) {
        const extra = rankCandidateUrls(
          extractSameOriginHrefs(res.body, res.url),
          allow.url,
        );
        for (const href of extra) {
          if (!seen.has(href) && queued.length + pages.length < MAX_PAGES) {
            queued.push(href);
          }
        }
      }
    } catch (err) {
      if (err instanceof ScanError && err.code.includes("non_public")) {
        return {
          ok: false,
          error: err.code,
          message: err.message,
          warnings: ["ssrf_denied"],
        };
      }
      warnings.push(err instanceof ScanError ? err.code : "fetch_failed");
    }
  }

  const readerEligibleFailure =
    warnings.includes("http_401") ||
    warnings.includes("http_403") ||
    warnings.includes("fetch_failed");

  if (
    !pages.length &&
    readerFallbackEnabled &&
    readerEligibleFailure &&
    remaining() >= 1_000
  ) {
    // Keep the fallback bounded and same-origin. The reader is only asked for
    // public HTTPS URLs that passed our initial URL guard, and any follow-up
    // pages come from same-origin links in the recovered public HTML.
    const readerQueue = [allow.url.toString()];
    const readerSeen = new Set<string>();

    while (
      readerQueue.length &&
      pages.length < MAX_READER_PAGES &&
      remaining() >= 1_000 &&
      totalBytes < MAX_TOTAL_BYTES
    ) {
      const target = readerQueue.shift();
      if (!target || readerSeen.has(target)) continue;
      readerSeen.add(target);

      let targetUrl: URL;
      try {
        targetUrl = new URL(target);
      } catch {
        continue;
      }
      if (
        targetUrl.protocol !== "https:" ||
        !sameRegistrableSite(targetUrl, allow.url)
      ) {
        continue;
      }
      if (!isPathAllowed(robots, targetUrl.pathname || "/")) {
        warnings.push("robots_skipped_reader_path");
        continue;
      }

      const remainingBytes = MAX_TOTAL_BYTES - totalBytes;
      if (remainingBytes < 1024) break;

      const readerUrl = `${READER_FALLBACK_ORIGIN}/${targetUrl.toString()}`;
      try {
        let acceptedBody: string | null = null;

        for (let attempt = 0; attempt < 2; attempt += 1) {
          const res = await fetchPublicHttps(readerUrl, {
            lookup: options.readerLookup,
            get: options.readerGet,
            remainingMs: remaining(),
            timeoutMs: Math.min(READER_FALLBACK_TIMEOUT_MS, remaining()),
            maxBytes: Math.min(READER_FALLBACK_MAX_BYTES, remainingBytes),
            maxRedirects: 2,
            headers: {
              Accept: "text/html",
              "X-Respond-With": "html",
              "X-No-Cache": "true",
            },
          });

          if (res.status >= 400) {
            warnings.push(`reader_http_${res.status}`);
            break;
          }
          if (!/<(?:html|head|body)\b/i.test(res.body)) {
            warnings.push("reader_non_html");
            break;
          }
          if (isReaderChallengePage(res.body)) {
            if (attempt === 0 && remaining() >= 1_000) {
              warnings.push("reader_challenge_retry");
              continue;
            }
            warnings.push("reader_challenge_rejected");
            break;
          }

          acceptedBody = res.body;
          break;
        }

        if (!acceptedBody) continue;

        const bytes = Buffer.byteLength(acceptedBody, "utf8");
        totalBytes += bytes;
        sources.push({
          url: targetUrl.toString(),
          status: 200,
          bytes,
        });
        pages.push({
          url: targetUrl.toString(),
          html: acceptedBody,
        });

        if (pages.length === 1) {
          const extra = rankCandidateUrls(
            extractSameOriginHrefs(acceptedBody, targetUrl),
            allow.url,
          );
          for (const href of extra) {
            if (
              !readerSeen.has(href) &&
              readerQueue.length + pages.length < MAX_READER_PAGES
            ) {
              readerQueue.push(href);
            }
          }
        }
      } catch (err) {
        warnings.push(
          err instanceof ScanError
            ? `reader_${err.code}`
            : "reader_fetch_failed",
        );
      }
    }

    if (pages.length) warnings.push("reader_fallback_used");
  }

  // One same-origin contact/about page fetch inside existing SSRF guards and
  // timeouts, so sites without JSON-LD can still yield phone/email/hours from
  // visible HTML. Only fetched when the crawl has pages and budget remains.
  if (pages.length > 0 && remaining() >= 1_500 && totalBytes < MAX_TOTAL_BYTES) {
    const firstPage = pages[0];
    let firstUrl: URL | null = null;
    try {
      firstUrl = new URL(firstPage.url);
    } catch {
      firstUrl = null;
    }
    if (firstUrl) {
      const contactHtml = await fetchContactPage(
        firstUrl,
        options,
        remaining,
      );
      if (contactHtml) {
        const bytes = Buffer.byteLength(contactHtml, "utf8");
        totalBytes += bytes;
        pages.push({ url: firstUrl.origin + "/contact", html: contactHtml });
        warnings.push("contact_page_fetched");
      }
    }
  }

  if (!pages.length) {
    const warningsOut = warnings.length ? warnings : ["no_pages_fetched"];
    if (siteBlockedScan({ fetched: 0, warnings: warningsOut })) {
      return {
        ok: true,
        untrusted: true,
        outcome: "blocked_by_site",
        draft: {},
        warnings: warningsWithSiteBlock(warningsOut),
        sources: [],
      };
    }
    return {
      ok: false,
      error: "fetch_failed",
      message: "No public pages could be fetched. No crawl results were invented.",
      warnings: warningsOut,
    };
  }

  let extracted = extractDraftFromHtml(pages);

  // Some public business sites deliberately ship a tiny static HTML shell and
  // compile schema.org business facts into their own same-origin JavaScript.
  // When the normal HTML crawl is thin, inspect (never execute) one bounded
  // same-origin asset and feed only explicit LocalBusiness literals back
  // through the existing claims-safe extractor.
  if (
    (!extracted.draft.hours || !extracted.draft.services) &&
    pages.length > 0 &&
    remaining() >= 500 &&
    totalBytes < MAX_TOTAL_BYTES
  ) {
    const firstPage = pages[0]!;
    let firstUrl: URL | null = null;
    try {
      firstUrl = new URL(firstPage.url);
    } catch {
      firstUrl = null;
    }

    if (firstUrl) {
      const scriptUrls = extractSameOriginScriptSrcs(firstPage.html, firstUrl)
        .slice(0, MAX_STATIC_SCRIPT_ASSETS);

      for (const scriptUrl of scriptUrls) {
        if (remaining() < 400 || totalBytes >= MAX_TOTAL_BYTES) break;

        let parsed: URL;
        try {
          parsed = new URL(scriptUrl);
        } catch {
          continue;
        }
        if (!isPathAllowed(robots, parsed.pathname || "/")) {
          warnings.push("robots_skipped_script");
          continue;
        }

        const remainingBytes = MAX_TOTAL_BYTES - totalBytes;
        if (remainingBytes < 1024) break;

        try {
          const res = await fetchPublicHttps(scriptUrl, {
            lookup: options.lookup,
            get: options.get,
            remainingMs: remaining(),
            timeoutMs: DEFAULT_PAGE_TIMEOUT_MS,
            maxBytes: Math.min(MAX_STATIC_SCRIPT_BYTES, remainingBytes),
            maxRedirects: DEFAULT_MAX_REDIRECTS,
          });
          if (res.status >= 400) {
            warnings.push(`script_http_${res.status}`);
            continue;
          }

          const type = Object.entries(res.headers).find(
            ([key]) => key.toLowerCase() === "content-type",
          )?.[1] ?? "";
          if (
            !/(?:java|ecma)script/i.test(type) &&
            !/\.m?js$/i.test(res.url.pathname)
          ) {
            warnings.push("skipped_non_script_asset");
            continue;
          }

          const bytes = Buffer.byteLength(res.body, "utf8");
          totalBytes += bytes;
          const synthetic = extractStructuredBusinessHtmlFromScript(res.body);
          if (!synthetic) continue;

          sources.push({ url: res.url.toString(), status: res.status, bytes });
          pages.push({ url: res.url.toString(), html: synthetic });
          warnings.push("static_script_schema_fallback");
          extracted = extractDraftFromHtml(pages);
          break;
        } catch (err) {
          warnings.push(
            err instanceof ScanError ? `script_${err.code}` : "script_fetch_failed",
          );
        }
      }
    }
  }

  return {
    ok: true,
    untrusted: true,
    draft: extracted.draft,
    warnings: [...new Set([...warnings, ...extracted.warnings])],
    sources,
    ...(Object.keys(extracted.facts).length ? { facts: extracted.facts } : {}),
    ...(Object.keys(extracted.factMeta).length ? { factMeta: extracted.factMeta } : {}),
    ...(Object.keys(extracted.fieldMeta).length
      ? { fieldMeta: extracted.fieldMeta }
      : {}),
  };
}
