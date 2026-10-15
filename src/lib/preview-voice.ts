import { browserVoiceSupport, speakBrowserText } from "./browser-voice.ts";

/**
 * Golden-line voice recorded in PRODUCT_CLAIMS_REGISTER.md V-01.
 * Kokoro is a commissioning candidate and is not this name.
 * The website never receives the golden line's credential.
 *
 * The live spoken preview prefers the same-origin voice function, which
 * keeps the provider key and voice ID on the server. This module does not
 * know those values. Browser speech is the fallback.
 */
export const GOLDEN_LINE_VOICE_PROVIDER = "gemini";
export const GOLDEN_LINE_VOICE_NAME = "Gacrux";
export const SERVER_VOICE_ENDPOINT = "/api/website/voice";
export const CONFIGURED_VOICE_NAME = "Theatrical";

let serverVoiceAbsent = false;

export function serverVoiceAttemptable(): boolean {
  return !serverVoiceAbsent;
}

export function resetServerVoiceStateForTests(): void {
  serverVoiceAbsent = false;
}

export type PreviewVoiceMode = "browser" | "preview";

export type PreviewVoiceConfig = {
  mode: PreviewVoiceMode;
  endpoint: string;
  voice: string;
  provider: string;
};

type VoiceEnv = {
  NEXT_PUBLIC_VOICE_PREVIEW_ENDPOINT?: string;
  NEXT_PUBLIC_VOICE_PREVIEW_VOICE?: string;
};

export function previewVoiceConfig(
  env: VoiceEnv = {
    NEXT_PUBLIC_VOICE_PREVIEW_ENDPOINT:
      process.env.NEXT_PUBLIC_VOICE_PREVIEW_ENDPOINT,
    NEXT_PUBLIC_VOICE_PREVIEW_VOICE: process.env.NEXT_PUBLIC_VOICE_PREVIEW_VOICE,
  },
): PreviewVoiceConfig {
  const endpoint = (env.NEXT_PUBLIC_VOICE_PREVIEW_ENDPOINT ?? "").trim();
  const voice =
    (env.NEXT_PUBLIC_VOICE_PREVIEW_VOICE ?? "").trim() || GOLDEN_LINE_VOICE_NAME;
  if (!endpoint) {
    return {
      mode: "browser",
      endpoint: "",
      voice,
      provider: GOLDEN_LINE_VOICE_PROVIDER,
    };
  }
  return {
    mode: "preview",
    endpoint,
    voice,
    provider: GOLDEN_LINE_VOICE_PROVIDER,
  };
}

export function previewVoiceRequestBody(
  text: string,
  config: PreviewVoiceConfig,
): { text: string; voice: string; provider: string } {
  return { text, voice: config.voice, provider: config.provider };
}

let currentAudio: HTMLAudioElement | null = null;

export function stopSpokenPreview(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function decodeBase64(value: string): Uint8Array {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let index = 0; index < bin.length; index += 1) out[index] = bin.charCodeAt(index);
  return out;
}

export type ServerVoiceResult =
  | { ok: true; bytes: Uint8Array; contentType: string }
  | { ok: false; reason: "not_configured" | "unavailable" };

/**
 * Ask the same-origin voice function for audio. The body is only the text.
 */
export async function requestServerVoice(
  text: string,
  options: {
    fetchImpl?: typeof fetch;
    endpoint?: string;
    signal?: AbortSignal;
  } = {},
): Promise<ServerVoiceResult> {
  const endpoint = options.endpoint ?? SERVER_VOICE_ENDPOINT;
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onAbort);
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg, application/json",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    const type = response.headers.get("content-type") ?? "";
    if (response.ok && type.startsWith("audio/")) {
      return {
        ok: true,
        bytes: new Uint8Array(await response.arrayBuffer()),
        contentType: type.split(";")[0]?.trim() || "audio/mpeg",
      };
    }
    const raw = await response.text();
    type ServerVoicePayload = {
      ok?: unknown;
      error?: unknown;
      audioBase64?: unknown;
      contentType?: unknown;
    };
    let parsed: ServerVoicePayload | null = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw) as ServerVoicePayload;
      } catch {
        parsed = null;
      }
    }
    if (
      response.ok &&
      parsed?.ok === true &&
      typeof parsed.audioBase64 === "string" &&
      parsed.audioBase64
    ) {
      return {
        ok: true,
        bytes: decodeBase64(parsed.audioBase64),
        contentType:
          typeof parsed.contentType === "string" && parsed.contentType
            ? parsed.contentType
            : "audio/mpeg",
      };
    }
    if (response.status === 404 || parsed?.error === "voice_not_configured") {
      return { ok: false, reason: "not_configured" };
    }
    return { ok: false, reason: "unavailable" };
  } catch {
    return { ok: false, reason: "unavailable" };
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onAbort);
  }
}

async function playPreviewAudio(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;
  try {
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("preview_audio_failed"));
      void audio.play().catch(reject);
    });
  } finally {
    URL.revokeObjectURL(url);
    if (currentAudio === audio) currentAudio = null;
  }
}

/**
 * Prefer a website-owned Gemini/Gacrux preview when configured.
 * Any failure, including a missing endpoint, uses the browser voice.
 */
export async function speakReceptionistText(
  text: string,
  options: {
    lang?: string;
    rate?: number;
    fetchImpl?: typeof fetch;
    serverEndpoint?: string;
    playAudio?: (bytes: Uint8Array, contentType: string) => Promise<void>;
  } = {},
): Promise<"browser" | "preview" | "unavailable"> {
  const serverEndpoint = options.serverEndpoint ?? SERVER_VOICE_ENDPOINT;
  if (serverEndpoint && serverVoiceAttemptable()) {
    const server = await requestServerVoice(text, {
      fetchImpl: options.fetchImpl,
      endpoint: serverEndpoint,
    });
    if (server.ok) {
      serverVoiceAbsent = false;
      try {
        if (options.playAudio) await options.playAudio(server.bytes, server.contentType);
        else {
          const audioBytes = server.bytes.buffer.slice(
            server.bytes.byteOffset,
            server.bytes.byteOffset + server.bytes.byteLength,
          ) as ArrayBuffer;
          await playPreviewAudio(new Blob([audioBytes], { type: server.contentType }));
        }
        return "preview";
      } catch {
        // Playback failed. The browser voice is still available.
      }
    } else if (server.reason === "not_configured") {
      serverVoiceAbsent = true;
    }
  }

  const config = previewVoiceConfig();
  if (config.mode === "preview") {
    try {
      const fetchImpl = options.fetchImpl ?? fetch;
      const response = await fetchImpl(config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/*",
        },
        body: JSON.stringify(previewVoiceRequestBody(text, config)),
      });
      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || !type.startsWith("audio/")) {
        throw new Error("preview_unavailable");
      }
      await playPreviewAudio(await response.blob());
      return "preview";
    } catch {
      // Browser voice remains the fail-safe. Do not surface provider errors.
    }
  }

  if (!browserVoiceSupport().synthesis) return "unavailable";
  await speakBrowserText(text, options);
  return "browser";
}
