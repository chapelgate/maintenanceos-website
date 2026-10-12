import assert from "node:assert/strict";
import test from "node:test";
import {
  GOLDEN_LINE_VOICE_NAME,
  GOLDEN_LINE_VOICE_PROVIDER,
  previewVoiceConfig,
  previewVoiceRequestBody,
} from "./preview-voice.ts";

test("spoken preview uses the browser until a website-owned endpoint exists", () => {
  const fallback = previewVoiceConfig({});
  assert.equal(fallback.mode, "browser");
  assert.equal(fallback.endpoint, "");
  assert.equal(fallback.voice, GOLDEN_LINE_VOICE_NAME);
  assert.equal(fallback.provider, GOLDEN_LINE_VOICE_PROVIDER);
  assert.equal(fallback.voice, "Gacrux");
  assert.equal(fallback.provider, "gemini");
  assert.equal("apiKey" in fallback, false);

  const configured = previewVoiceConfig({
    NEXT_PUBLIC_VOICE_PREVIEW_ENDPOINT: " https://voice.example/preview ",
    NEXT_PUBLIC_VOICE_PREVIEW_VOICE: "Gacrux",
  });
  assert.equal(configured.mode, "preview");
  assert.equal(configured.endpoint, "https://voice.example/preview");
  assert.deepEqual(previewVoiceRequestBody("Hello", configured), {
    text: "Hello",
    voice: "Gacrux",
    provider: "gemini",
  });
  assert.doesNotMatch(JSON.stringify(configured), /key|secret|token/i);
});
