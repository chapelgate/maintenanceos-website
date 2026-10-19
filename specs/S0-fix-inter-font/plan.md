# Plan for S0: Self-host Inter Font

## Steps
1. Create `public/fonts/` directory
2. Download Inter Regular (400) woff2 from GitHub
3. Download Inter Medium (600) woff2 from GitHub
4. Update `src/app/layout.tsx` to use `next/font/local` instead of `next/font/google`
5. Update `scripts/funnel-perf.test.mjs` to verify local font configuration
6. Run `npm run build` to verify
7. Run `grep -r "fonts.googleapis.com" .next/` to verify no external fetches
8. Run full test suite
9. Commit and push