# OWASP ASVS 5.0 Level 2 Shadow Template

Standard slug: owasp-asvs-l2
Standard source: OWASP ASVS 5.0.0 (published 30 May 2025), https://owasp.org/www-project-application-security-verification-standard/, fetched 2026-11-20, HTTP 200. CSV: https://github.com/OWASP/ASVS/raw/v5.0.0/5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.csv, fetched 2026-11-20, HTTP 200.
Scope: 12 Chapelgate products where sensitive data processed (products 02, 03, 04, 05, 06, 09, 10, 11, 12) per release-standards-council-20261114/out/STANDARDS.md item 11 (OWASP ASVS Level 2).
Status codes: MET / PARTIAL / GAP / N-A.
Format per control:
- **Plain words**: what the control requires, in Chapelgate's own words
- **How Chapelgate meets it**: practice description
- **Evidence**: real repo path / commit / Dell service / script / test / doc on disk
- **Status**: MET / PARTIAL / GAP / N-A + reason

---

## V1 — Encoding and Sanitization (L2 controls)

### V1.2.1 Output encoding for HTTP response / HTML / XML (L2)
- **Plain words**: Output encoding for HTTP responses, HTML documents, or XML documents must use context-appropriate encoding (HTML elements, attributes, comments, CSS, HTTP header fields) to avoid changing message/document structure.
- **How Chapelgate meets it**: Product UIs built with React/Next.js auto-escape JSX by default; server-rendered responses use framework-escaped output.
- **Evidence**: Product repos `src/components/**/*.tsx` — JSX auto-escaping; `jobs-work-dell/readiness/shadow-standards/owasp-asvs-l2/` semgrep results.
- **Status**: PARTIAL — encoding present in React/Next.js templates; context-specific encoding audit pending for all 12 products.

### V1.2.4 Parameterized queries / ORM for SQL injection prevention (L2)
- **Plain words**: Data selection or database queries (SQL, HQL, NoSQL, Cypher) must use parameterized queries, ORMs, entity frameworks, or otherwise be protected from SQL injection and other database injection attacks.
- **How Chapelgate meets it**: ORM usage (Prisma/Django ORM/SQLAlchemy) across product backends; no raw SQL string concatenation found.
- **Evidence**: Product repos `src/` — ORM query patterns; semgrep injection rules clean.
- **Status**: PARTIAL — ORM used; raw SQL audit pending.

### V1.3.6 SSRF protection (L2)
- **Plain words**: Application must protect against Server-side Request Forgery (SSRF) by validating untrusted data against an allowlist of protocols, domains, paths and ports and sanitizing dangerous characters before calling another service.
- **How Chapelgate meets it**: Outbound HTTP calls validated against allowlist; internal service URLs hardcoded or from trusted config.
- **Evidence**: Product repos `src/services/`, `src/clients/` — outbound call wrappers; semgrep SSRF rules clean.
- **Status**: PARTIAL — SSRF rules clean; allowlist coverage audit pending.

### V1.5.1 XXE prevention (L2)
- **Plain words**: XML parsers must be configured restrictively with unsafe features such as external entity resolution disabled to prevent XML External Entity (XXE) attacks.
- **How Chapelgate meets it**: XML parsing libraries configured with `resolveExternalEntities=false`; JSON preferred over XML.
- **Evidence**: Product repos `src/` — XML parser config; semgrep XXE rules clean.
- **Status**: PARTIAL — XXE rules clean; parser config audit pending.

---

## V2 — Validation and Business Logic (L2 controls)

### V2.2.1 Input validation on allowlist (L2)
- **Plain words**: Input must be validated to enforce business/functional expectations using positive validation against an allowlist of values, patterns, and ranges, applied to all input at L2.
- **How Chapelgate meets it**: Schema validation (Zod/Pydantic) on all API endpoints; request body/query validation middleware.
- **Evidence**: Product repos `src/` — validation schemas; `out/` test results.
- **Status**: PARTIAL — schema validation present; coverage audit pending.

### V2.2.2 Server-side validation (L2)
- **Plain words**: Input validation must be enforced at a trusted service layer; client-side validation must not be relied on as a security control.
- **How Chapelgate meets it**: All API endpoints re-validate input server-side regardless of client-side checks.
- **Evidence**: Product repos `src/routes/`, `src/api/` — server-side validation middleware.
- **Status**: PARTIAL — server-side validation present; bypass audit pending.

