# S16: Ensure llms.txt current; add /.well-known/ai.txt mirroring llms.txt - Plan

## Approach
1. Verify `public/llms.txt` content is current (already exists in repo)
2. Create `public/.well-known/` directory
3. Create `public/.well-known/ai.txt` with identical content to `public/llms.txt`
3. Verify both files are accessible after build/deploy

## Files to Create/Modify
- `public/.well-known/ai.txt` (new) - mirror of llms.txt

## Verification
- Run `npm run build` - must pass
- Run link/sitemap checks
- Verify locally: `cat public/.well-known/ai.txt` matches `cat public/llms.txt`
- After deploy: `curl -f https://worksmartos.co.uk/.well-known/ai.txt` returns 200 with matching content

(End of file - total 14 lines)