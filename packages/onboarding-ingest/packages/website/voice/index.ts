import { createHash } from "node:crypto";

/**
 * Same-origin receptionist preview voice.
 * DigitalOcean Functions entry: POST /api/website/voice → /website/voice
 *
 * Speech comes from the Gemini generateContent TTS endpoint.
 * GEMINI_API_KEY is read here only, sent in the x-goog-api-key header,
 * and never placed in a URL, a log line, or the response.
 * GEMINI_TTS_MODEL overrides the model. GEMINI_TTS_VOICE overrides the voice.
 *
 * Default voice is Charon. Google lists Charon as Informative: a lower,
 * steady prebuilt voice for a short receptionist line. Algenib is the
 * gravelly alternative (set GEMINI_TTS_VOICE=Algenib). The page still
 * calls the voice Theatrical. The browser never receives the key.
 *
 * Gemini 2.5 Flash TTS returns base64 16-bit PCM, mono, 24 kHz. This
 * function wraps that PCM in a WAV and returns it as a web-action binary
 * body: Content-Type audio/wav and a base64 string. DigitalOcean decodes
 * that string because audio/wav is a binary media type. isBase64Encoded is
 * a request flag (raw HTTP), not a response field.
 * JSON fallbacks use a string body so the gateway does not have to guess.
 * DigitalOcean replaces every 5xx body with its own HTML 504 page
 * (x-do-orig-status shows the function status). Failures therefore stay
 * HTTP 200: { ok:false, fallback:"browser", reason } with a non-secret code.
 * Only a spoken line returns audio/wav. GET reports whether a key is present
 * and non-secret diagnostics. It never returns the key.
 *
 * The key is any non-empty trimmed string. AIza and AQ. keys both go in
 * the x-goog-api-key header. Nothing is read into a module-level const:
 * process.env is read when the request runs, then action parameters.
 */

type HeaderValue = string | string[] | number | boolean | null | undefined;

type WebEvent = {
  http?: {
    headers?: Record<string, HeaderValue>;
    method?: string;
    body?: unknown;
    isBase64Encoded?: boolean;
  };
  __ow_method?: unknown;
  __ow_headers?: Record<string, HeaderValue>;
  __ow_body?: unknown;
  __ow_params?: unknown;
  __ow_isBase64Encoded?: boolean;
  params?: unknown;
  isBase64Encoded?: boolean;
  text?: unknown;
};

type VoiceEnv = {
  GEMINI_API_KEY?: string;
  GEMINI_TTS_MODEL?: string;
  GEMINI_TTS_VOICE?: string;
  PIPER_TTS_URL?: string;
  PIPER_TTS_SECRET?: string;
};

export type VoiceFunctionOptions = {
  fetchImpl?: typeof fetch;
  env?: VoiceEnv;
  now?: number;
};

type WebActionResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const MAX_TEXT = 400;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 6;
const UPSTREAM_TIMEOUT_MS = 20_000;
const PIPER_TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 10 * 60_000;
const CACHE_MAX = 32;
const PCM_RATE = 24_000;
const DEFAULT_MODEL = "gemini-2.5-flash-preview-tts";
const DEFAULT_VOICE = "Charon";
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/;
const GEMINI_HOST = "https://generativelanguage.googleapis.com";

type SpokenEngine = "gemini" | "piper";

const rateBuckets = new Map<string, number[]>();
const audioCache = new Map<string, { audioBase64: string; engine: SpokenEngine; at: number }>();

function responseHeaders(origin: string, contentType: string, cacheControl: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function jsonResponse(
  statusCode: number,
  payload: Record<string, unknown>,
  origin = "",
  cacheControl = "no-store",
): WebActionResponse {
  return {
    statusCode,
    headers: responseHeaders(origin, "application/json", cacheControl),
    body: JSON.stringify(payload),
  };
}

function audioResponse(audioBase64: string, origin: string, engine: SpokenEngine): WebActionResponse {
  return {
    statusCode: 200,
    headers: {
      ...responseHeaders(origin, "audio/wav", "private, max-age=300"),
      "X-Voice-Engine": engine,
    },
    body: audioBase64,
  };
}

function fallback(reason: string, origin: string): WebActionResponse {
  return jsonResponse(200, { ok: false, fallback: "browser", engine: "browser", reason }, origin);
}

function upstreamReason(status: number): string {
  const code = Number.isInteger(status) && status >= 100 && status <= 599 ? String(status) : "error";
  return `upstream_${code}`;
}

function headerString(value: HeaderValue): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => headerString(item)).filter(Boolean).join(",");
  return "";
}

