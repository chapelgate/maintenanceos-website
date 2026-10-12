# Test

- Reproduced on a production static export by rewriting `andy@chapelgatehome.uk` the way Cloudflare does. Before the fix, the page threw minified React error 418 (`text`) on the `EnquiryUnavailable` paragraph.
- After the fix, that address is absent from `out/create/index.html`, the same rewrite does not throw, and the address appears in the page after hydration.
- `npm test`, lint, typecheck, and `npm run build` passed.

Verdict: verified locally before merge. Live `/create` is checked after App Platform deploys the merge.
