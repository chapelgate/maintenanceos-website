/**
 * Same-origin receptionist preview voice.
 * DigitalOcean Functions entry: POST /api/website/voice
 *
 * ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID are read here only.
 * They are never copied into the response or the static site bundle.
 * A missing key or voice ID returns voice_not_configured so the browser
 * voice can take over.
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
  ELEVENLABS_API_KEY?: string;
  ELEVENLABS_VOICE_ID?: string;
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
const ELEVENLABS_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech";

const rateBuckets = new Map<string, number[]>();

function response(
  statusCode: number,
  body: unknown,
  origin = "",
): { statusCode: number; headers: Record<string, string>; body: unknown } {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
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

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
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
      origin,
    );
  }

  const text = readText(event);
  if (!text) {
    return response(
      400,
      { ok: false, error: "text_required", fallback: "browser" },
      origin,
    );
  }
  if (text.length > MAX_TEXT) {
    return response(
      400,
      { ok: false, error: "text_too_long", fallback: "browser" },
      origin,
    );
  }

  const now = options.now ?? Date.now();
  if (!allowRate(`ip:${clientIp}`, now)) {
    return response(
      429,
      { ok: false, error: "rate_limited", fallback: "browser" },
      origin,
    );
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const upstream = await fetchImpl(`${ELEVENLABS_TTS_URL}/${encodeURIComponent(voiceId)}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!upstream.ok) {
      return response(
        502,
        { ok: false, error: "voice_unavailable", fallback: "browser" },
        origin,
      );
    }
    const bytes = new Uint8Array(await upstream.arrayBuffer());
    if (!bytes.byteLength) {
      return response(
        502,
        { ok: false, error: "voice_unavailable", fallback: "browser" },
        origin,
      );
    }
    return response(
      200,
      {
        ok: true,
        contentType: "audio/mpeg",
        audioBase64: bytesToBase64(bytes),
      },
      origin,
    );
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError" || /timeout/i.test(error.message));
    return response(
      timedOut ? 504 : 502,
      {
        ok: false,
        error: timedOut ? "timeout" : "voice_unavailable",
        fallback: "browser",
      },
      origin,
    );
  }
}
