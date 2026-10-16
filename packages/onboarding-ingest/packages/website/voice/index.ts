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
 * Only a spoken line returns audio/wav. GET reports whether a key is present.
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
  __ow_isBase64Encoded?: boolean;
  isBase64Encoded?: boolean;
  text?: unknown;
};

type VoiceEnv = {
  GEMINI_API_KEY?: string;
  GEMINI_TTS_MODEL?: string;
  GEMINI_TTS_VOICE?: string;
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
const CACHE_TTL_MS = 10 * 60_000;
const CACHE_MAX = 32;
const PCM_RATE = 24_000;
const DEFAULT_MODEL = "gemini-2.5-flash-preview-tts";
const DEFAULT_VOICE = "Charon";
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/;
const GEMINI_HOST = "https://generativelanguage.googleapis.com";

const rateBuckets = new Map<string, number[]>();
const audioCache = new Map<string, { audioBase64: string; at: number }>();

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

function audioResponse(audioBase64: string, origin: string): WebActionResponse {
  return {
    statusCode: 200,
    headers: responseHeaders(origin, "audio/wav", "private, max-age=300"),
    body: audioBase64,
  };
}

function fallback(reason: string, origin: string): WebActionResponse {
  return jsonResponse(200, { ok: false, fallback: "browser", reason }, origin);
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

function safeKey(value: string | undefined): string {
  const key = value?.trim() ?? "";
  if (!key || /[\r\n\0]/.test(key)) return "";
  return key;
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

function remember(key: string, audioBase64: string, now: number): void {
  audioCache.set(key, { audioBase64, at: now });
  while (audioCache.size > CACHE_MAX) {
    const oldest = audioCache.keys().next().value;
    if (oldest === undefined) break;
    audioCache.delete(oldest);
  }
}

function cachedAudio(key: string, now: number): string | null {
  const hit = audioCache.get(key);
  if (!hit) return null;
  if (now - hit.at > CACHE_TTL_MS) {
    audioCache.delete(key);
    return null;
  }
  return hit.audioBase64;
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

  const env = options.env ?? process.env;
  if (method === "GET") {
    const model = safeName(env.GEMINI_TTS_MODEL, DEFAULT_MODEL) ?? DEFAULT_MODEL;
    const voice = safeName(env.GEMINI_TTS_VOICE, DEFAULT_VOICE) ?? DEFAULT_VOICE;
    return jsonResponse(200, {
      ok: true,
      configured: Boolean(safeKey(env.GEMINI_API_KEY)),
      model,
      voice,
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

  const cacheKey = `${model}\n${voice}\n${text}`;
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
    if (!upstream.ok) return fallback(upstreamReason(upstream.status), origin);
    let payload: unknown;
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
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError" || /timeout/i.test(error.message));
    return fallback(timedOut ? "upstream_timeout" : "internal_error", origin);
  } finally {
    clearTimeout(timer);
  }
}

export async function main(event: WebEvent = {}, options: VoiceFunctionOptions = {}): Promise<WebActionResponse> {
  try {
    return await handleVoice(event, options);
  } catch {
    return jsonResponse(200, { ok: false, fallback: "browser", reason: "internal_error" });
  }
}
