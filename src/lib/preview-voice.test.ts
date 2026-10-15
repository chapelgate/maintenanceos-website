import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  CONFIGURED_VOICE_NAME,
  GOLDEN_LINE_VOICE_NAME,
  GOLDEN_LINE_VOICE_PROVIDER,
  previewVoiceConfig,
  previewVoiceRequestBody,
  requestServerVoice,
  resetServerVoiceStateForTests,
  speakReceptionistText,
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
  assert.equal(CONFIGURED_VOICE_NAME, "Theatrical");
});

test("the browser voice module never names the server voice secrets", () => {
  const source = fs.readFileSync(new URL("./preview-voice.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /ELEVENLABS_API_KEY/);
  assert.doesNotMatch(source, /ELEVENLABS_VOICE_ID/);
  assert.doesNotMatch(source, /xi-api-key/);
});

test("server voice plays returned audio and sends text only", async () => {
  resetServerVoiceStateForTests();
  const calls: Array<{ url: string; body: string }> = [];
  const played: string[] = [];
  const mode = await speakReceptionistText("Hello from the desk", {
    fetchImpl: async (input, init) => {
      calls.push({ url: String(input), body: String(init?.body) });
      return new Response(
        JSON.stringify({ ok: true, contentType: "audio/mpeg", audioBase64: btoa("MP3") }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
    playAudio: async (bytes) => {
      played.push(new TextDecoder().decode(bytes));
    },
  });
  assert.equal(mode, "preview");
  assert.deepEqual(played, ["MP3"]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "/api/website/voice");
  assert.deepEqual(JSON.parse(calls[0]?.body ?? "{}"), { text: "Hello from the desk" });
  assert.doesNotMatch(calls[0]?.body ?? "", /ELEVENLABS|xi-api-key|voiceId/i);
});

test("a missing server voice falls back without exposing configuration", async () => {
  resetServerVoiceStateForTests();
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return new Response(
      JSON.stringify({ ok: false, error: "voice_not_configured", fallback: "browser" }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  };
  const first = await speakReceptionistText("Hello", { fetchImpl });
  const second = await speakReceptionistText("Hello again", { fetchImpl });
  assert.equal(first, "unavailable");
  assert.equal(second, "unavailable");
  assert.equal(calls, 1);
  const direct = await requestServerVoice("Hello", {
    endpoint: "/api/website/voice",
    fetchImpl: async () =>
      new Response("missing", { status: 404, headers: { "content-type": "text/plain" } }),
  });
  assert.deepEqual(direct, { ok: false, reason: "not_configured" });
  resetServerVoiceStateForTests();
});
