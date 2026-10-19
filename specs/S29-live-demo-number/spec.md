# S29 — Live Demo Number

## Summary
Add a live demo phone number display on the home page (`/`) and create page (`/create/`) that routes via Twilio to `/api/website/voice`. The number is provided by Andy via `NEXT_PUBLIC_DEMO_PHONE_NUMBER` environment variable. When configured, the number answers 24/7 with an AI greeting for basic intake — not a production answering service.

## Acceptance Criteria
- Home page (`/`) displays the live demo number when `NEXT_PUBLIC_DEMO_PHONE_NUMBER` is set, with a `tel:` link
- Create page (`/create/`) displays the live demo number when configured, with a `tel:` link
- Both pages clearly state: "Not a production answering service" / "answers 24/7 with AI greeting"
- When `NEXT_PUBLIC_DEMO_PHONE_NUMBER` is not set, home page shows "No live phone demo from this site"
- Build passes, TypeScript clean, lint clean
- All tests pass (except pre-existing piper-http and pricing static output failures)

## Scope
- Modified: `src/config/site.ts` (add `demoPhoneNumber` config)
- Modified: `src/app/page.tsx` (display demo number in closing CTA band)
- Modified: `src/app/create/page.tsx` (display demo number after hero section)
- Andy must provide: Twilio number via `NEXT_PUBLIC_DEMO_PHONE_NUMBER` env var (ANDY ITEM A22)
- Droplet/function must configure: Twilio webhook → `/api/website/voice` (DROPLET_OR_FUNCTION)