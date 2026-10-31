# WEBSITE_LAUNCH_CHECKLIST.md

**Owner:** MOS Website Manager + Final Verifier
**Updated:** 2026-09-30
**Mode:** PRE-LAUNCH
**Rule:** Do **not** set `NEXT_PUBLIC_PUBLIC_LAUNCH=true` until every launch-only gate below is cleared.

This checklist records launch readiness. It is not a second engineering backlog;
open engineering work remains in `WEBSITE_BACKLOG.md`.

## Claims truth

- [x] `PRODUCT_CLAIMS_REGISTER.md` refreshed on 2026-09-30 against exact
  product checkpoint `498ad82dd87631814195d447d89458480b117951`.
  Current targeted claims/safety verification is 196/196 PASS. The current live
  voice greet-then-stall defect and undeployed verified hotfix are explicitly
  reflected; no voice/GA claim was promoted.
- [x] Current website copy is regression-gated against VERIFIED / UNDER TEST /
  PLANNED boundaries.
- [x] No commercially-live / GA / certification / fake-social-proof claims.
- [x] Current site still presents live telephony as unavailable / under testing,
  not as a public phone service.

## Content & IA

- [x] Minimum mission-brief page set is live.
- [x] Industry pages are claims-gated and have distinct buyer intent.
- [x] `/status` is an architecture placeholder only; no fake uptime metrics.
- [x] Brand system is implemented and applied.
- [x] Canonical IA/search-intent map is documented.

## Legal

- [x] `/privacy`, `/cookies`, and `/terms` are visibly **DRAFT FOR LEGAL REVIEW**.
- [x] Current cookie/measurement behaviour matches the draft: no analytics or
  marketing cookies/tags; privacy-minimised first-party cookieless events only.
- [ ] Counsel final review: controller identity, lawful bases, retention,
  processor/transfer wording, rights/contact details, final terms.

## Forms & conversion

- [x] Create/demo/contact/launch-list paths validate and queue/store leads.
- [x] Lead storage is durable before operator notification.
- [x] No visitor-facing copy falsely claims a confirmation email was sent.
- [x] Primary CTA remains **Create from website**; secondary early-access CTAs
  remain non-telephony.

## Accessibility

- [x] WCAG 2.2 AA-oriented automated/source baseline recorded.
- [x] Live Lighthouse accessibility baseline recorded; audited routes scored 100.
- [ ] Full manual keyboard + assistive-technology pass recorded before public launch.
- [ ] Any issues from that manual pass fixed and re-verified.

## SEO

- [x] Titles, descriptions, canonicals, sitemap, robots, OG and structured data.
- [x] Claims-safe `llms.txt` / `llms-full.txt`.
- [x] Live SEO monitor passes without misleading promo metadata.

## Security

- [x] `WEBSITE_SECURITY_REVIEW.md` filled.
- [x] HTML CSP / referrer policy and form-abuse controls reviewed.
- [x] Dependency audit (2026-10-31): Next 16.4.3 + zod 4.6.7 — critical/high cleared; 16 residual moderate eslint/minimatch dev-toolchain findings tracked, not claimed zero.
- [x] Common committed-secret pattern scan clean at 2026-09-27 final engineering RC.
- [ ] Resolve or explicitly accept the documented HTTP response-header /
  clickjacking gap on the current static host before public launch.
- [x] Bounded automated staging red-team report reviewed on 2026-09-27 with no failures or identified critical/high public-surface blockers; not represented as an independent penetration test.

## Performance

- [x] Lighthouse lab performance baseline recorded.
- [x] Build JS/CSS budget is enforced by release preflight.
- [x] Font/image policy documented and regression-gated.
- [ ] Do not convert lab evidence into a CrUX/field-CWV claim without field data.

## Analytics / privacy

- [x] Current events contain no persistent visitor identifier.
- [x] No third-party analytics or marketing tags are loaded.
- [x] Event payload is bounded; no free-form error text/stack/PII field.

## Staging & operations

- [x] Canonical repo and branch fixed: `chapelgate/maintenanceos-website` / `main`.
- [x] Existing DigitalOcean static staging URL verified.
- [x] Exact release SHA marker + live health verification are release gates.
- [x] `.env.example` contains placeholders/public config only.
- [x] `CURSOR_HANDOFF.md` is current and points to the single backlog/release loop.
- [x] Companion deployment policy says **do not use Render**; any future hosted
  companion must use a separately authorised DigitalOcean process.
- [x] Automated repository/release test baseline is green.
- [x] Automated cross-engine matrix complete: Edge + Firefox + WebKit across six buyer-critical routes at mobile/tablet/desktop widths.
- [ ] Physical Safari/iOS plus manual mobile/keyboard/assistive-technology pass recorded before public launch.
- [x] Bounded automated staging red-team pass complete; independent penetration testing remains a separate product/launch assurance decision.

## PUBLIC_LAUNCH flip gate

- [ ] Owner approval to set `NEXT_PUBLIC_PUBLIC_LAUNCH=true`.
- [x] Product evidence refresh complete; telephony/commercial gates revisited on 2026-09-30 at product SHA `498ad82d…` and remain **NO-GO / PRE-LAUNCH**.
- [ ] Legal drafts cleared by counsel.
- [ ] Security response-header risk resolved/accepted.
- [ ] Manual accessibility + cross-browser QA complete.
- [x] Bounded staging red-team report reviewed; no unfixed critical/high public-website blockers identified by that scope.
- [x] Final engineering release-candidate verifier/DoD sign-off passed on 2026-09-27; public-launch human gates remain open.
- [ ] `MAINTENANCEOS_WEBSITE_FINAL_REPORT.md` generated from that final launch RC.

Until these are all clear, the site remains truthful **PRE-LAUNCH**.
