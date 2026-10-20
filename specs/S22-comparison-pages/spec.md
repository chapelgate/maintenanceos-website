# S22 — Comparison Pages Specification

## Slice ID
S22

## Title
Create `/compare/worksmartos-vs-{fixflo,moneypenny,answerconnect,fasthosts,dialzara,rosie,goodcall,phena}`

## Goal
Own "Safety-First AI Receptionist" category with verifiable facts only. Each page compares WorkSmartOS MaintenanceOS against one competitor using only publicly verifiable claims.

## Acceptance Criteria
1. 8 comparison pages created at `/compare/worksmartos-vs-{slug}/` for all 8 competitors
2. Each page returns HTTP 200
3. Lighthouse score ≥ 90 for each page
4. No invented claims — all competitor facts sourced from public pages with citations
5. Rich Results Test: "WebPage" valid on each page
6. BreadcrumbList JSON-LD present on each page
7. Pages linked from footer or relevant navigation (to be determined)

## Competitors and Slugs
| Competitor | Slug | Category |
|------------|------|----------|
| Fixflo | fixflo | Property maintenance software |
| Moneypenny | moneypenny | Telephone answering / virtual receptionist |
| AnswerConnect | answerconnect | Telephone answering / virtual receptionist |
| Fasthosts | fasthosts | Web hosting / business services |
| Dialzara | dialzara | AI phone agent |
| Rosie | rosie | AI phone agent |
| Goodcall | goodcall | AI phone agent |
| Phena | phena | AI phone agent |

## Page Structure
Each comparison page must include:
1. **PageHero** with eyebrow "Comparison", title "WorkSmartOS vs {Competitor}", and factual lede
2. **Structured comparison table** with verifiable dimensions:
   - Product category (software vs service vs hybrid)
   - AI capability (what the AI actually does)
   - Safety architecture (human-in-the-loop, rules, latches)
   - Data processing (what data is collected, where it goes)
   - Pricing transparency (published vs quote-only)
   - UK-specific features (Companies House, UK regulations)
   - Pre-launch / GA status
3. **Sources section** with numbered citations linking to competitor public pages
4. **JSON-LD**: Single block with Organization, WebSite, WebPage, BreadcrumbList
5. **Breadcrumb navigation**: Home → Compare → WorkSmartOS vs {Competitor}

## Content Requirements
- **No invented metrics, customers, certifications, awards, testimonials, prices, or legal facts**
- Every factual claim about a competitor must have a source URL with access date or be labelled ESTIMATE/UNVERIFIED
- WorkSmartOS claims must match what's on the site (pre-launch, not GA, safety latches, etc.)
- Honest about what MaintenanceOS does NOT do (no live phone in plan, not GA, etc.)

## Technical Implementation
- Dynamic route: `src/app/compare/[slug]/page.tsx`
- Content: `src/content/compare/*.mdx` (8 files, one per competitor)
- Reuse existing components: PageHero, JsonLd, BreadcrumbJsonLd, contentPageJsonLd
- Follow existing patterns from industry pages and trust page

## Dependencies
- S14 (JSON-LD deduplication + BreadcrumbList) — COMPLETE
- S21 (Trust page) — COMPLETE

## Size
M

## Owner
WEBSITE_REPO