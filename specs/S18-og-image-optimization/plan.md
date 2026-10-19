# S18 Implementation Plan

## Approach
1. Convert `public/og-image.png` to WebP format (`public/og-image.webp`) with quality 80, target <100KB
2. Update `src/lib/page-meta.ts` to reference `.webp` instead of `.png`
3. Add width/height/alt metadata to OpenGraph images in `buildRootMetadata()` and `contentPageMetadata()`
4. Update test `scripts/gas-safety.test.mjs` to check for `.webp` extension
5. Verify build output includes `og-image.webp` and correct metadata

## Files to Modify
- `public/og-image.webp` (new, generated from og-image.png)
- `src/lib/page-meta.ts` - Update OG_IMAGE_URL and add width/height/alt to OpenGraph images
- `scripts/gas-safety.test.mjs` - Update assertion for .webp extension

## Testing
- TypeScript compilation
- ESLint
- Unit tests
- Build verification
- Acceptance test: `curl -I https://worksmartos.co.uk/og-image.webp | grep -i content-length` < 102400; Lighthouse image audit passes