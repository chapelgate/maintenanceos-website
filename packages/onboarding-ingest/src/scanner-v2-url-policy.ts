import { allowPublicHttpsUrl } from "./ssrf.ts";

export const DEFAULT_MAX_PATH_DEPTH = 16;
export const DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE = 64;
export const DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY = 24;

const TRACKING_PARAM_NAMES = new Set([
  "dclid",
  "fbclid",
  "gclid",
  "gbraid",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "twclid",
  "wbraid",
  "_ga",
  "_gl",
]);

const SESSION_OR_TOKEN_PARAM = /^(?:sid|session|sessionid|session_id|phpsessid|jsessionid|aspsessionid|token|access_token|auth|auth_token|csrf|csrf_token|nonce)$/i;

const BLOCKED_PATH_SEGMENTS = new Set([
  "admin",
  "administrator",
  "basket",
  "cart",
  "checkout",
  "login",
  "logout",
  "my-account",
  "account",
  "wp-admin",
  "wp-login.php",
]);

const SEARCH_PATH_SEGMENTS = new Set([
  "search",
  "search-results",
  "searchresults",
]);

const CALENDAR_QUERY_PARAMS = new Set([
  "calendar",
  "date",
  "day",
  "month",
  "year",
]);

export type ScannerV2UrlPolicyReason =
  | "invalid_url"
  | "insecure_scheme"
  | "cross_origin"
  | "non_public_url"
  | "blocked_path"
  | "search_endpoint"
  | "session_or_token_parameter"
  | "path_depth_limit";

export type ScannerV2UrlPolicyResult =
  | {
      ok: true;
      url: string;
      /** Same URL before safe tracking-parameter removal. */
      aliasUrl?: string;
      strippedTrackingParams: string[];
    }
  | {
      ok: false;
      displayUrl: string;
      reason: ScannerV2UrlPolicyReason;
      /** True when the safety policy may have truncated otherwise useful content. */
      incomplete: boolean;
    };

export type ScannerV2UrlPolicyOptions = {
  maxPathDepth?: number;
  /** Sitemap documents use URL safety but not business-page endpoint policy. */
  applyContentPolicy?: boolean;
};

function boundedPathDepth(value: number | undefined): number {
  if (!Number.isFinite(value)) return DEFAULT_MAX_PATH_DEPTH;
  return Math.max(
    1,
    Math.min(DEFAULT_MAX_PATH_DEPTH, Math.trunc(value as number)),
  );
}

function displayUrl(raw: string, base: URL): string {
  try {
    const parsed = new URL(raw, base);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return raw.trim() || "invalid-url";
  }
}

function decodedPathSegments(url: URL): string[] {
  return url.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment).toLowerCase();
      } catch {
        return segment.toLowerCase();
      }
    });
}

function isTrackingParam(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.startsWith("utm_") || TRACKING_PARAM_NAMES.has(lower);
}

function sortSearchParams(url: URL): void {
  const entries = [...url.searchParams.entries()].sort(([ak, av], [bk, bv]) => {
    const key = ak.localeCompare(bk, "en", { sensitivity: "variant" });
    return key || av.localeCompare(bv, "en", { sensitivity: "variant" });
  });
  url.search = "";
  for (const [key, value] of entries) url.searchParams.append(key, value);
}

export function normalizeScannerV2Url(
  raw: string,
  origin: URL,
  options: ScannerV2UrlPolicyOptions = {},
): ScannerV2UrlPolicyResult {
  let parsed: URL;
  try {
    parsed = new URL(raw, origin);
  } catch {
    return {
      ok: false,
      displayUrl: raw.trim() || "invalid-url",
      reason: "invalid_url",
      incomplete: false,
    };
  }

  parsed.hash = "";
  if (parsed.protocol !== "https:") {
    return {
      ok: false,
      displayUrl: parsed.toString(),
      reason: "insecure_scheme",
      incomplete: false,
    };
  }
  if (parsed.origin !== origin.origin) {
    return {
      ok: false,
      displayUrl: parsed.toString(),
      reason: "cross_origin",
      incomplete: false,
    };
  }

  const allowed = allowPublicHttpsUrl(parsed.toString());
  if (!allowed.ok) {
    return {
      ok: false,
      displayUrl: parsed.toString(),
      reason: "non_public_url",
      incomplete: false,
    };
  }
  parsed = new URL(allowed.url.toString());
  parsed.hash = "";

  const segments = decodedPathSegments(parsed);
  const applyContentPolicy = options.applyContentPolicy ?? true;
  const maxPathDepth = boundedPathDepth(options.maxPathDepth);
  if (applyContentPolicy && segments.length > maxPathDepth) {
    return {
      ok: false,
      displayUrl: parsed.toString(),
      reason: "path_depth_limit",
      incomplete: true,
    };
  }

  if (applyContentPolicy) {
    if (segments.some((segment) => BLOCKED_PATH_SEGMENTS.has(segment))) {
      return {
        ok: false,
        displayUrl: parsed.toString(),
        reason: "blocked_path",
        incomplete: false,
      };
    }
    if (segments.some((segment) => SEARCH_PATH_SEGMENTS.has(segment))) {
      return {
        ok: false,
        displayUrl: parsed.toString(),
        reason: "search_endpoint",
        incomplete: false,
      };
    }

    for (const [name] of parsed.searchParams) {
      if (SESSION_OR_TOKEN_PARAM.test(name)) {
        return {
          ok: false,
          displayUrl: parsed.toString(),
          reason: "session_or_token_parameter",
          incomplete: false,
        };
      }
    }
  }

  const beforeTrackingRemoval = new URL(parsed.toString());
  sortSearchParams(beforeTrackingRemoval);

  const strippedTrackingParams: string[] = [];
  for (const name of [...parsed.searchParams.keys()]) {
    if (!isTrackingParam(name)) continue;
    strippedTrackingParams.push(name);
    parsed.searchParams.delete(name);
  }
  sortSearchParams(parsed);

  const aliasUrl = beforeTrackingRemoval.toString();
  const normalized = parsed.toString();

  return {
    ok: true,
    url: normalized,
    ...(aliasUrl !== normalized ? { aliasUrl } : {}),
    strippedTrackingParams: [...new Set(strippedTrackingParams)].sort(),
  };
}

