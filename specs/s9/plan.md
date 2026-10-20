# Plan for S9: Add security.txt

## Steps
1. Create `public/.well-known/` directory
2. Create `public/.well-known/security.txt` with RFC 9116 Contact field
3. Run `npm run build` to verify no regressions
4. Commit and push
5. Create PR with required Estate headers