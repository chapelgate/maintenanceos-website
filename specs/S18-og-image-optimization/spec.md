# S18: og-image Optimization

## Summary
Convert og-image.png to WebP (<100KB) and add width/height meta tags for social sharing performance.

## Requirements
- og-image.webp must be <100KB (target ~13KB at quality 80)
- OpenGraph metadata must include width=1200, height=630, alt="WorkSmartOS"
- All pages must reference og-image.webp (not .png)
- Build must pass with TypeScript and lint clean

## Acceptance Criteria
- `curl -I https://worksmartos.co.uk/og-image.webp | grep -i content-length` < 102400
- `grep -r "og:image" out/` shows only .webp references with width/height/alt
- Lighthouse "Properly size images" audit passes
- Build passes; TypeScript clean; lint clean; tests pass (except pre-existing piper-http failure)