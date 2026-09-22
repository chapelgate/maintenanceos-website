/**
 * Claims-safe static security baseline for DigitalOcean App Platform export.
 *
 * App Platform static (`out/` from `npm run build`) has no custom response-header
 * field in the app spec (CORS / inbound `secure_header` only). `next.config`
 * `headers()` is incompatible with `output: "export"`. `public/_headers` is a
 * Netlify/Cloudflare Pages file and would be published as a download, not applied.
 *
 * Browsers honor CSP (`<meta http-equiv>`) and Referrer-Policy (`<meta name="referrer">`)
 * from the exported HTML. X-Frame-Options, frame-ancestors, X-Content-Type-Options,
 * and Permissions-Policy require HTTP response headers this host cannot set.
 *
 * Operator note: docs/security/static-security-baseline.md
 */

export const REFERRER_POLICY = "strict-origin-when-cross-origin" as const;

/** Desired HTTP response headers. Not emitted by App Platform static today. */
export const DESIRED_HTTP_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": REFERRER_POLICY,
  "X-Frame-Options": "DENY",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=()",
} as const;

type CspEnv = string | undefined;

function isDevelopment(nodeEnv: CspEnv): boolean {
  return nodeEnv === "development";
}

/**
 * Enforcing CSP for the static funnel.
 * `'unsafe-inline'` is required for next/font style tags, JSON-LD, and the
 * header Escape script. Production omits `'unsafe-eval'`. `https:` connect/form
 * covers hosted companions and NEXT_PUBLIC_FORM_ENDPOINT without pinning hosts.
 * Loopback is for local e2e only. `frame-ancestors` is omitted here — it is
 * ignored in meta CSP and belongs on DESIRED_HTTP_HEADERS / HTTP_CSP.
 */
export function contentSecurityPolicy(nodeEnv: CspEnv = process.env.NODE_ENV): string {
  const scriptSrc = isDevelopment(nodeEnv)
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'";
  const connectSrc = isDevelopment(nodeEnv)
    ? "'self' https: http://127.0.0.1:* http://localhost:* ws: wss:"
    : "'self' https: http://127.0.0.1:* http://localhost:*";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "media-src 'self'",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "form-action 'self' https:",
    "base-uri 'self'",
    "frame-src 'none'",
    "object-src 'none'",
  ].join("; ");
}

/** Production policy used in the static export and operator docs. */
export const CONTENT_SECURITY_POLICY = contentSecurityPolicy("production");

/**
 * HTTP-header CSP if a future host can set response headers.
 * Adds frame-ancestors (ignored in HTML meta).
 */
export const CONTENT_SECURITY_POLICY_HTTP = `${CONTENT_SECURITY_POLICY}; frame-ancestors 'none'`;
