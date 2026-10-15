"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/onboarding-ingest/packages/website/voice/index.ts
var index_exports = {};
__export(index_exports, {
  main: () => main,
  resetVoiceRateLimitForTests: () => resetVoiceRateLimitForTests
});
module.exports = __toCommonJS(index_exports);
var MAX_TEXT = 400;
var RATE_WINDOW_MS = 6e4;
var RATE_MAX = 6;
var UPSTREAM_TIMEOUT_MS = 2e4;
var ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";
var rateBuckets = /* @__PURE__ */ new Map();
function response(statusCode, body, origin = "") {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept"
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return { statusCode, headers, body };
}
function allowRate(key, now) {
  const cutoff = now - RATE_WINDOW_MS;
  const previous = (rateBuckets.get(key) ?? []).filter((stamp) => stamp > cutoff);
  if (previous.length >= RATE_MAX) {
    rateBuckets.set(key, previous);
    return false;
  }
  previous.push(now);
  rateBuckets.set(key, previous);
  return true;
}
function resetVoiceRateLimitForTests() {
  rateBuckets.clear();
}
function readText(event) {
  if (typeof event.text === "string") return event.text.trim();
  const raw = event.http?.body;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.text === "string") return parsed.text.trim();
    } catch {
      return "";
    }
  }
  return "";
}
function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}
async function main(event = {}, options = {}) {
  const method = event.http?.method?.toUpperCase() ?? "GET";
  const headers = event.http?.headers ?? {};
  const origin = headers.origin ?? headers.Origin ?? "";
  const clientIp = (headers["x-forwarded-for"] ?? headers["X-Forwarded-For"] ?? "unknown").split(",")[0]?.trim() || "unknown";
  if (method === "OPTIONS") return response(204, "", origin);
  if (method !== "POST") {
    return response(405, { ok: false, error: "method_not_allowed", fallback: "browser" }, origin);
  }
  const env = options.env ?? process.env;
  const apiKey = env.ELEVENLABS_API_KEY?.trim() ?? "";
  const voiceId = env.ELEVENLABS_VOICE_ID?.trim() ?? "";
  if (!apiKey || !voiceId) {
    return response(
      503,
      { ok: false, error: "voice_not_configured", fallback: "browser" },
      origin
    );
  }
  const text = readText(event);
  if (!text) {
    return response(
      400,
      { ok: false, error: "text_required", fallback: "browser" },
      origin
    );
  }
  if (text.length > MAX_TEXT) {
    return response(
      400,
      { ok: false, error: "text_too_long", fallback: "browser" },
      origin
    );
  }
  const now = options.now ?? Date.now();
  if (!allowRate(`ip:${clientIp}`, now)) {
    return response(
      429,
      { ok: false, error: "rate_limited", fallback: "browser" },
      origin
    );
  }
  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const upstream = await fetchImpl(`${ELEVENLABS_TTS_URL}/${encodeURIComponent(voiceId)}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2"
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    });
    if (!upstream.ok) {
      return response(
        502,
        { ok: false, error: "voice_unavailable", fallback: "browser" },
        origin
      );
    }
    const bytes = new Uint8Array(await upstream.arrayBuffer());
    if (!bytes.byteLength) {
      return response(
        502,
        { ok: false, error: "voice_unavailable", fallback: "browser" },
        origin
      );
    }
    return response(
      200,
      {
        ok: true,
        contentType: "audio/mpeg",
        audioBase64: bytesToBase64(bytes)
      },
      origin
    );
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError" || /timeout/i.test(error.message));
    return response(
      timedOut ? 504 : 502,
      {
        ok: false,
        error: timedOut ? "timeout" : "voice_unavailable",
        fallback: "browser"
      },
      origin
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main,
  resetVoiceRateLimitForTests
});
