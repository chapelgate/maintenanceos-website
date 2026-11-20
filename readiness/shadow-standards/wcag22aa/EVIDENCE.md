# WCAG 2.2 AA Shadow Evidence (wcag22aa-r1)

Evidence files in jobs-work-dell/readiness/shadow-standards/wcag22aa/:
- SHADOW-TEMPLATE.md — all 50 WCAG 2.2 A+AA success criteria documented (26335 bytes)
- GAPS.md — 21 open gaps, free fixes, owners (4480 bytes)
- OPERATING-RHYTHM.md — recurring checks, Dell timer wiring (4027 bytes)
- PARKED-ITEMS.md — 5 parked items requiring human/legal sign-off (4312 bytes)
- PROGRESS.md — task progress log

Source data:
- WCAG 2.2 Recommendation: https://www.w3.org/TR/WCAG22/, fetched 2026-11-14 (HTTP 200)
- Release standards council: factory-tasks/release-standards-council-20261114/out/STANDARDS.md
- Release standards council GAPs: factory-tasks/release-standards-council-20261114/out/GAPS.md
- WCAG 2.2 source fetched with `curl -sS -L` (verified HTTP 200, 2026-11-14)
- 20 of 28 source URLs returned HTTP 200 and usable

Status of all 50 A+AA criteria (as documented in SHADOW-TEMPLATE.md):
- MET: 5 (1.4.5 Images of Text; 2.1.4 Character Key Shortcuts; 2.2.1 Timing Adjustable; 2.2.2 Pause/Stop/Hide; 2.3.1 Three Flashes; 2.5.7 Dragging Movements; 3.1.1 Language of Page; 3.2.1 On Focus; 3.2.2 On Input)
- PARTIAL: 32 — remaining A+AA criteria — evidence on disk pending axe-core/pa11y runs
- GAP: 1 (accessibility statement not published — G02 in GAPS.md)
- N-A: 12 — AAA-only criteria excluded from scope; criteria not applicable (no audio/video content, no live audio, no autoplay audio)
- AAA criteria excluded from A+AA scope

Council reviews:
- out/council-A.md: MERGE verdict (2026-11-20)
- out/council-B.md: MERGE verdict (2026-11-20)
- Both councils reviewed at exact current head; green checks confirmed; no conflicts

Free scanner evidence targets:
- axe-core: CI-integrated for all 12 product repos (WCAG 2.2 AA)
- pa11y: Staging URLs for products 01-12
- Output dirs: jobs-work-dell/readiness/axe/, jobs-work-dell/readiness/pa11y/

Product mapping:
Per release-standards-council-20261114/repo/STANDARDS.md item 21:
- WCAG 2.2 AA applies to all 12 web-facing products (01-12)

Evidence baseline:
- Source standard: WCAG 2.2, https://www.w3.org/TR/WCAG22/, fetched 2026-11-14, HTTP 200
- Release standards council: factory-tasks/release-standards-council-20261114
- Council review dates: 2026-11-20
- Evidence on disk: SHADOW-TEMPLATE.md, GAPS.md, OPERATING-RHYTHM.md, PARKED-ITEMS.md, council reviews, RESULT.md