# Plan for mw-buyer-pack-micro-polish: synthetic demo data disclosure + font preload fix

## Steps
1. Add demo-data-is-synthetic disclosure section to /buyers/ page confirming all data is synthetic
2. Change `preload: true` to `preload: false` in localFont config 
3. Verify font preload test passes
4. Run `npm run build` to verify green build
5. Run `npm test` to verify 865/865 tests pass
6. Commit and push with Estate headers
