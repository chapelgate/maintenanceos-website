# Plan for mw-a11y-coverage-alignment: fix Inter font preload false

## Steps
1. Change `preload: true` to `preload: false` in localFont config in `src/app/layout.tsx`
2. Verify `scripts/font-preload.test.mjs` passes
3. Run `npm run build` to verify green build
4. Run `grep -r "fonts.googleapis.com" .next/` to verify no external fetches
5. Commit and push with Estate headers