function headersOf(event: WebEvent): Record<string, HeaderValue> {
  const headers = event.http?.headers ?? event.__ow_headers;
  if (!headers || typeof headers !== "object" || Array.isArray(headers)) return {};
  return headers;
}

function firstHeader(headers: Record<string, HeaderValue>, name: string): string {
  const value = headers[name] ?? headers[name.toLowerCase()];
  const picked = Array.isArray(value) ? value[0] : value;
  return headerString(picked).replace(/[\r\n]/g, "");
}

function clientIp(headers: Record<string, HeaderValue>): string {
  const forwarded = headerString(headers["x-forwarded-for"] ?? headers["X-Forwarded-For"]);
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function methodOf(event: WebEvent): string {
  const raw = event.http?.method ?? event.__ow_method;
  return typeof raw === "string" && raw.trim() ? raw.trim().toUpperCase() : "GET";
}

function textFromValue(value: unknown, encoded: boolean): string {
  if (typeof value === "string") {
    const source = encoded ? Buffer.from(value, "base64").toString("utf8") : value;
    if (!source.trim()) return "";
    try {
      const parsed = JSON.parse(source) as { text?: unknown };
      return typeof parsed?.text === "string" ? parsed.text.trim() : "";
    } catch {
      return "";
    }
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const text = (value as { text?: unknown }).text;
    return typeof text === "string" ? text.trim() : "";
  }
  return "";
}

function readText(event: WebEvent): string {
  if (typeof event.text === "string" && event.text.trim()) return event.text.trim();
  const httpEncoded = Boolean(event.http?.isBase64Encoded || event.isBase64Encoded);
  const fromHttp = textFromValue(event.http?.body, httpEncoded);
  if (fromHttp) return fromHttp;
  return textFromValue(event.__ow_body, Boolean(event.__ow_isBase64Encoded || event.isBase64Encoded));
}

function allowRate(key: string, now: number): boolean {
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

export function resetVoiceRateLimitForTests(): void {
  rateBuckets.clear();
  audioCache.clear();
}

function safeName(value: string | undefined, fallback: string): string | null {
  const name = value?.trim() || fallback;
  return NAME_RE.test(name) ? name : null;
}

/** Any non-empty trimmed string. Line breaks are removed so the header stays one line. */
function safeKey(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\0]/g, "").trim();
}

function keyPrefixKind(key: string): "AIza" | "AQ." | "other" {
  if (key.startsWith("AIza")) return "AIza";
  if (key.startsWith("AQ.")) return "AQ.";
  return "other";
}

function stringParam(source: unknown, name: string): string | undefined {
  if (!source || typeof source !== "object" || Array.isArray(source)) return undefined;
  const value = (source as Record<string, unknown>)[name];
  return typeof value === "string" ? value : undefined;
}

function paramValue(event: WebEvent, name: string): string | undefined {
  return stringParam(event.__ow_params, name) ?? stringParam(event.params, name) ?? stringParam(event, name);
}

function setting(event: WebEvent, options: VoiceFunctionOptions, name: keyof VoiceEnv): string | undefined {
  if (options.env) return options.env[name];
  const fromProcess = process.env[name];
  if (typeof fromProcess === "string" && safeKey(fromProcess)) return fromProcess;
  return paramValue(event, name) ?? (typeof fromProcess === "string" ? fromProcess : undefined);
}

function deployedBuild(): string | null {
  for (const name of ["COMMIT_HASH", "GIT_COMMIT", "SOURCE_COMMIT", "GITHUB_SHA"]) {
    const value = process.env[name]?.trim() ?? "";
    if (/^[0-9a-f]{7,64}$/i.test(value)) return value;
  }
  return null;
}

const ENV_NAME_PREFIXES = ["GEMINI_", "PIPER_", "ONBOARDING_", "SCAN_", "COMMIT", "GIT", "SOURCE", "__OW", "DO_"];

/** Key names only. Values never leave the function. */
function envDiagnostics(): { envNames: string[]; envCount: number } {
  const names = Object.keys(process.env);
  const envNames = names
    .filter((name) => ENV_NAME_PREFIXES.some((prefix) => name.startsWith(prefix)))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return { envNames, envCount: names.length };
}

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

