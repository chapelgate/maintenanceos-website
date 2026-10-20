# Implementation Plan: S5 Scanner FAQ Extraction

## Approach
1. Modify `extractDetailsFaqs` in `packages/onboarding-ingest/src/extract.ts`
2. Change button/div regex to require `aria-controls` on button matching `id` on div
3. Keep `<details>`/`<summary>` pattern unchanged (already semantic)
4. Add tests for:
   - Mobile menu false positive rejection
   - Proper FAQ accordion extraction

## Technical Details

### Current regex (permissive):
```typescript
/<button\b[^>]*\baria-expanded=["'](?:true|false)["'][^>]*>([\s\S]*?)<\/button>\s*<div\b[^>]*>([\s\S]*?)<\/div>/gi
```

### New regex (strict):
```typescript
/<button\b[^>]*\baria-expanded=["'](?:true|false)["'][^>]*\baria-controls=["']([^"']+)["'][^>]*>([\s\S]*?)<\/button>\s*<div\b[^>]*\bid=["']\1["'][^>]*>([\s\S]*?)<\/div>/gi
```

This requires:
- `aria-expanded="true|false"` on button
- `aria-controls="some-id"` on button
- `id="same-id"` on following div

The `faqPair` function already requires question mark in button text, so mobile menu buttons ("Menu", "Services", etc.) are rejected.

## Testing
- Existing tests verify JSON-LD FAQPage and details/summary extraction still work
- New test: mobile menu with 4 button/div pairs (no question marks) → no FAQs extracted
- New test: proper FAQ with 3 question-marked button/div pairs with aria-controls/id → FAQs extracted

## Risk Assessment
- Low risk: only tightens extraction, doesn't change JSON-LD or details/summary paths
- No breaking changes to existing functionality
- Improves precision at cost of recall (intentional per S5 goals)