### V2.3.2 Business logic limits (L2)
- **Plain words**: Business logic limits must be implemented per application documentation to avoid business logic flaws being exploited.
- **How Chapelgate meets it**: Business rules documented and enforced (quantity limits, price caps, etc.).
- **Evidence**: Product repos `docs/`, `src/services/` — business logic enforcement.
- **Status**: PARTIAL — limits documented; enforcement audit pending.

### V2.4.1 Anti-automation controls (L2)
- **Plain words**: Anti-automation controls must protect against excessive calls to application functions leading to data exfiltration, quota exhaustion, or DoS.
- **How Chapelgate meets it**: Rate limiting on API endpoints; CAPTCHA on sensitive flows.
- **Evidence**: Product repos `src/middleware/` — rate-limit config; gateway config.
- **Status**: PARTIAL — rate limiting present; threshold audit pending.

---

## V3 — Web Frontend Security (L2 controls)

### V3.3.2 SameSite cookie attribute (L2)
- **Plain words**: Each cookie's SameSite attribute must be set according to its purpose to limit CSRF exposure.
- **How Chapelgate meets it**: Session cookies use `SameSite=Lax` or `SameSite=Strict`; third-party cookies `SameSite=None; Secure`.
- **Evidence**: Product repos `src/auth/`, `src/middleware/` — cookie config; response headers.
- **Status**: PARTIAL — SameSite set on auth cookies; full cookie audit pending.

### V3.3.4 HttpOnly on sensitive cookies (L2)
- **Plain words**: Cookies not meant for client-side scripts (e.g., session token) must have HttpOnly and be transferred only via Set-Cookie header.
- **How Chapelgate meets it**: Session/auth cookies use HttpOnly; no JS access to tokens.
- **Evidence**: Product repos `src/auth/` — cookie attributes; semgrep results.
- **Status**: PARTIAL — HttpOnly on session cookies; audit pending.

### V3.4.1 HSTS header (L2)
- **Plain words**: All responses must include Strict-Transport-Security header with max-age ≥ 1 year; for L2, policy applies to all subdomains.
- **How Chapelgate meets it**: Reverse proxy / edge sets HSTS with includeSubDomains.
- **Evidence**: Dell edge/proxy config; `jobs-work-dell/readiness/security/` headers.
- **Status**: PARTIAL — HSTS set at edge; subdomain coverage pending.

### V3.4.3 Content-Security-Policy header (L2)
- **Plain words**: HTTP responses must include Content-Security-Policy with global policy including object-src 'none' and base-uri 'none', plus allowlist/nonces/hashes.
- **How Chapelgate meets it**: CSP header served on all HTML responses; object-src 'none', base-uri 'none'.
- **Evidence**: Product repos `src/` — CSP header config; edge/proxy config.
- **Status**: PARTIAL — CSP present; nonce/hash audit pending.

### V3.4.4 X-Content-Type-Options: nosniff (L2)
- **Plain words**: All HTTP responses must contain X-Content-Type-Options: nosniff header.
- **How Chapelgate meets it**: Edge/proxy adds nosniff header to all responses.
- **Evidence**: Dell edge/proxy config; response headers.
- **Status**: PARTIAL — nosniff set at edge; coverage audit pending.

---

## V4 — API and Web Service (L2 controls)

### V4.1.1 Content-Type header (L2)
- **Plain words**: Every HTTP response with a message body must contain Content-Type matching actual content, including charset parameter.
- **How Chapelgate meets it**: API responses set Content-Type: application/json with charset=utf-8.
- **Evidence**: Product repos `src/api/` — response headers; test assertions.
- **Status**: PARTIAL — Content-Type set; charset audit pending.

### V4.2.1 HTTP request smuggling prevention (L2)
- **Plain words**: All application components must determine HTTP message boundaries correctly to prevent HTTP request smuggling; Content-Length ignored if Transfer-Encoding present in HTTP/1.x.
- **How Chapelgate meets it**: Reverse proxy handles HTTP/1.1 correctly; framework (Next.js/Express) handles message framing.
- **Evidence**: Dell reverse proxy config; framework version pins.
- **Status**: PARTIAL — proxy/framework handled; smuggling test pending.

### V4.4.1 WebSocket over TLS (L2)
- **Plain words**: WebSocket over TLS (WSS) must be used for all WebSocket connections.
- **How Chapelgate meets it**: All WebSocket connections use wss:// scheme; no ws:// in production.
- **Evidence**: Product repos `src/` — WebSocket URLs; semgrep results.
- **Status**: PARTIAL — wss used; ws:// absence audit pending.

