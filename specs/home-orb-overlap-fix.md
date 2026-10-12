# Home Orb Overlap Fix

## Issue
The home orb was covering links in the hero section at specific widths (390px, 1024px, 1280px) due to transform animations on the orb button.

## Fix
Removed the transform and scale animations from the orb button itself, leaving only the pseudo-elements to animate. This ensures the clickable button does not transform, preventing overlap and allowing normal clicks to succeed.

## Changes
- Modified `src/app/globals.css` to remove the `intake-idle` animation from `.intake-orb` in the `(prefers-reduced-motion: no-preference)` media block.