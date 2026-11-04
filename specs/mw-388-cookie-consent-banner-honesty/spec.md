# mw-388: Cookie consent banner honesty lock — Spec Kit

## 1. Spec
Status: APPLIES
Reason: New CookieConsentBanner component with WCAG 2.2 AA compliance (focus visible, roles/labels, no focus trap, AA contrast). Behaviour: Accept/Reject equally prominent; choice persists in localStorage; Reject blocks non-essential scripts; changeable via /cookies/#settings. Frozen path: no frozen paths touched. publicLaunch remains false.

## 2. Plan
Status: APPLIES
Reason: Added CookieConsentBanner component to layout.tsx after SkipLink, before PreLaunchBanner. Used existing design system tokens (--mos-focus-ring, --color-accent). Moved stored-choice load from useEffect into useState lazy initializer to fix react-hooks/set-state-in-effect lint error. Kept all existing behaviour unchanged. No frozen paths touched.

## 3. Tasks
Status: APPLIES
- [x] Add CookieConsentBanner component with AA-compliant markup
- [x] Integrate into layout.tsx after SkipLink, before PreLaunchBanner
- [x] Fix set-state-in-effect lint error (useState lazy initializer)
- [x] Run npm test (630/630 pass)
- [x] Run npm run lint (0 errors, 0 warnings)
- [x] Run npm run typecheck (clean)
- [x] Run npm run build (green)
- [x] Verify no frozen paths touched (blast-radius)
- [x] Verify NEXT_PUBLIC_PUBLIC_LAUNCH remains false

## 4. Build Readiness
Status: APPLIES
Reason: `npm run lint` clean (0 errors, 0 warnings). `npm run typecheck` clean (tsc --noEmit passes). `npm run build` succeeds with static export (99 pages). No frozen paths touched. No PUBLIC_LAUNCH flip. Cookie consent is fully client-side with localStorage persistence only.