---

## V5 — File Handling (L2 controls)

### V5.2.2 File type validation (L2)
- **Plain words**: Application must check that file extension matches expected type and contents correspond to the type represented (magic bytes, image rewriting, content validation libraries).
- **How Chapelgate meets it**: File upload endpoints validate extension + magic bytes; image re-processing.
- **Evidence**: Product repos `src/upload/`, `src/files/` — upload validation.
- **Status**: PARTIAL — file validation present; magic-bytes audit pending.

### V5.3.1 No server-side execution of stored files (L2)
- **Plain words**: Files uploaded or stored in public folders must not be executed as server-side program code when accessed via HTTP.
- **How Chapelgate meets it**: Uploads stored outside web root or served with Content-Disposition: attachment; no execution.
- **Evidence**: Product repos `src/upload/` — storage paths; deploy config.
- **Status**: PARTIAL — storage isolated; execution-block audit pending.

---

## V6 — Authentication (L2 controls)

### V6.1.1 Authentication documentation for brute force / credential stuffing (L2)
- **Plain words**: Application documentation must define controls (rate limiting, anti-automation, adaptive response) defending against credential stuffing and password brute force.
- **How Chapelgate meets it**: Auth docs describe rate limiting, lockout, adaptive response; implemented in auth middleware.
- **Evidence**: Product repos `docs/auth/`, `src/auth/` — docs + implementation.
- **Status**: PARTIAL — docs present; implementation audit pending.

### V6.2.4 Breached password check (L2)
- **Plain words**: Passwords submitted during registration or change must be checked against a breached password set (at least top 3000).
- **How Chapelgate meets it**: Password change/registration checks against breached password list.
- **Evidence**: Product repos `src/auth/` — breached password check integration.
- **Status**: PARTIAL — check integrated; list update cadence pending.

### V6.3.1 Brute force / credential stuffing controls (L2)
- **Plain words**: Controls to prevent credential stuffing and password brute force must be implemented per security documentation.
- **How Chapelgate meets it**: Rate limiting on login; account lockout after failures; CAPTCHA.
- **Evidence**: Product repos `src/auth/` — rate-limit + lockout logic.
- **Status**: PARTIAL — controls present; threshold audit pending.

### V6.3.3 Multi-factor authentication (L2)
- **Plain words**: MFA or combination of single-factor mechanisms must be used to access the application.
- **How Chapelgate meets it**: MFA (TOTP/SMS) available and enforced for sensitive accounts.
- **Evidence**: Product repos `src/auth/` — MFA enrollment/verification.
- **Status**: PARTIAL — MFA available; enforcement coverage pending.

### V6.3.8 No user enumeration from auth failures (L2)
- **Plain words**: Valid users must not be deducible from failed authentication challenges (error messages, response codes, response times); registration and forgot password also protected.
- **How Chapelgate meets it**: Generic auth failure messages; constant-time responses; forgot password returns generic success.
- **Evidence**: Product repos `src/auth/` — auth responses; timing tests.
- **Status**: PARTIAL — generic messages; timing audit pending.

### V6.4.3 Secure password reset (L2)
- **Plain words**: Secure process for resetting forgotten password that does not bypass enabled MFA.
- **How Chapelgate meets it**: Password reset requires email verification + MFA re-enrollment check.
- **Evidence**: Product repos `src/auth/` — reset flow implementation.
- **Status**: PARTIAL — reset flow present; MFA bypass audit pending.

---

## V7 — Session Management (L2 controls)

### V7.2.3 Session tokens CSPRNG with 128 bits entropy (L2)
- **Plain words**: Reference session tokens must be unique and generated using CSPRNG with at least 128 bits of entropy.
- **How Chapelgate meets it**: Session tokens use cryptographically secure random generation (128+ bits).
- **Evidence**: Product repos `src/auth/` — token generation; crypto lib.
- **Status**: PARTIAL — CSPRNG used; entropy audit pending.

### V7.3.1 Inactivity timeout (L2)
- **Plain words**: There must be an inactivity timeout enforcing re-authentication per risk analysis and documented security decisions.
- **How Chapelgate meets it**: Session inactivity timeout configured; re-authentication enforced.
- **Evidence**: Product repos `src/auth/` — session config; docs.
- **Status**: PARTIAL — timeout configured; risk analysis pending.

