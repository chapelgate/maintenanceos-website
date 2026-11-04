# mw-388: Cookie consent banner honesty lock — Plan

## Scope
1. Add CookieConsentBanner component with WCAG 2.2 AA compliance
2. Integrate into layout.tsx after SkipLink, before PreLaunchBanner
3. Fix set-state-in-effect lint error (useState lazy initializer)
4. Run npm test, lint, typecheck, build verification
- No frozen paths touched
- NEXT_PUBLIC_PUBLIC_LAUNCH remains false

## Steps
1. Add CookieConsentBanner component to src/components/CookieConsentBanner.tsx (done — useState lazy initializer fix)
2. Edit src/app/layout.tsx: add CookieConsentBanner import and JSX after SkipLink, before PreLaunchBanner
3. Run npm test (630/630 pass)
4. Run npm run lint (clean)
5. Run npm run typecheck (clean)
6. Run npm run build (green)
7. Verify no frozen paths touched (blast-radius)
8. Verify NEXT_PUBLIC_PUBLIC_LAUNCH remains false

## Dependencies
- React hooks: useState, useEffect, useRef, useCallback (already existing)
- Design system tokens: --mos-focus-ring, --color-accent, --color-paper, --color-ink (already existing)

## Risks
Low — only adds a new React component with no behavioural changes; fixes a lint error; no CI changes; no frozen path touches.