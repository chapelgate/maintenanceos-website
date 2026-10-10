# Plan
1. Add two static server components, `GasSafetyStrip` and `GasSafetyBlock`. They use the existing warning tokens (#92400e on #fffbeb, about 7:1) and no JS.
2. Mount the strip in `layout.tsx` after the skip link. Add the hero microline. Make `#gas` the first section of the rulebook. Show the block for 4 sector slugs in `IndustryRolePage`.
3. Point og:image at the static file URL with no trailing slash.
4. Add a regression test file. Run lint, tests and build. Expert review (Nemotron free tier), then manual verification.
5. Rollback: revert the merge commit; App Platform rebuilds the previous commit.
