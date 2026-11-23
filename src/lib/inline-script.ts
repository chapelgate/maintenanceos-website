/**
 * Serialise a value for embedding inside an inline <script> element.
 * JSON.stringify gives a valid JS literal (quotes, backslashes, control chars);
 * we additionally escape "<" (blocks "</script>" breakout) and U+2028/U+2029
 * (line terminators some JS parsers reject inside string literals).
 * Pure: no DOM dependency, so both server pages and JSON-LD can share it.
 */
export function serializeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Inline redirect script body for a same-site path. */
export function redirectScript(url: string): string {
  return `window.location.href = ${serializeForInlineScript(url)};`;
}
