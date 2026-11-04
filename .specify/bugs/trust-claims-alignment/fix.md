# Bug Fix: /trust/ claims alignment

## Changes Made

### 1. Recording Disclosure Section
**Before:**
```
How it is processed: Audio is transcribed and analysed by AI (Gemini / Piper TTS) to generate a response.
```

**After:**
```
How it is processed: In the browser demo, audio is processed by the browser's Web Speech API (no server voice pipeline). The preview demo number (when enabled) would route via Twilio to a server voice function.
```

### 2. Voice Demo Section - Browser Sandbox
**Before:**
```
Browser sandbox (/create): WebRTC-based test call runs entirely in the browser. No phone number required. Audio is processed by the same AI pipeline as the preview number.
```

**After:**
```
Browser sandbox (/create): WebRTC-based test call runs entirely in the browser. No phone number required. Audio is processed by the browser's Web Speech API.
```

### 3. Voice Demo Section - Preview Demo Number
**Before:**
```
Preview demo number (when enabled): A UK geographic number routed via Twilio to the same voice function.
```

**After:**
```
Preview demo number (when enabled): A UK geographic number routed via Twilio to a server voice function.
```

### 4. Backend Description
**Before:**
```
Both paths use the same backend: Twilio → /api/website/voice → Gemini (LLM) → Piper (TTS).
```

**After:**
```
The browser demo uses the browser's Web Speech API. The preview number (when enabled) would use: Twilio → server voice function → Gemini (LLM) → Piper (TTS).
```

## Files Modified
- `src/app/trust/page.tsx`

## Files Added
- `scripts/trust-claims-consistency.test.mjs` - New test mapping claims to register entries