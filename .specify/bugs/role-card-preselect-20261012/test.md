# Test

`src/lib/agent-selection.test.ts` round-trips all six slugs and rejects an unknown role.

`scripts/role-card-preselect.test.mjs` locks the card links, the client-side query read, step 3 selection, the empty-URL scan guard, back to the website step, and the HTTPS website requirement.

`npm test` (266 + 455) passed.

Browser check on the local site: all six cards open step 3 with the matching role selected, Back returns to step 1, an unknown role stays on step 1, and finishing the website step returns to step 3 with Maintenance desk still selected. The website check does not start on the empty-URL arrival.

Verdict: verified locally before merge.
