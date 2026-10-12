# Fix

Header (`src/components/SiteHeader.tsx`, `src/app/globals.css`):

- One 4rem row. Hamburger through 1100px; desktop nav from 1101px, in plain CSS, not a Tailwind arbitrary variant.
- "Safety rules" is only the primary-nav item. The mobile panel still has "See the safety rules".
- The menu is positioned from the header, with `max-height: calc(100dvh - var(--site-header-bottom) - 0.5rem)` and internal scroll. The offset is written into a `<style>` tag so React hydration does not see an inline style.
- `::details-content` has no opacity, translate, or content-visibility transition. Those made it the menu's containing block and squeezed the panel onto the hamburger.
- Outside click and in-menu links set `open` false and do not call `focus()`. Escape closes and focuses the summary. "All sectors" is a plain `<ul>` with no `role="menu"`.

Orb (`src/components/SiriOrbCloud.tsx`, `src/app/globals.css`):

- The two orb-card links sit on their own nowrap lines, so each bounding box centre is the anchor.
- `.intake-orb` no longer runs `intake-idle`. `::before` and `::after` still run the halo and sheen.

Rollback: revert these two commits.
