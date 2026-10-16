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
  pcm16ToWav: () => pcm16ToWav,
  resetVoiceRateLimitForTests: () => resetVoiceRateLimitForTests
});
module.exports = __toCommonJS(index_exports);
var MAX_TEXT = 400;
var RATE_WINDOW_MS = 6e4;
var RATE_MAX = 6;
var UPSTREAM_TIMEOUT_MS = 2e4;
var CACHE_TTL_MS = 10 * 6e4;
var CACHE_MAX = 32;
var PCM_RATE = 24e3;
var DEFAULT_MODEL = "gemini-2.5-flash-preview-tts";
var DEFAULT_VOICE = "Charon";
var NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/;
var GEMINI_HOST = "https://generativelanguage.googleapis.com";
var rateBuckets = /* @__PURE__ */ new Map();
var audioCache = /* @__PURE__ */ new Map();
function responseHeaders(origin, contentType, cacheControl) {
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept"
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}
function jsonResponse(statusCode, payload, origin = "", cacheControl = "no-store") {
  return {
    statusCode,
    headers: responseHeaders(origin, "application/json", cacheControl),
    body: JSON.stringify(payload)
  };
}
function audioResponse(audioBase64, origin) {
  return {
    statusCode: 200,
    headers: responseHeaders(origin, "audio/wav", "private, max-age=300"),
    body: audioBase64
  };
}
function fallback(reason, origin) {
  return jsonResponse(200, { ok: false, fallback: "browser", reason }, origin);
}
function upstreamReason(status) {
  const code = Number.isInteger(status) && status >= 100 && status <= 599 ? String(status) : "error";
  return `upstream_${code}`;
}
function headerString(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => headerString(item)).filter(Boolean).join(",");
  return "";
}
function headersOf(event) {
  const headers = event.http?.headers ?? event.__ow_headers;
  if (!headers || typeof headers !== "object" || Array.isArray(headers)) return {};
  return headers;
}
function firstHeader(headers, name) {
  const value = headers[name] ?? headers[name.toLowerCase()];
  const picked = Array.isArray(value) ? value[0] : value;
  return headerString(picked).replace(/[\r\n]/g, "");
}
function clientIp(headers) {
  const forwarded = headerString(headers["x-forwarded-for"] ?? headers["X-Forwarded-For"]);
  return forwarded.split(",")[0]?.trim() || "unknown";
}
function methodOf(event) {
  const raw = event.http?.method ?? event.__ow_method;
  return typeof raw === "string" && raw.trim() ? raw.trim().toUpperCase() : "GET";
}
function textFromValue(value, encoded) {
  if (typeof value === "string") {
    const source = encoded ? Buffer.from(value, "base64").toString("utf8") : value;
    if (!source.trim()) return "";
    try {
      const parsed = JSON.parse(source);
      return typeof parsed?.text === "string" ? parsed.text.trim() : "";
    } catch {
      return "";
    }
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const text = value.text;
    return typeof text === "string" ? text.trim() : "";
  }
  return "";
}
function readText(event) {
  if (typeof event.text === "string" && event.text.trim()) return event.text.trim();
  const httpEncoded = Boolean(event.http?.isBase64Encoded || event.isBase64Encoded);
  const fromHttp = textFromValue(event.http?.body, httpEncoded);
  if (fromHttp) return fromHttp;
  return textFromValue(event.__ow_body, Boolean(event.__ow_isBase64Encoded || event.isBase64Encoded));
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
  audioCache.clear();
}
function safeName(value, fallback2) {
  const name = value?.trim() || fallback2;
  return NAME_RE.test(name) ? name : null;
}
function safeKey(value) {
  const key = value?.trim() ?? "";
  if (!key || /[\r\n\0]/.test(key)) return "";
  return key;
}
function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}
function pcm16ToWav(pcm, sampleRate = PCM_RATE) {
  const samples = pcm.byteLength % 2 === 0 ? pcm : Buffer.concat([pcm, Buffer.from([0])]);
  const dataSize = samples.byteLength;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataSize, 40);
  Buffer.from(samples).copy(buffer, 44);
  return buffer;
}
function remember(key, audioBase64, now) {
  audioCache.set(key, { audioBase64, at: now });
  while (audioCache.size > CACHE_MAX) {
    const oldest = audioCache.keys().next().value;
    if (oldest === void 0) break;
    audioCache.delete(oldest);
  }
}
function cachedAudio(key, now) {
  const hit = audioCache.get(key);
  if (!hit) return null;
  if (now - hit.at > CACHE_TTL_MS) {
    audioCache.delete(key);
    return null;
  }
  return hit.audioBase64;
}
function pcmFromGemini(payload) {
  if (!payload || typeof payload !== "object") return null;
  const candidates = payload.candidates;
  if (!Array.isArray(candidates)) return null;
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const parts = candidate.content?.parts;
    if (!Array.isArray(parts)) continue;
    for (const part of parts) {
      const inline = part.inlineData ?? part.inline_data;
      const data = inline?.data;
      if (typeof data !== "string" || !data) continue;
      const mime = typeof part.inlineData?.mimeType === "string" && part.inlineData.mimeType || typeof part.inline_data?.mime_type === "string" && part.inline_data.mime_type || "";
      return { pcm: Buffer.from(data, "base64"), mime };
    }
  }
  return null;
}
function wavFromPcm(pcm, mime) {
  if (!pcm.byteLength) return null;
  if (pcm.subarray(0, 4).toString("ascii") === "RIFF") return pcm;
  const rateMatch = /rate=(\d+)/i.exec(mime);
  const rate = rateMatch ? Number(rateMatch[1]) : PCM_RATE;
  const sampleRate = Number.isInteger(rate) && rate >= 8e3 && rate <= 48e3 ? rate : PCM_RATE;
  return pcm16ToWav(pcm, sampleRate);
}
async function handleVoice(event, options) {
  const method = methodOf(event);
  const headers = headersOf(event);
  const origin = firstHeader(headers, "origin");
  const ip = clientIp(headers);
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: responseHeaders(origin, "text/plain", "no-store"),
      body: ""
    };
  }
  const env = options.env ?? process.env;
  if (method === "GET") {
    const model2 = safeName(env.GEMINI_TTS_MODEL, DEFAULT_MODEL) ?? DEFAULT_MODEL;
    const voice2 = safeName(env.GEMINI_TTS_VOICE, DEFAULT_VOICE) ?? DEFAULT_VOICE;
    return jsonResponse(200, {
      ok: true,
      configured: Boolean(safeKey(env.GEMINI_API_KEY)),
      model: model2,
      voice: voice2
    }, origin);
  }
  if (method !== "POST") return fallback("method_not_allowed", origin);
  const apiKey = safeKey(env.GEMINI_API_KEY);
  if (!apiKey) return fallback("voice_not_configured", origin);
  const model = safeName(env.GEMINI_TTS_MODEL, DEFAULT_MODEL);
  const voice = safeName(env.GEMINI_TTS_VOICE, DEFAULT_VOICE);
  if (!model || !voice) return fallback("internal_error", origin);
  const text = readText(event);
  if (!text) return fallback("text_missing", origin);
  if (text.length > MAX_TEXT) return fallback("text_too_long", origin);
  const now = options.now ?? Date.now();
  if (!allowRate(`ip:${ip}`, now)) return fallback("rate_limited", origin);
  const cacheKey = `${model}
${voice}
${text}`;
  const hit = cachedAudio(cacheKey, now);
  if (hit) return audioResponse(hit, origin);
  const endpoint = `${GEMINI_HOST}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") return fallback("internal_error", origin);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice }
            }
          }
        }
      }),
      signal: controller.signal
    });
    if (!upstream.ok) return fallback(upstreamReason(upstream.status), origin);
    let payload;
    try {
      payload = await upstream.json();
    } catch {
      return fallback("upstream_no_audio", origin);
    }
    const decoded = pcmFromGemini(payload);
    const wav = decoded ? wavFromPcm(decoded.pcm, decoded.mime) : null;
    if (!wav) return fallback("upstream_no_audio", origin);
    const audioBase64 = bytesToBase64(wav);
    remember(cacheKey, audioBase64, now);
    return audioResponse(audioBase64, origin);
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError" || /timeout/i.test(error.message));
    return fallback(timedOut ? "upstream_timeout" : "internal_error", origin);
  } finally {
    clearTimeout(timer);
  }
}
async function main(event = {}, options = {}) {
  try {
    return await handleVoice(event, options);
  } catch {
    return jsonResponse(200, { ok: false, fallback: "browser", reason: "internal_error" });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main,
  pcm16ToWav,
  resetVoiceRateLimitForTests
});
