# Test

Headless Chromium against `http://localhost:3210/`.

Header:

- 390, 768, and 1100px: header height 65px, desktop nav `display: none`, hamburger on the content's right edge.
- 390×640 open menu: box x 16, right 359, width 343, bottom 633 inside a 640px viewport. `max-height` 513px, `overflow-y: auto`. After scrolling, "See the safety rules" sat inside the panel and the viewport.
- Toggle read "Close menu" with `aria-expanded="true"`, then "Open menu" after an outside click. That click did not leave focus on the summary. Following `/faq/` closed the menu.
- An unrelated click while closed did not focus the summary.
- 1280px: header height 65px, one row (every item top 47), last item right 1241. "Safety rules" once, href `/how-we-keep-control/`. The sectors list `role` was null. Escape closed it and returned focus. An outside click closed it without focusing the summary.

Orb, at 390, 1024, and 1280px, after the note was open:

- `elementFromPoint` at the centre of "See how it works" and "Request an early demo" was that `<a>`.
- A normal click went to `/how-it-works/` and `/demo/`.
- The orb button still opened the note (`aria-expanded="true"`).
- While idle, the button animation was `none`, `::before` was `intake-halo`, and `::after` was `intake-sheen`.

`npm test` (251 + 452), eslint, `tsc --noEmit`, and `npm run build` passed.

Verdict: verified locally before merge. Live pages are checked after App Platform deploys the merge.
