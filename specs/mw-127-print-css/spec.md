# mw-127-print-css

## Goal
Add a print stylesheet that hides site chrome (header, skip link, pre-launch banner, chat) while keeping main content and footer for brochure printing.

## Acceptance
- src/app/globals.css contains @media print hiding .site-header, .prelaunch-banner, .mos-chat-widget, and the skip link.
- PreLaunchBanner carries class prelaunch-banner.
- node --test scripts/print-css.test.mjs passes.
