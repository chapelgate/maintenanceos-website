# S26: Accessibility Remediation

## Summary
Implement WCAG 2.2 AA accessibility remediation for the WorkSmartOS website.

## Requirements
1. **Skip link** - Add skip to main content link (already exists in layout.tsx and SkipLink.tsx)
2. **Brand orange contrast** - Fix contrast to meet 4.5:1 ratio (align with BRAND_SYSTEM.md light theme)
3. **aria-live on voice transcript** - Add aria-live=polite to voice transcript in SandboxTestCallPanel (already exists)
4. **Form labels audit** - Ensure all form inputs have proper labels in Create form components

## Acceptance Criteria
- axe-core: 0 critical, 0 serious violations
- WAVE: 0 errors
- Lighthouse accessibility score >=95
- All existing accessibility tests pass