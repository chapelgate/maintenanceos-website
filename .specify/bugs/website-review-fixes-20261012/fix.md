# Fix

Smallest reversible edits in this repository:

- Classify zero-fetch PARTIAL scans as errors.
- Reseed a durable crawl only when it has no fetched or duplicate evidence, and copy policy/robots skip reasons into warnings.
- Unmount `GasSafetyStrip` from the layout. Keep the homepage link, the gas rulebook, and sector blocks.
- Add `public/favicon.ico` and `src/app/icon.png` (ink M on paper).
- Speak through a website-owned preview URL when configured; otherwise keep the browser voice. Flag the Desmond tour as recorded narration. Do not regenerate audio and do not read golden-line credentials.
- Pass pdf.js `standard_fonts/` and keep parse timers referenced.
- Upgrade `sharp` to 0.35.5 and `source-map-js` to 1.2.2 inside existing ranges. Do not downgrade `eslint-config-next` to 14.x.
- Reject scan URLs longer than 2048 characters and tighten the existing in-memory rate map. Update `bundle.cjs` to match.
- Rewrite the `/about` sector paragraph so those lines are planned products, not live.

Rollback: revert the merge commit on `main`. App Platform rebuilds the previous static commit. The droplet is unchanged by this revert.
