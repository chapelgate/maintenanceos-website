# Bug Assessment: /trust/ claims alignment

## Summary
The `/trust/` page contained overstated voice/backend claims that exceeded verified capabilities in the claims register and the browser-only demo description on `/demo/`.

## Root Cause
- Recording disclosure stated "Audio is transcribed and analysed by AI (Gemini / Piper TTS)" implying a server-side pipeline for all demos
- Voice demo section claimed both browser sandbox and preview number used "the same AI pipeline"
- Backend description said "Both paths use the same backend: Twilio → /api/website/voice → Gemini (LLM) → Piper (TTS)"

## Actual Capability (per PRODUCT_CLAIMS_REGISTER.md)
- V-01: Provider-aware AI voice receptionist runtime is UNDER TEST (not GA)
- V-07: Controlled carrier call proven on canonical runtime is NOT AVAILABLE (NO-GO)
- Browser demo uses Web Speech API (client-side)
- Preview demo number (when enabled) would route via Twilio to server voice function

## Affected Pages
- /trust/ (primary)
- No other pages have the same overstated claims

## Impact
- Misleading claims about voice demo capabilities
- Inconsistent with claims register VERIFIED-only standard
- Could create legal/regulatory exposure