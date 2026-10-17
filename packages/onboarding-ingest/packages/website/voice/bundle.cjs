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
var import_node_crypto = require("node:crypto");
var MAX_TEXT = 400;
var RATE_WINDOW_MS = 6e4;
var RATE_MAX = 6;
var UPSTREAM_TIMEOUT_MS = 2e4;
var PIPER_TIMEOUT_MS = 8e3;
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
function audioResponse(audioBase64, origin, engine) {
  return {
    statusCode: 200,
    headers: {
      ...responseHeaders(origin, "audio/wav", "private, max-age=300"),
      "X-Voice-Engine": engine
    },
    body: audioBase64
  };
}
function fallback(reason, origin) {
  return jsonResponse(200, { ok: false, fallback: "browser", engine: "browser", reason }, origin);
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
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\0]/g, "").trim();
}
function keyPrefixKind(key) {
  if (key.startsWith("AIza")) return "AIza";
  if (key.startsWith("AQ.")) return "AQ.";
  return "other";
}
function stringParam(source, name) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return void 0;
  const value = source[name];
  return typeof value === "string" ? value : void 0;
}
function paramValue(event, name) {
  return stringParam(event.__ow_params, name) ?? stringParam(event.params, name) ?? stringParam(event, name);
}
function setting(event, options, name) {
  if (options.env) return options.env[name];
  const fromProcess = process.env[name];
  if (typeof fromProcess === "string" && safeKey(fromProcess)) return fromProcess;
  return paramValue(event, name) ?? (typeof fromProcess === "string" ? fromProcess : void 0);
}
function deployedBuild() {
  for (const name of ["COMMIT_HASH", "GIT_COMMIT", "SOURCE_COMMIT", "GITHUB_SHA"]) {
    const value = process.env[name]?.trim() ?? "";
    if (/^[0-9a-f]{7,64}$/i.test(value)) return value;
  }
  return null;
}
var ENV_NAME_PREFIXES = ["GEMINI_", "PIPER_", "ONBOARDING_", "SCAN_", "COMMIT", "GIT", "SOURCE", "__OW", "DO_"];
function envDiagnostics() {
  const names = Object.keys(process.env);
  const envNames = names.filter((name) => ENV_NAME_PREFIXES.some((prefix) => name.startsWith(prefix))).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  return { envNames, envCount: names.length };
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
function textCacheKey(text) {
  return (0, import_node_crypto.createHash)("sha256").update(text, "utf8").digest("hex");
}
function remember(key, audioBase64, engine, now) {
  audioCache.set(key, { audioBase64, engine, at: now });
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
  return { audioBase64: hit.audioBase64, engine: hit.engine };
}
function piperTarget(event, options) {
  const raw = setting(event, options, "PIPER_TTS_URL")?.trim() ?? "";
  const secret = safeKey(setting(event, options, "PIPER_TTS_SECRET"));
  if (!raw || !secret) return null;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  return { url: url.toString(), secret };
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
  const apiKey = safeKey(setting(event, options, "GEMINI_API_KEY"));
  const modelSetting = setting(event, options, "GEMINI_TTS_MODEL");
  const voiceSetting = setting(event, options, "GEMINI_TTS_VOICE");
  if (method === "GET") {
    const model2 = safeName(modelSetting, DEFAULT_MODEL) ?? DEFAULT_MODEL;
    const voice2 = safeName(voiceSetting, DEFAULT_VOICE) ?? DEFAULT_VOICE;
    return jsonResponse(200, {
      ok: true,
      configured: Boolean(apiKey),
      keyPresent: Boolean(apiKey),
      keyLength: apiKey.length,
      keyPrefixKind: keyPrefixKind(apiKey),
      model: model2,
      voice: voice2,
      build: deployedBuild(),
      ...envDiagnostics()
    }, origin);
  }
  if (method !== "POST") return fallback("method_not_allowed", origin);
  const piper = piperTarget(event, options);
  if (!apiKey && !piper) return fallback("voice_not_configured", origin);
  const model = safeName(modelSetting, DEFAULT_MODEL);
  const voice = safeName(voiceSetting, DEFAULT_VOICE);
  if (apiKey && (!model || !voice)) return fallback("internal_error", origin);
  const text = readText(event);
  if (!text) return fallback("text_missing", origin);
  if (text.length > MAX_TEXT) return fallback("text_too_long", origin);
  const now = options.now ?? Date.now();
  if (!allowRate(`ip:${ip}`, now)) return fallback("rate_limited", origin);
  const cacheKey = textCacheKey(text);
  const hit = cachedAudio(cacheKey, now);
  if (hit) return audioResponse(hit.audioBase64, origin, hit.engine);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") return fallback("internal_error", origin);
  let geminiReason = "voice_not_configured";
  if (apiKey && model && voice) {
    const spoken = await geminiWav(
      text,
      model,
      voice,
      apiKey,
      fetchImpl,
      piper ? 12e3 : UPSTREAM_TIMEOUT_MS
    );
    if ("wav" in spoken) {
      const audioBase64 = bytesToBase64(spoken.wav);
      remember(cacheKey, audioBase64, "gemini", now);
      return audioResponse(audioBase64, origin, "gemini");
    }
    geminiReason = spoken.reason;
  }
  if (piper) {
    const wav = await piperWav(text, piper, fetchImpl);
    if (wav) {
      const audioBase64 = bytesToBase64(wav);
      remember(cacheKey, audioBase64, "piper", now);
      return audioResponse(audioBase64, origin, "piper");
    }
    return fallback("piper_unavailable", origin);
  }
  return fallback(geminiReason, origin);
}
async function geminiWav(text, model, voice, apiKey, fetchImpl, timeoutMs) {
  const endpoint = `${GEMINI_HOST}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
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
    if (!upstream.ok) return { reason: upstreamReason(upstream.status) };
    let payload;
    try {
      payload = await upstream.json();
    } catch {
      return { reason: "upstream_no_audio" };
    }
    const decoded = pcmFromGemini(payload);
    const wav = decoded ? wavFromPcm(decoded.pcm, decoded.mime) : null;
    if (!wav) return { reason: "upstream_no_audio" };
    return { wav };
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError" || /timeout/i.test(error.message));
    return { reason: timedOut ? "upstream_timeout" : "internal_error" };
  } finally {
    clearTimeout(timer);
  }
}
async function piperWav(text, piper, fetchImpl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PIPER_TIMEOUT_MS);
  try {
    const upstream = await fetchImpl(piper.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${piper.secret}`,
        "Content-Type": "application/json",
        Accept: "audio/wav"
      },
      body: JSON.stringify({ text }),
      signal: controller.signal
    });
    if (!upstream.ok) return null;
    const type = upstream.headers.get("content-type") ?? "";
    if (!type.startsWith("audio/")) return null;
    const bytes = new Uint8Array(await upstream.arrayBuffer());
    if (Buffer.from(bytes.subarray(0, 4)).toString("ascii") !== "RIFF") return null;
    return bytes;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
async function main(event = {}, options = {}) {
  try {
    return await handleVoice(event, options);
  } catch {
    return jsonResponse(200, { ok: false, fallback: "browser", engine: "browser", reason: "internal_error" });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main,
  pcm16ToWav,
  resetVoiceRateLimitForTests
});
