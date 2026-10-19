# S17 Implementation Plan

## Approach
1. Modify `src/app/sitemap.ts` to include `lastModified` field for each URL
2. Create `src/app/robots.ts` with AI bot allowances
3. Update `src/config/routes.ts` to include /vulnerability-disclosure/ and /subprocessors/
4. Add helper script `scripts/generate-sitemap.ts` for sitemap generation with lastmod from git/file mtime
5. Add test `scripts/generate-sitemap.test.mjs` for verification

## Files to Modify
- `src/app/sitemap.ts` - Add lastModified field
- `src/app/robots.ts` - New file with AI bot allowances
- `src/config/routes.ts` - Add two missing paths
- `scripts/generate-sitemap.ts` - New helper script
- `scripts/generate-sitemap.test.mjs` - New test file

## Testing
- TypeScript compilation
- ESLint
- Unit tests
- Build verification
- Acceptance test against local build output