/**
 * Same-origin receptionist preview voice.
 * DigitalOcean Functions entry: POST /api/website/voice
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
 * function wraps that PCM in a WAV header and returns audio/wav.
 * A missing key, an upstream error, HTTP 429, or a timeout returns a
 * non-secret status with fallback "browser".
 */

type WebEvent = {
  http?: {
    headers?: Record<string, string>;
    method?: string;
    body?: unknown;
  };
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

function response(
  statusCode: number,
  body: unknown,
  origin = "",
  cacheControl = "no-store",
): { statusCode: number; headers: Record<string, string>; body: unknown } {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": cacheControl,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return { statusCode, headers, body };
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

function readText(event: WebEvent): string {
  if (typeof event.text === "string") return event.text.trim();
  const raw = event.http?.body;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as { text?: unknown };
      if (typeof parsed.text === "string") return parsed.text.trim();
    } catch {
      return "";
    }
  }
  return "";
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

function audioResponse(audioBase64: string, origin: string) {
  return response(
    200,
    { ok: true, contentType: "audio/wav", audioBase64 },
    origin,
    "private, max-age=300",
  );
}

function fallback(statusCode: number, error: string, origin: string) {
  return response(statusCode, { ok: false, error, fallback: "browser" }, origin);
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

export async function main(event: WebEvent = {}, options: VoiceFunctionOptions = {}) {
  const method = event.http?.method?.toUpperCase() ?? "GET";
  const headers = event.http?.headers ?? {};
  const origin = headers.origin ?? headers.Origin ?? "";
  const clientIp =
    (headers["x-forwarded-for"] ?? headers["X-Forwarded-For"] ?? "unknown")
      .split(",")[0]
      ?.trim() || "unknown";

  if (method === "OPTIONS") return response(204, "", origin);
  if (method !== "POST") return fallback(405, "method_not_allowed", origin);

  const env = options.env ?? process.env;
  const apiKey = safeKey(env.GEMINI_API_KEY);
  if (!apiKey) return fallback(503, "voice_not_configured", origin);

  const model = safeName(env.GEMINI_TTS_MODEL, DEFAULT_MODEL);
  const voice = safeName(env.GEMINI_TTS_VOICE, DEFAULT_VOICE);
  if (!model || !voice) return fallback(502, "voice_unavailable", origin);

  const text = readText(event);
  if (!text) return fallback(400, "text_required", origin);
  if (text.length > MAX_TEXT) return fallback(400, "text_too_long", origin);

  const now = options.now ?? Date.now();
  if (!allowRate(`ip:${clientIp}`, now)) return fallback(429, "rate_limited", origin);

  const cacheKey = `${model}\n${voice}\n${text}`;
  const hit = cachedAudio(cacheKey, now);
  if (hit) return audioResponse(hit, origin);

  const endpoint = `${GEMINI_HOST}/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const fetchImpl = options.fetchImpl ?? fetch;
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
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (upstream.status === 429) return fallback(429, "voice_rate_limited", origin);
    if (!upstream.ok) return fallback(502, "voice_unavailable", origin);
    let payload: unknown;
    try {
      payload = await upstream.json();
    } catch {
      return fallback(502, "voice_unavailable", origin);
    }
    const decoded = pcmFromGemini(payload);
    const wav = decoded ? wavFromPcm(decoded.pcm, decoded.mime) : null;
    if (!wav) return fallback(502, "voice_unavailable", origin);
    const audioBase64 = bytesToBase64(wav);
    remember(cacheKey, audioBase64, now);
    return audioResponse(audioBase64, origin);
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError" || /timeout/i.test(error.message));
    return fallback(timedOut ? 504 : 502, timedOut ? "timeout" : "voice_unavailable", origin);
  }
}
