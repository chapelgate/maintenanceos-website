# S37: Chat Widget on /create + Industry Pages

## Overview
Embed a chat widget on the `/create` page and all industry pages (`/industries/*`) that forwards messages to an operator webhook (DigitalOcean Function). The widget must be keyboard accessible (no mouse required).

## Acceptance Criteria
1. Chat widget renders on `/create/` page with title "Questions about the preview?"
2. Chat widget renders on all 8 industry pages (`/industries/landlords/`, `/industries/letting-agents/`, `/industries/property-managers/`, `/industries/maintenance-companies/`, `/industries/housing-associations/`, `/industries/facilities-management/`, `/industries/councils/`, `/industries/holiday-lets/`) with contextual titles
3. Widget loads in static HTML (SSR) - visible in `curl` output
4. Message submission POSTs to `/api/chat` endpoint
5. `/api/chat` endpoint forwards to `CHAT_WEBHOOK_URL` environment variable (DO Function)
6. Widget is fully keyboard accessible:
   - Tab to open widget
   - Enter/Space to open/close
   - Tab to message field
   - Enter to send (Shift+Enter for newline)
   - Focus management on open/close
7. ARIA attributes: `role="region"`, `aria-label`, `aria-expanded`, `aria-controls`, `aria-modal`
8. Pre-launch notice displayed: messages forwarded to email
9. Error handling for failed submissions
10. Success state with confirmation message

## Technical Requirements
- Component: `src/components/ChatWidget.tsx` (client component)
- API Route: `src/app/api/chat/route.ts` (dynamic)
- Integration: Added to `/create/page.tsx` and `src/components/IndustryRolePage.tsx`
- Webhook URL: `CHAT_WEBHOOK_URL` env var (set on DO Function, not in this repo)
- No external dependencies beyond React/Next.js built-ins

## Files Created/Modified
- `src/components/ChatWidget.tsx` (new)
- `src/components/ChatWidget.test.tsx` (new)
- `src/app/api/chat/route.ts` (new)
- `src/app/create/page.tsx` (modified - import + render)
- `src/components/IndustryRolePage.tsx` (modified - import + render)

## Skills Used
- vercel-react-best-practices
- accessibility
- test-driven-development
- observability-and-instrumentation
- api-design-principles