# S18 Tasks

- [x] Convert public/og-image.png to WebP format (quality 80) → public/og-image.webp (13KB)
- [x] Update src/lib/page-meta.ts OG_IMAGE_URL to reference .webp
- [x] Add width/height/alt to OpenGraph images in buildRootMetadata() and contentPageMetadata()
- [x] Update scripts/gas-safety.test.mjs assertion for .webp extension
- [x] Verify build passes (npm run build)
- [x] Verify TypeScript compilation (npx tsc --noEmit)
- [x] Verify lint passes (npm run lint)
- [x] Verify tests pass (npm test) - pre-existing piper-http failure unrelated
- [x] Verify acceptance criteria: og-image.webp <100KB; metadata includes width/height/alt; all pages reference .webp