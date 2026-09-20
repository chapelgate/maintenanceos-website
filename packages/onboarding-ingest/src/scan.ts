/**
 * Feature-flagged website scan: robots-aware, capped, SSRF-safe.
 * Returns only fields extracted from fetched pages. Never invents copy.
 */

import { extractDraftFromHtml, extractSameOriginHrefs, rankCandidateUrls } from "./extract.ts";
import {
  DEFAULT_MAX_BYTES_PER_PAGE,
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_PAGE_TIMEOUT_MS,
  fetchPublicHttps,
  isHtmlOrText,
  ssrfMessage,
} from "./fetch-safe.ts";
import { allowPublicHttpsUrl } from "./ssrf.ts";
import {
  ScanError,
  type ScanDeps,
  type ScanPageSource,
  type ScanResult,
} from "./types.ts";

export const MAX_PAGES = 5;
export const MAX_TOTAL_BYTES = 768 * 1024;
export const TOTAL_DEADLINE_MS = 12_000;
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
};

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

  if (!pages.length) {
    return {
      ok: false,
      error: "fetch_failed",
      message: "No public pages could be fetched. No crawl results were invented.",
      warnings: warnings.length ? warnings : ["no_pages_fetched"],
    };
  }

  const extracted = extractDraftFromHtml(pages);
  return {
    ok: true,
    untrusted: true,
    draft: extracted.draft,
    warnings: [...new Set([...warnings, ...extracted.warnings])],
    sources,
  };
}
