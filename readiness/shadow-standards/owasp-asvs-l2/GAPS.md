# Gaps — OWASP ASVS 5.0 Level 2

Each gap below is a free fix (no spend, no sign-up) with an owner job. Source: release-standards-council-20261114 item 11 (OWASP ASVS Level 2 for sensitive-data products 02, 03, 04, 05, 06, 09, 10, 11, 12).

| # | Gap | Free fix | Owner job | Product | Status |
|---|-----|----------|-----------|---------|--------|
| G01 | No automated semgrep SAST evidence on disk for sensitive-data products | Add semgrep CI workflow to products 02, 03, 04, 05, 06, 09, 10, 11, 12; run on PR merge | DevOps | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G02 | No gitleaks secret-scanning evidence on disk for all 12 products | Add gitleaks CI workflow; scan repos for secrets | DevOps | All 12 | OPEN |
| G03 | Output encoding (V1.2.1) context-specific audit pending | Add encoding audit to CI; verify context-appropriate escaping per output sink | Frontend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G04 | Parameterized queries (V1.2.4) raw SQL audit pending | Audit all DB queries for raw string concatenation; enforce ORM/parameterized | Backend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G05 | SSRF protection (V1.3.6) allowlist coverage audit pending | Audit outbound HTTP calls against allowlist; document allowed domains/ports | Backend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G06 | XXE prevention (V1.5.1) parser config audit pending | Verify XML parser config disables external entities; prefer JSON | Backend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G07 | Input validation allowlist (V2.2.1) coverage audit pending | Audit all API endpoints for schema validation; add missing schemas | Backend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G08 | Server-side validation (V2.2.2) bypass audit pending | Verify no client-side-only validation; all input re-validated server-side | Backend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G09 | Business logic limits (V2.3.2) enforcement audit pending | Audit quantity/price limits enforced per documented business rules | Product engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G10 | Anti-automation (V2.4.1) threshold audit pending | Verify rate limits and CAPTCHA on sensitive flows; document thresholds | DevOps | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G11 | SameSite cookie (V3.3.2) full cookie audit pending | Audit all cookies for SameSite attribute; set Lax/Strict/None+Secure | Frontend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G12 | HttpOnly cookie (V3.3.4) audit pending | Verify all session/auth cookies have HttpOnly | Frontend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G13 | HSTS (V3.4.1) subdomain coverage pending | Verify HSTS includeSubDomains on all product domains | DevOps | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G14 | CSP (V3.4.3) nonce/hash audit pending | Verify CSP uses nonces or hashes; object-src 'none', base-uri 'none' | Frontend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G15 | X-Content-Type-Options (V3.4.4) coverage audit pending | Verify nosniff header on all responses | DevOps | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G16 | Content-Type charset (V4.1.1) audit pending | Verify charset=utf-8 on all JSON responses | Backend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G17 | HTTP request smuggling (V4.2.1) test pending | Test proxy/message framing for smuggling resistance | DevOps | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G18 | WebSocket WSS (V4.4.1) ws:// absence audit pending | Verify no ws:// URLs in production; all use wss:// | Backend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G19 | File type validation (V5.2.2) magic-bytes audit pending | Verify file upload validation checks extension + magic bytes | Product engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G20 | File storage isolation (V5.3.1) execution-block audit pending | Verify uploads stored outside web root or served as attachment | DevOps | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G21 | Auth docs for brute force (V6.1.1) implementation audit pending | Verify rate limiting/lockout/adaptive response implemented per docs | Auth engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G22 | Breached password check (V6.2.4) list update cadence pending | Document breached list source and update frequency | Auth engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G23 | MFA enforcement (V6.3.3) coverage pending | Verify MFA enforced for all sensitive accounts | Auth engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G24 | No user enumeration (V6.3.8) timing audit pending | Test auth response timing for enumeration resistance | QA / Security | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G25 | Password reset MFA bypass (V6.4.3) audit pending | Verify reset flow does not bypass MFA | Auth engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G26 | Session token entropy (V7.2.3) audit pending | Verify 128+ bit CSPRNG tokens | Auth engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G27 | Session inactivity timeout (V7.3.1) risk analysis pending | Document risk analysis justifying timeout values | Auth engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G28 | Absolute session lifetime (V7.3.2) audit pending | Verify absolute cap enforced; re-authentication required | Auth engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G29 | Logout UI coverage (V7.4.4) audit pending | Verify logout accessible on all authenticated pages | Frontend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G30 | Authorization enforcement (V8.1.1, V8.1.2) audit pending | Verify RBAC + field-level filtering enforced on all endpoints | Backend engineering | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G31 | Malicious code remediation SLA (V10.1.1) pending | Document SLA for fixing semgrep/dependency findings | DevOps | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G32 | Secure build/signing (V14.1.1) audit pending | Verify artifact signing and controlled deploy gates | DevOps | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G33 | Threat model review cadence (V15.1.1) pending | Schedule quarterly threat model reviews per product | Security | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G34 | DAST scanning (V16.1.1) pending | Add ZAP baseline DAST scan in CI for all sensitive-data products | DevOps | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |

## Notes
- No evidence = GAP. All statuses above are GAP until real scanner/repo evidence is on disk.
- Free fixes only: no paid pen test, no certification, no sign-ups.
- Bigger gaps (semgrep/gitleaks/DAST CI on all 12 repos) get follow-up tasks in out/FOLLOWUPS.md.
- Partially-met controls in SHADOW-TEMPLATE.md become GAPs when evidence is not on disk; moving to PARTIAL requires semgrep/gitleaks/ZAP runs or manual test evidence.
- Per BRIEF.md hard rule: HB-001..010 (insurance, professional indemnity, Cyber Essentials, legal/ICO, accounts, independent human review and similar Andy-only launch work) NEVER stop, gate or end the engineering loop. They are Andy's last-minute responsibility, not engineering completion conditions.
