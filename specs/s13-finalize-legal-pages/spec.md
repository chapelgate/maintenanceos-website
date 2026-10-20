# Specification: Legal Pages Finalization (S13)

## Objective
Replace all `[COUNSEL]` and `[OWNER]` placeholders in legal pages with `[ANDY: ...]` placeholders. Finalize `/privacy/`, `/cookies/`, and `/terms/` pages so they are publishable with only Andy's facts remaining.

## Objective
Update legal pages to remove `[COUNSEL]`/`[OWNER]` banners and fill all non-Andy placeholders with `[ANDY: ...]` format. Only `[ANDY: ...]` placeholders should remain after completion.

## Acceptance Criteria
- Each legal page (`/privacy/`, `/cookies/`, `/terms/`) returns HTTP 200
- No `[COUNSEL]` or `[OWNER]` strings remain in page source
- Only `[ANDY: ...]` placeholders remain
- `npm run build` passes
- `npm test` passes (legal surfaces test)
- Rich Results Test: FAQPage and BreadcrumbList detection where applicable

## Sources
- MASTER_PLAN.md S13 — Legal: Complete Legal Pages (Except Andy's Facts)
- RULES.md — Common rules for implementation
- impl\src\src\app\privacy\page.tsx
- impl\src\src\app\cookies\page.tsx
- impl\src\src\app\terms\page.tsx
- impl\src\src\components\LegalPageChrome.tsx