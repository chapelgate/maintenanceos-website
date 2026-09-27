# Continuation Step 6 — functional QA

**Date:** 2026-09-27
**Owner:** QA + Website Manager
**Baseline:** Step 5 commit `10b7ae402169f9fb4cf99967f4f966c7d204a346`

## Goal

Exercise the integrated exported website and conversion contract without touching
production leads, telephony, or paid infrastructure.

## New reusable gate

`npm run functional:smoke` now:

- serves the completed `out/` export from an ephemeral loopback port;
- checks every sitemap route returns 200;
- verifies the key Home, Create, Demo, Contact, Features and Security content;
- proves an unknown route returns the static 404;
- starts the existing form stub on an ephemeral loopback port;
- proves valid lead payload acceptance;
- proves invalid email rejection;
- proves honeypot submissions are discarded;
- proves the static release marker contains a full commit SHA.

The smoke command is wired into `release:preflight` immediately after the
production build. It uses only Node core modules and the existing form-stub code.

## Safety

The smoke test never posts to the production Railway endpoint, sends email, calls
Twilio, provisions a number, touches a database, or changes live infrastructure.

## Verification

- full repository tests: **185/185 PASS**;
- Next.js 16.3.6 static build: **30/30 routes generated**;
- functional export smoke: **26 sitemap routes**, valid/invalid/honeypot form
  cases and static 404 checked, **0 failures**.