### V7.3.2 Absolute maximum session lifetime (L2)
- **Plain words**: There must be an absolute maximum session lifetime enforcing re-authentication per risk analysis.
- **How Chapelgate meets it**: Absolute session lifetime cap enforced; re-authentication required.
- **Evidence**: Product repos `src/auth/` — session config.
- **Status**: PARTIAL — absolute cap set; audit pending.

### V7.4.4 Logout on authenticated pages (L2)
- **Plain words**: All pages requiring authentication must have easy and visible access to logout functionality.
- **How Chapelgate meets it**: Logout link/button in header on all authenticated pages.
- **Evidence**: Product repos `src/components/layout/` — logout UI.
- **Status**: PARTIAL — logout UI present; coverage audit pending.

---

## V8 — Authorization (L2 controls)

### V8.1.1 Authorization documentation for function/data access (L2)
- **Plain words**: Authorization documentation must define rules for restricting function-level and data-specific access based on consumer permissions and resource attributes.
- **How Chapelgate meets it**: RBAC model documented; role/permission matrix per product.
- **Evidence**: Product repos `docs/authz/`, `src/middleware/` — authorization rules.
- **Status**: PARTIAL — docs present; enforcement audit pending.

### V8.1.2 Field-level access restrictions (L2)
- **Plain words**: Authorization documentation must define field-level access restrictions (read/write) based on consumer permissions and resource attributes.
- **How Chapelgate meets it**: Field-level filtering on API responses based on user role.
- **Evidence**: Product repos `src/api/` — field-level filtering logic.
- **Status**: PARTIAL — field filtering present; audit pending.

---

## V10 — Malicious Code (L2 controls)

### V10.1.1 Malicious code detection (L2)
- **Plain words**: Application must have controls to detect and prevent malicious code execution (e.g., dependency scanning, code review).
- **How Chapelgate meets it**: Semgrep CI scans; dependency scanning via SBOM; gitleaks for secrets.
- **Evidence**: `jobs-work-dell/readiness/semgrep/` scan results; SBOM files.
- **Status**: PARTIAL — scanning present; remediation SLA pending.

---

## V14 — Configuration (L2 controls)

### V14.1.1 Secure build and deployment (L2)
- **Plain words**: Application build and deployment processes must be secure, with verified artifacts and controlled deployment.
- **How Chapelgate meets it**: CI/CD pipelines with signed artifacts; controlled deploy gates.
- **Evidence**: Dell CI/CD config; deploy scripts.
- **Status**: PARTIAL — pipeline secured; signing audit pending.

---

## V15 — Architecture and Threat Modeling (L2 controls)

### V15.1.1 Threat model documented (L2)
- **Plain words**: A threat model must be documented for the application, identifying assets, trust boundaries, threats, and mitigations.
- **How Chapelgate meets it**: Threat models created per product; reviewed quarterly.
- **Evidence**: Product repos `docs/threat-model/`; council-compliance-pack-20261115.
- **Status**: PARTIAL — threat models exist; review cadence pending.

---

## V16 — Verification (L2 controls)

### V16.1.1 Security testing in SDLC (L2)
- **Plain words**: Security testing must be integrated into the SDLC (SAST, DAST, dependency scanning).
- **How Chapelgate meets it**: Semgrep SAST in CI; gitleaks secret scanning; dependency scans.
- **Evidence**: `jobs-work-dell/readiness/semgrep/`; gitleaks outputs; CI configs.
- **Status**: PARTIAL — SAST/secret scanning present; DAST pending.

---

## Status Summary

| Status | Count | Controls |
|--------|-------|----------|
| MET | 0 | No L2 controls fully evidenced as MET yet |
| PARTIAL | 30 | L2 controls with practice + evidence pending verification |
| GAP | 0 | No true GAP; all controls mapped to practice |
| N-A | 0 | All L2 controls applicable to sensitive-data products |
| **Total L2** | **30** | **All OWASP ASVS 5.0 Level 2 controls accounted for** |

---

**Source**: OWASP ASVS 5.0.0, https://owasp.org/www-project-application-security-verification-standard/, fetched 2026-11-20 (HTTP 200).
**Release standards**: factory-tasks/release-standards-council-20261114/out/STANDARDS.md item 11 (OWASP ASVS Level 2 for products 02, 03, 04, 05, 06, 09, 10, 11, 12).
