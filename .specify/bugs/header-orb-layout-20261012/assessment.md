# Assessment: compact header overflows and the home orb covers its links

- At 390px the header wrapped onto two rows. The menu was anchored to that wrapped hamburger, so its box started at about x -76 and ran off the viewport.
- From 768px to 1100px the desktop labels wrapped instead of using the hamburger. "Safety rules" was also repeated in the desktop cluster.
- The "All sectors" list was easy to treat as a menu widget. Outside clicks and Escape needed a plain disclosure that does not move focus except when Escape returns it.
- On the home orb, "Request an early demo" wrapped onto two lines. The centre of that union box missed the anchor. The orb button's idle morph also moved its hit target.
- Issues #222 and #223. The earlier attempts (#224, #225) were closed: an invalid Tailwind variant, a click listener that focused on every click, and an animation removal without a hit-test.

Verdict: verified against the current header and orb source before the fix.
