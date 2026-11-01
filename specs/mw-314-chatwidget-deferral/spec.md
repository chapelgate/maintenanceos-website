# Spec: mw-314 chat widget deferral

## Problem
ChatWidget is statically imported on `/create` and `/industries/*` pages, pulling client-side JS (hydration, useSyncExternalStore, state) into initial bundle for pages where the widget sits below the fold.

## Scope
- Create `src/components/DeferredChatWidget.tsx` wrapper using `next/dynamic` (`ssr: false`) with accessible loading placeholder
- Update `/create` page and `/industries/[slug]/` page to use `DeferredChatWidget`
- Add `scripts/chatwidget-deferral.test.mjs` locking the pattern
- Keep existing behaviour, props, and accessibility (focus management, Escape, keyboard)

## Out of scope
- Changing ChatWidget internal implementation
- Moving ChatWidget from "use client" boundary
- publicLaunch, deploy, nginx

## Acceptance
- chatwidget-deferral tests pass
- npm test / lint / typecheck / build green
- publicLaunch remains false; no frozen paths touched
