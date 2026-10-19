# S0: Self-host Inter Font

## Problem
The `validate` CI job fails because the build fetches the Inter font from Google Fonts (`fonts.googleapis.com`) at build time. This violates the requirement that `npm run build` passes offline with no external font fetches.

## Solution
Self-host the Inter font by:
1. Downloading Inter Regular (400) and Medium (600) woff2 files to `public/fonts/`
2. Switching from `next/font/google` to `next/font/local` in `src/app/layout.tsx`
3. Updating the test to verify local font configuration

## Acceptance Criteria
- `npm run build` exits 0
- `grep -r "fonts.googleapis.com" .next/` returns nothing