function attributeValue(tag: string, name: string): string | undefined {
  const quoted = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i",
  ).exec(tag);
  if (quoted) return quoted[1] ?? quoted[2] ?? undefined;
  const bare = new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i").exec(tag);
  return bare?.[1];
}

export function extractScannerV2CanonicalLink(input: {
  html: string;
  pageUrl: string;
  origin: string;
  maxPathDepth?: number;
}): ScannerV2UrlPolicyResult | null {
  let page: URL;
  let origin: URL;
  try {
    page = new URL(input.pageUrl);
    origin = new URL(input.origin);
  } catch {
    return null;
  }

  for (const match of input.html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = attributeValue(tag, "rel");
    if (!rel?.split(/\s+/).some((value) => value.toLowerCase() === "canonical")) {
      continue;
    }
    const href = attributeValue(tag, "href");
    if (!href) continue;
    return normalizeScannerV2Url(href, origin, {
      maxPathDepth: input.maxPathDepth,
      applyContentPolicy: true,
    });
  }
  return null;
}

function calendarFamily(url: URL): string | null {
  const queryKeys = [...url.searchParams.keys()].map((key) => key.toLowerCase());
  if (queryKeys.some((key) => CALENDAR_QUERY_PARAMS.has(key))) {
    const copy = new URL(url.toString());
    for (const key of [...copy.searchParams.keys()]) {
      if (CALENDAR_QUERY_PARAMS.has(key.toLowerCase())) {
        copy.searchParams.set(key, ":date");
      }
    }
    sortSearchParams(copy);
    return copy.toString();
  }

  const segments = url.pathname.split("/").filter(Boolean);
  let foundYear = false;
  const normalized = segments.map((segment) => {
    if (/^(?:19|20|21)\d{2}$/.test(segment)) {
      foundYear = true;
      return ":year";
    }
    if (foundYear && /^(?:0?[1-9]|1[0-2])$/.test(segment)) return ":month";
    if (foundYear && /^(?:0?[1-9]|[12]\d|3[01])$/.test(segment)) return ":day";
    return segment;
  });
  if (!foundYear) return null;
  const copy = new URL(url.toString());
  copy.pathname = "/" + normalized.join("/");
  return copy.toString();
}

function queryFamily(url: URL): string | null {
  if ([...url.searchParams.keys()].length === 0) return null;
  const keys = [...url.searchParams.keys()]
    .map((key) => key.toLowerCase())
    .sort();
  return `${url.origin}${url.pathname}?${keys.join("&")}`;
}

export type FrontierTrapDecision =
  | { ok: true }
  | {
      ok: false;
      reason: "query_variant_limit" | "calendar_variant_limit";
      incomplete: true;
    };

export class ScannerV2FrontierTrapGuard {
  private readonly queryFamilies = new Map<string, Set<string>>();
  private readonly calendarFamilies = new Map<string, Set<string>>();
  private readonly maxQueryVariants: number;
  private readonly maxCalendarVariants: number;

  constructor(options: {
    maxQueryVariantsPerSignature?: number;
    maxCalendarVariantsPerFamily?: number;
  } = {}) {
    const requestedQuery = options.maxQueryVariantsPerSignature;
    const requestedCalendar = options.maxCalendarVariantsPerFamily;
    this.maxQueryVariants = Number.isFinite(requestedQuery)
      ? Math.max(
          1,
          Math.min(
            DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE,
            Math.trunc(requestedQuery as number),
          ),
        )
      : DEFAULT_MAX_QUERY_VARIANTS_PER_SIGNATURE;
    this.maxCalendarVariants = Number.isFinite(requestedCalendar)
      ? Math.max(
          1,
          Math.min(
            DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY,
            Math.trunc(requestedCalendar as number),
          ),
        )
      : DEFAULT_MAX_CALENDAR_VARIANTS_PER_FAMILY;
  }

  evaluate(rawUrl: string): FrontierTrapDecision {
    const url = new URL(rawUrl);

    const calendar = calendarFamily(url);
    if (calendar) {
      let variants = this.calendarFamilies.get(calendar);
      if (!variants) {
        variants = new Set();
        this.calendarFamilies.set(calendar, variants);
      }
      if (!variants.has(rawUrl) && variants.size >= this.maxCalendarVariants) {
        return {
          ok: false,
          reason: "calendar_variant_limit",
          incomplete: true,
        };
      }
      variants.add(rawUrl);
    }

    const query = queryFamily(url);
    if (query) {
      let variants = this.queryFamilies.get(query);
      if (!variants) {
        variants = new Set();
        this.queryFamilies.set(query, variants);
      }
      if (!variants.has(rawUrl) && variants.size >= this.maxQueryVariants) {
        return {
          ok: false,
          reason: "query_variant_limit",
          incomplete: true,
        };
      }
      variants.add(rawUrl);
    }

    return { ok: true };
  }
}
