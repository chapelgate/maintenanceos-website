# Header Menu Fix

## Summary

Fix the site header to meet the following requirements:

1. At 390px width:
   - Header is one row with hamburger at far right
   - Menu panel sits within 0-390px horizontal range
   - Menu panel has max-height calc(100dvh - header height) with internal scrolling
   - Toggle label switches between 'Open menu' and 'Close menu' with aria-expanded
   - Tapping outside or following a link closes the menu

2. At 1280px width:
   - Header is one row no more than 72px tall
   - Between 768px and 1100px uses hamburger layout instead of wrapping

3. 'Safety rules' appears only once in the desktop nav

4. 'All sectors' dropdown is a plain disclosure (no role=menu); clicking outside closes it; Escape closes it and returns focus

## Changes

- Modified src/components/SiteHeader.tsx:
  * Adjusted mobile layout to show hamburger at far right and demo CTA at left
  * Fixed menu panel positioning and width to stay within viewport
  * Added max-height and overflow-y-auto for scrolling menu
  * Enhanced script to handle header height variable, aria-label/aria-expanded toggling, click outside to close, and Escape key handling
  * Removed duplicate 'Safety rules' CTA from desktop nav
  * Removed role attributes from 'All sectors' dropdown
  * Updated nav breakpoints to show hamburger layout below 1100px and desktop layout at 1100px and above

- No changes to src/config/site.ts (nav items unchanged)

## Test Plan

- Verified visual behavior at 390px, 768px, 1100px, and 1280px widths
- Verified menu panel positioning and scrolling
- Verified toggle label and aria attributes
- Verified click outside and Escape key closing
- Verified 'Safety rules' appears once in desktop nav
- Verified 'All sectors' dropdown works as plain disclosure
- Ran lint, typecheck, test, and build - all passed