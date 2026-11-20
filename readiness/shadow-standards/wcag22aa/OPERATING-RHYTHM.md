# Operating Rhythm — WCAG 2.2 Level A + AA

Purpose: Recurring checks that keep WCAG 2.2 AA compliance true day to day, wired to existing Dell timers/jobs where possible.

## Daily (automated in CI/CD)

| Check | Tool | Trigger | Evidence location | Owner |
|-------|------|---------|-------------------|-------|
| axe-core automated accessibility scan | axe-core / pa11y | PR merge / daily schedule | CI logs; jobs-work-dell/readiness/axe/ | DevOps |
| Colour contrast check | axe-core / colour-contrast analyser | PR merge | CI logs; jobs-work-dell/readiness/shadow-standards/27-colour-contrast/ | Frontend engineering |
| Keyboard navigation smoke test | Manual + automated | Daily cron | jobs-work-dell/readiness/shadow-standards/25-keyboard-nav/ | QA / Accessibility |

## Weekly (automated)

| Check | Tool | Trigger | Evidence location | Owner |
|-------|------|---------|-------------------|-------|
| Full page axe scan (all product UIs) | axe-core CLI | Weekly cron | jobs-work-dell/readiness/axe/ | Security / Accessibility |
| Pa11y CI against staging URLs | pa11y-ci | Weekly cron | jobs-work-dell/readiness/pa11y/ | DevOps |
| Target size audit (2.5.8) | Custom script / axe | Weekly cron | jobs-work-dell/readiness/shadow-standards/wcag22aa/ | Frontend engineering |

## Per-release (on deployment)

| Check | Tool | Trigger | Evidence location | Owner |
|-------|------|---------|-------------------|-------|
| Full WCAG 2.2 AA checklist walk-through | Manual + automated | Release gate | Release notes; jobs-work-dell/readiness/shadow-standards/wcag22aa/ | Accessibility |
| Accessibility statement review for accuracy | Manual | Release gate | docs/accessibility-statement.md | Product owner / Legal |
| Keyboard-only end-to-end journey test | Manual | Release gate | jobs-work-dell/readiness/shadow-standards/25-keyboard-nav/ | QA |

## Quarterly (scheduled)

| Check | Tool | Trigger | Evidence location | Owner |
|-------|------|---------|-------------------|-------|
| Screen reader test (NVDA/VoiceOver) | Manual | Quarterly | jobs-work-dell/readiness/shadow-standards/26-screen-reader/ | QA / Accessibility |
| Third-party accessibility audit (CREST/ASPIRE) | External | Quarterly/annual | TENDER-REGISTER.md | Andy |
| WCAG 2.2 AA self-assessment update | Manual review | Quarterly | jobs-work-dell/readiness/shadow-standards/wcag22aa/ | Accessibility |
| Welsh language content parity check | Manual | Quarterly | jobs-work-dell/readiness/shadow-standards/28-welsh-language/ | Content / Localisation |

## Council review (per BRIEF.md)

| Review | Participants | Cadence | Evidence | Output |
|--------|--------------|---------|----------|--------|
| Council A/B + Roastroom | Model makers A/B + 7 business advisors | Per PR / per product fix | out/council-A.md, out/council-B.md, out/roastroom/ | MERGE / BLOCK at exact head |

## Wired to existing Dell jobs/timers

- **BUILD-HOURLY.md** (jobs-work-dell/): CI runs on PR merge → covers daily axe-core and contrast checks
- **dell-watch/**: Monitors deployment health → covers per-release accessibility checks
- **jobs-work/readiness/FAILURE-LOG.md**: All failures logged per STRICT rule t1081u
- **PentAGI security testing** (skill pentagi-security-testing): Runs on all testing jobs per t1058u
- **Full Shakedown** (shakedown/CHECKLIST.md): Required before any release

## Free scanner evidence targets (WCAG specific)

| Scanner | Target | Output dir | Frequency |
|---------|--------|------------|-----------|
| axe-core | All product UI pages (WCAG 2.2 AA) | jobs-work-dell/readiness/axe/ | Weekly + PR |
| pa11y | Staging URLs for all 12 products | jobs-work-dell/readiness/pa11y/ | Weekly |
| colour contrast | UI components against WCAG thresholds | jobs-work-dell/readiness/shadow-standards/27-colour-contrast/ | Weekly |

## Status tracking

- SHADOW-TEMPLATE.md status column updated after each scanner run
- GAPS.md status column updated when fix merged and verified
- OPERATING-RHYTHM.md reviewed quarterly by Accessibility + Andy
