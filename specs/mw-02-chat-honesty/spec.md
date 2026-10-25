# mw-02-chat-honesty

## Problem

The chat widget promises an email reply and fetches `/api/chat`, but the static export cannot serve that route and collects no email address.

## Cause

ChatWidget success copy claims email delivery; src/app/api/chat/route.ts still returns ok while logging when webhook is empty.

## Acceptance

- ChatWidget does not promise email reply or team-email forwarding.
- ChatWidget does not fetch /api/chat.
- src/app/api/chat/route.ts is absent.
- node --test scripts/chat-honesty.test.mjs exits 0.
