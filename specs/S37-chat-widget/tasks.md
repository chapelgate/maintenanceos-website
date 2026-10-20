# S37 Tasks

## Completed Tasks
- [x] Write failing tests for ChatWidget component (`src/components/ChatWidget.test.tsx`)
- [x] Implement ChatWidget component (`src/components/ChatWidget.tsx`)
- [x] Implement API route for chat webhook (`src/app/api/chat/route.ts`)
- [x] Integrate ChatWidget on `/create` page (`src/app/create/page.tsx`)
- [x] Integrate ChatWidget on industry pages (`src/components/IndustryRolePage.tsx`)
- [x] Run lint, TypeScript, tests, build - all pass
- [x] Verify ChatWidget renders in static HTML output for `/create` and industry pages

## Pending Tasks
- [ ] Commit changes to git
- [ ] Push branch `feat/S37-chat-widget`
- [ ] Create PR with Estate-Preflight header
- [ ] Wait for CI checks (estate-gate, validate, webkit-a11y)
- [ ] Merge PR when all checks green
- [ ] Update IMPL_STATE.md with PR number and merge SHA
- [ ] Run acceptance check against https://worksmartos.co.uk after deploy

## Blockers
- None identified. DO Function webhook (`CHAT_WEBHOOK_URL`) is configured separately by dr eggbot (deploy note D2).