/** 16-bit little-endian PCM, mono, to a 44-byte canonical WAV. */
export function pcm16ToWav(pcm: Uint8Array, sampleRate = PCM_RATE): Uint8Array {
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

function textCacheKey(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function remember(key: string, audioBase64: string, engine: SpokenEngine, now: number): void {
  audioCache.set(key, { audioBase64, engine, at: now });
  while (audioCache.size > CACHE_MAX) {
    const oldest = audioCache.keys().next().value;
    if (oldest === undefined) break;
    audioCache.delete(oldest);
  }
}

function cachedAudio(key: string, now: number): { audioBase64: string; engine: SpokenEngine } | null {
  const hit = audioCache.get(key);
  if (!hit) return null;
  if (now - hit.at > CACHE_TTL_MS) {
    audioCache.delete(key);
    return null;
  }
  return { audioBase64: hit.audioBase64, engine: hit.engine };
}

function piperTarget(
  event: WebEvent,
  options: VoiceFunctionOptions,
): { url: string; secret: string } | null {
  const raw = setting(event, options, "PIPER_TTS_URL")?.trim() ?? "";
  const secret = safeKey(setting(event, options, "PIPER_TTS_SECRET"));
  if (!raw || !secret) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  return { url: url.toString(), secret };
}

type GeminiPart = {
  inlineData?: { data?: unknown; mimeType?: unknown };
  inline_data?: { data?: unknown; mime_type?: unknown };
};

function pcmFromGemini(payload: unknown): { pcm: Buffer; mime: string } | null {
  if (!payload || typeof payload !== "object") return null;
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) return null;
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const parts = (candidate as { content?: { parts?: unknown } }).content?.parts;
    if (!Array.isArray(parts)) continue;
    for (const part of parts as GeminiPart[]) {
      const inline = part.inlineData ?? part.inline_data;
      const data = inline?.data;
      if (typeof data !== "string" || !data) continue;
      const mime =
        (typeof part.inlineData?.mimeType === "string" && part.inlineData.mimeType) ||
        (typeof part.inline_data?.mime_type === "string" && part.inline_data.mime_type) ||
        "";
      return { pcm: Buffer.from(data, "base64"), mime };
    }
  }
  return null;
}

function wavFromPcm(pcm: Buffer, mime: string): Uint8Array | null {
  if (!pcm.byteLength) return null;
  if (pcm.subarray(0, 4).toString("ascii") === "RIFF") return pcm;
  const rateMatch = /rate=(\d+)/i.exec(mime);
  const rate = rateMatch ? Number(rateMatch[1]) : PCM_RATE;
  const sampleRate = Number.isInteger(rate) && rate >= 8000 && rate <= 48000 ? rate : PCM_RATE;
  return pcm16ToWav(pcm, sampleRate);
}

async function handleVoice(event: WebEvent, options: VoiceFunctionOptions): Promise<WebActionResponse> {
  const method = methodOf(event);
  const headers = headersOf(event);
  const origin = firstHeader(headers, "origin");
  const ip = clientIp(headers);

  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: responseHeaders(origin, "text/plain", "no-store"),
      body: "",
    };
  }

  const apiKey = safeKey(setting(event, options, "GEMINI_API_KEY"));
  const modelSetting = setting(event, options, "GEMINI_TTS_MODEL");
  const voiceSetting = setting(event, options, "GEMINI_TTS_VOICE");
  if (method === "GET") {
    const model = safeName(modelSetting, DEFAULT_MODEL) ?? DEFAULT_MODEL;
    const voice = safeName(voiceSetting, DEFAULT_VOICE) ?? DEFAULT_VOICE;
    return jsonResponse(200, {
      ok: true,
      configured: Boolean(apiKey),
      keyPresent: Boolean(apiKey),
      keyLength: apiKey.length,
      keyPrefixKind: keyPrefixKind(apiKey),
      model,
      voice,
      build: deployedBuild(),
      ...envDiagnostics(),
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
      piper ? 12_000 : UPSTREAM_TIMEOUT_MS,
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

async function geminiWav(
  text: string,
  model: string,
  voice: string,
  apiKey: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<{ wav: Uint8Array } | { reason: string }> {
  const endpoint = `${GEMINI_HOST}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const upstream = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      }),
      signal: controller.signal,
    });
    if (!upstream.ok) return { reason: upstreamReason(upstream.status) };
    let payload: unknown;
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
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError" || /timeout/i.test(error.message));
    return { reason: timedOut ? "upstream_timeout" : "internal_error" };
  } finally {
    clearTimeout(timer);
  }
}

async function piperWav(
  text: string,
  piper: { url: string; secret: string },
  fetchImpl: typeof fetch,
): Promise<Uint8Array | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PIPER_TIMEOUT_MS);
  try {
    const upstream = await fetchImpl(piper.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${piper.secret}`,
        "Content-Type": "application/json",
        Accept: "audio/wav",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
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

export async function main(event: WebEvent = {}, options: VoiceFunctionOptions = {}): Promise<WebActionResponse> {
  try {
    return await handleVoice(event, options);
  } catch {
    return jsonResponse(200, { ok: false, fallback: "browser", engine: "browser", reason: "internal_error" });
  }
}
