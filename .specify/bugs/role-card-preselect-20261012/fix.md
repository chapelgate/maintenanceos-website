# Fix

- Each of the six home cards links to `/create/?role=` using the public slug (`maintenance-desk` for the maintenance desk).
- `/create` reads that query in the browser after hydration. A known role opens step 3 with that role selected. An unknown role stays on step 1.
- Landing on step 3 with no website does not start the website check. Back returns to step 1 and keeps the role, so finishing the website step returns to step 3 with the same role selected.
- A later website check does not clear a role that arrived from the card.
- Preparing the configuration still requires an HTTPS business website.
