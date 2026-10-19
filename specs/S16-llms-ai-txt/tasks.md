# S16: Ensure llms.txt current; add /.well-known/ai.txt mirroring llms.txt - Tasks

- [x] Verify `public/llms.txt` content is current
- [x] Create `public/.well-known/` directory
- [x] Create `public/.well-known/ai.txt` mirroring `public/llms.txt`
- [x] Verify files match locally (`diff public/llms.txt public/.well-known/ai.txt`)
- [x] Run `npm run build` - PASS
- [x] Run link/sitemap checks
- [x] Create spec artifact files (spec.md, plan.md, tasks.md)
- [ ] Commit and push changes
- [ ] Open PR with Estate headers
- [ ] Wait for CI checks (estate-gate, validate, webkit-a11y) to pass
- [ ] Merge PR when all checks green
- [ ] Verify live acceptance test against https://worksmartos.co.uk

(End of file - total 14 lines)