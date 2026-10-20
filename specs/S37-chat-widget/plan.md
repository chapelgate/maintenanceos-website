# S37 Implementation Plan

## Phase 1: Test-Driven Development
1. Write failing tests for ChatWidget component in `src/components/ChatWidget.test.tsx`
   - Render with default props
   - Render with custom title
   - Render with custom placeholder
   - Accessibility attributes on input
   - Focus-visible styles on send button
   - Keyboard navigation support
   - Closed state by default
   - Proper form structure

2. Run tests to confirm they fail (red phase)

## Phase 2: Component Implementation
3. Implement `src/components/ChatWidget.tsx`:
   - Client component with `"use client"`
   - State: isOpen, status (idle/submitting/success/error), error, message
   - Refs: form, message textarea, trigger button
   - Keyboard handlers: Enter to send, Enter/Space to toggle
   - Submit handler: POST to `/api/chat` with message, pageContext, pageUrl
   - Render: closed state (floating button) + open state (panel with form)
   - Accessibility: ARIA attributes, focus management, live regions for errors
   - Success state: confirmation message with close option
   - Pre-launch notice in form footer

## Phase 3: API Route
4. Implement `src/app/api/chat/route.ts`:
   - POST handler: validate message (1-2000 chars), sanitize
   - Build payload with message, pageContext, pageUrl, timestamp, userAgent, referer
   - Forward to `CHAT_WEBHOOK_URL` if configured, else log
   - Return 200 OK or appropriate error
   - OPTIONS handler for CORS preflight

## Phase 4: Integration
5. Update `src/app/create/page.tsx`:
   - Import ChatWidget
   - Add `<ChatWidget pageContext="create" title="Questions about the preview?" />` at page end

6. Update `src/components/IndustryRolePage.tsx`:
   - Import ChatWidget
   - Add `<ChatWidget pageContext={`industries/${role.slug}`} title={`Questions about ${role.label}?`} />` after CTA section

## Phase 5: Verification
7. Run `npm run lint` - must pass
8. Run `npx tsc --noEmit` - must pass
9. Run `npm test` - all tests pass (except pre-existing piper-http failure)
10. Run `npm run build` - must complete successfully
11. Verify ChatWidget HTML in `out/create/index.html` and `out/industries/*/index.html`

## Phase 6: PR & Merge
12. Commit changes
13. Push branch `feat/S37-chat-widget`
14. Create PR with proper Estate-Preflight header
15. Wait for CI (estate-gate, validate, webkit-a11y)
16. Merge with `gh pr merge --squash` when all checks green
17. Update IMPL_STATE.md with PR number and SHA