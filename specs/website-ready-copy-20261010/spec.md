# Spec: ship READY marketing copy (10 Oct 2026)

## Goal Lock
OBJECTIVE: put the owner-approved READY copy live on the marketing site.
ACCEPTANCE: the new hero and `/how-we-keep-control/` are served on staging; lint, tests and build pass; no HOLD item ships.
EVIDENCE: CI checks, local `npm test` / `npm run build`, a live fetch after deploy.

## Scope (READY only, from the ship list)
- R1: homepage hero and rulebook teaser.
- R2: new `/how-we-keep-control/` route, added to the sitemap.
- R3–R8: sector pages for landlords, letting agents, property managers, maintenance companies, housing associations and councils.
- R9: industries hub.
- R10: SEO titles and descriptions for existing routes.
- R11: nav relabels.
- Design review: a single primary CTA "Request an early demo", plain nav (no "Dashboard (soon)", no xxxOS labels), no "by Chapelgate" in the hero, titles or logo, and a slim hero first screen.
- Monitor findings: LeadCaptureForm `reset()` after `await` (null currentTarget); a site-wide og:image / twitter:image with `summary_large_image`.

## Out of scope (HOLD)
Guides, FM and holiday-lets drafts, pilot partners, lead magnet, the footer legal-entity line, the red category list, gas/CO product wording, and any "all features working" line.

## Rules
- VERIFIED register claims only.
- No "helps you comply", no 24/7 or live wording, no competitor names, no invented stats, no founder story.
- Keep the CAP qualifiers.
- Awaab's Law Phase 2 is 30 Nov 2026, subject to Parliamentary approval (checked on GOV.UK, 10 Oct 2026).
