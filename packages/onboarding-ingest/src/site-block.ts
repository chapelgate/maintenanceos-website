/**
 * A site that answers 401/403 and yields no page is a host refusal.
 * That is a completed read with nothing copied, not a scanner outage.
 * Do not rotate addresses or disguise the client to get past it.
 */

export const BLOCKED_BY_SITE = "blocked_by_site" as const;

export type BlockedBySiteOutcome = typeof BLOCKED_BY_SITE;

export function siteBlockedScan(input: {
  fetched: number;
  warnings: readonly string[];
}): boolean {
  if (input.fetched > 0) return false;
  return input.warnings.some(
    (warning) => warning === "http_401" || warning === "http_403",
  );
}

export function warningsWithSiteBlock(warnings: readonly string[]): string[] {
  if (!siteBlockedScan({ fetched: 0, warnings })) return [...warnings];
  return [...new Set([...warnings, BLOCKED_BY_SITE])];
}
