# MAINTENANCEOS_WEBSITE_FINAL_REPORT

Date: 2026-11-02
Status: **ENGINEERING PROGRAMME COMPLETE — NOT A PUBLIC LAUNCH GO**

## Verdict

The MaintenanceOS marketing website engineering programme is commercially *near* ready on product behaviour and honesty locks, but **public commercial launch remains blocked on Andy-only gates** (counsel, DNS/domain, PUBLIC_LAUNCH, physical AT, host response-header decision, scanner/voice production steps).

## What is done (engineering)

- Full brochure IA with create/demo/contact funnel and claims honesty locks
- Automated tests, lint, typecheck, static export build
- Accessibility engineering baseline + WebKit CI gate (no WCAG 2.2 AA claim)
- Security review notes; CSP/referrer meta; residual static-host header gap documented honestly
- Recovery navigation wave through mw-343 merged (#637); further recovery PRs open (#638+)
- Durable evidence: MAINTENANCEOS_WEBSITE_ENGINEERING_RC_REPORT.md, WEBSITE_SECURITY_REVIEW.md, WEBSITE_LAUNCH_CHECKLIST.md, PRODUCT_CLAIMS_REGISTER.md

## What is not done (human / Andy)

See `/root/jobs-work/readiness/ANDY_BLOCKERS.md` (mw section) and repo HUMAN_BLOCKERS.md:
counsel finalisation; PUBLIC_LAUNCH; production DNS; physical Safari/AT; DO response-header accept-or-edge; scanner droplet; website-owned Gacrux voice.

## Release authority

Councils may merge engineering PRs that pass estate-gate + webkit at exact head.
Andy alone authorises public launch and frozen-path exceptions.
