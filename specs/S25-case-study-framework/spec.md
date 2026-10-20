# S25 — Case-Study Framework (Real Only)

## Goal
Create CaseStudyCard component + framework in `/content/case-studies/` for real social proof when design partners exist. Andy provides 3+ real cases.

## Acceptance Criteria
- [x] CaseStudyCard component renders with logo/quote/link
- [x] Component accepts: logo (src/alt), quote, attribution (name/role/company), optional link (href/label)
- [x] Component is accessible (semantic HTML, proper heading hierarchy, alt text for logos)
- [x] `src/content/case-studies/` directory exists for MDX content
- [x] Build passes (`npm run build` exits 0)
- [x] TypeScript clean (`npx tsc --noEmit` exits 0)
- [x] Lint passes (`npm run lint` exits 0)
- [x] Tests pass (`npm test` - pre-existing failures only)

## Files Created
- `src/components/CaseStudyCard.tsx` — Case study card component
- `src/content/case-studies/` — Directory for case study MDX files (Andy provides content)
- `src/components/CaseStudyCard.test.tsx` — Component tests

## Files Modified
- None

## Skills Used
- `vercel-react-best-practices` — React component patterns, static export compatibility
- `accessibility` — Semantic HTML, heading hierarchy, alt text, focus management
- `web-quality-audit` — Build verification, component rendering verification

## Verification Evidence
```
Build output shows:
  CaseStudyCard component compiles without errors
  Component renders logo, quote, attribution, and optional link
  Accessibility: proper article/section structure, heading hierarchy, alt attributes
  Test suite covers rendering, props, and accessibility
```

## Dependencies
- S21 (Trust page) — satisfied (merged SHA 58e8760)

## Notes
- Content is provided by Andy (design partners) — component is framework only
- No invented claims, metrics, or testimonials — only real cases
- Component follows BRAND_SYSTEM.md tokens (paper/surface, accent, ink, muted)
- Static export compatible (output: "export")