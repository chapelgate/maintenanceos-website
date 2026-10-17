import { browserVoiceSupport, speakBrowserText } from "./browser-voice.ts";

/**
 * Golden-line voice recorded in PRODUCT_CLAIMS_REGISTER.md V-01.
 * Kokoro is a commissioning candidate and is not this name.
 * The website never receives the golden line's credential.
 *
 * The live spoken preview prefers the same-origin voice function, which
 * keeps the Gemini key on the server. This module does not know that key.
 * Browser speech is the fallback when the function is not configured,
 * rate limited, timed out, or otherwise unavailable.
 */
export const GOLDEN_LINE_VOICE_PROVIDER = "gemini";
export const GOLDEN_LINE_VOICE_NAME = "Gacrux";
export const SERVER_VOICE_ENDPOINT = "/api/website/voice";
export const CONFIGURED_VOICE_NAME = "Theatrical";

let serverVoiceAbsent = false;

export function serverVoiceAttemptable(): boolean {
  return !serverVoiceAbsent;
}

type UnlockableAudio = {
  src: string;
  pause(): void;
  play(): Promise<void>;
  onended: ((event?: unknown) => void) | null;
  onerror: ((event?: unknown) => void) | null;
};

type DecodedBuffer = object;

type UnlockableBufferSource = {
  buffer: DecodedBuffer | null;
  connect(destination: unknown): void;
  start(when?: number): void;
  stop?(when?: number): void;
  onended: ((event?: unknown) => void) | null;
};

type UnlockableContext = {
  resume(): Promise<void>;
  state?: string;
  destination?: unknown;
  decodeAudioData?(
    bytes: ArrayBuffer,
    success?: (buffer: DecodedBuffer) => void,
    failure?: (error: unknown) => void,
  ): Promise<DecodedBuffer> | void;
  createBufferSource?(): UnlockableBufferSource;
};

export type SpokenAudioHost = {
  Audio: new () => UnlockableAudio;
  AudioContext?: new () => UnlockableContext;
  webkitAudioContext?: new () => UnlockableContext;
};

let primedAudio: UnlockableAudio | null = null;
let primedContext: UnlockableContext | null = null;
let currentSource: UnlockableBufferSource | null = null;
let currentAudio: HTMLAudioElement | null = null;

export function resetServerVoiceStateForTests(): void {
  serverVoiceAbsent = false;
  primedAudio = null;
  primedContext = null;
  currentSource = null;
  currentAudio = null;
}

function warnVoice(reason: string): void {
  console.warn(`Gemini voice unavailable: ${reason}`);
}

export function unlockSpokenAudioOn(host: SpokenAudioHost): UnlockableAudio {
  serverVoiceAbsent = false;
  const audio = primedAudio ?? new host.Audio();
  primedAudio = audio;
  const Context = host.AudioContext ?? host.webkitAudioContext;
  if (Context) {
    primedContext = primedContext ?? new Context();
    void primedContext.resume().catch(() => undefined);
  }
  return audio;
}

export function unlockSpokenAudio(): void {
  if (typeof window === "undefined") return;
  const host = window as unknown as SpokenAudioHost;
  if (typeof host.Audio !== "function") return;
  unlockSpokenAudioOn(host);
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

function stopPrimedSource(): void {
  const source = currentSource;
  currentSource = null;
  if (!source?.stop) return;
  try {
    source.stop();
  } catch {
    return;
  }
}

export function stopSpokenPreview(): void {
  stopPrimedSource();
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
  | { ok: false; reason: "not_configured" | "unavailable" | "timeout" };

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
        Accept: "audio/wav, application/json",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    const type = response.headers.get("content-type") ?? "";
    if (response.ok && type.startsWith("audio/")) {
      return {
        ok: true,
        bytes: new Uint8Array(await response.arrayBuffer()),
        contentType: type.split(";")[0]?.trim() || "audio/wav",
      };
    }
    const raw = await response.text();
    type ServerVoicePayload = {
      ok?: unknown;
      error?: unknown;
      reason?: unknown;
      fallback?: unknown;
      audioBase64?: unknown;
      contentType?: unknown;
    };
    let parsed: ServerVoicePayload | null = null;
    if (raw && !type.includes("text/html")) {
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
            : "audio/wav",
      };
    }
    const reason = typeof parsed?.reason === "string" ? parsed.reason : parsed?.error;
    if (response.status === 404 || reason === "voice_not_configured") {
      return { ok: false, reason: "not_configured" };
    }
    return { ok: false, reason: "unavailable" };
  } catch {
    const timedOut = controller.signal.aborted && !options.signal?.aborted;
    return { ok: false, reason: timedOut ? "timeout" : "unavailable" };
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onAbort);
  }
}

function contextCanPlay(context: UnlockableContext | null): context is UnlockableContext & {
  destination: unknown;
  decodeAudioData: NonNullable<UnlockableContext["decodeAudioData"]>;
  createBufferSource: NonNullable<UnlockableContext["createBufferSource"]>;
} {
  return Boolean(
    context &&
      context.destination &&
      typeof context.decodeAudioData === "function" &&
      typeof context.createBufferSource === "function",
  );
}

function decodeBuffer(
  context: UnlockableContext & {
    decodeAudioData: NonNullable<UnlockableContext["decodeAudioData"]>;
  },
  bytes: ArrayBuffer,
): Promise<DecodedBuffer> {
  const copy = bytes.slice(0);
  return new Promise((resolve, reject) => {
    let settled = false;
    const ok = (buffer: DecodedBuffer) => {
      if (settled) return;
      settled = true;
      resolve(buffer);
    };
    const bad = (error: unknown) => {
      if (settled) return;
      settled = true;
      reject(error instanceof Error ? error : new Error("preview_audio_failed"));
    };
    let result: Promise<DecodedBuffer> | void;
    try {
      result = context.decodeAudioData(copy, ok, bad);
    } catch (error) {
      bad(error);
      return;
    }
    if (result && typeof result.then === "function") void result.then(ok, bad);
  });
}

async function playDecoded(
  context: UnlockableContext & {
    destination: unknown;
    decodeAudioData: NonNullable<UnlockableContext["decodeAudioData"]>;
    createBufferSource: NonNullable<UnlockableContext["createBufferSource"]>;
  },
  bytes: ArrayBuffer,
  onStarted?: () => void,
): Promise<void> {
  if (context.state === "suspended") await context.resume();
  const buffer = await decodeBuffer(context, bytes);
  stopPrimedSource();
  await new Promise<void>((resolve, reject) => {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    currentSource = source;
    source.onended = () => {
      if (currentSource === source) currentSource = null;
      resolve();
    };
    try {
      source.start(0);
      onStarted?.();
    } catch (error) {
      reject(error instanceof Error ? error : new Error("preview_audio_failed"));
    }
  });
}

async function playElement(blob: Blob, onStarted?: () => void): Promise<void> {
  const url = URL.createObjectURL(blob);
  const audio = primedAudio ?? (new Audio() as unknown as UnlockableAudio);
  primedAudio = audio;
  currentAudio = audio as HTMLAudioElement;
  const element = audio as HTMLAudioElement;
  audio.onended = null;
  audio.onerror = null;
  if (typeof element.removeAttribute === "function") element.removeAttribute("src");
  if (typeof element.load === "function") element.load();
  audio.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: unknown) => {
        if (settled) return;
        settled = true;
        if (error) reject(error instanceof Error ? error : new Error("preview_audio_failed"));
        else resolve();
      };
      element.onended = () => finish();
      element.onerror = () => {
        const code = element.error?.code;
        if (code === 1) return;
        finish(new Error(element.error ? `media_${element.error.code}` : "preview_audio_failed"));
      };
      const start = () => {
        void element
          .play()
          .then(() => onStarted?.())
          .catch((error: unknown) => finish(error));
      };
      if (typeof element.addEventListener === "function" && element.readyState < 2) {
        element.addEventListener("canplay", start, { once: true });
      } else start();
    });
  } finally {
    URL.revokeObjectURL(url);
    if (currentAudio === element) currentAudio = null;
  }
}

async function playPreviewAudio(blob: Blob, onStarted?: () => void): Promise<void> {
  if (contextCanPlay(primedContext)) {
    await playDecoded(primedContext, await blob.arrayBuffer(), onStarted);
    return;
  }
  await playElement(blob, onStarted);
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
    onEngine?: (engine: "preview" | "browser") => void;
  } = {},
): Promise<"browser" | "preview" | "unavailable"> {
  serverVoiceAbsent = false;
  const serverEndpoint = options.serverEndpoint ?? SERVER_VOICE_ENDPOINT;
  if (serverEndpoint && serverVoiceAttemptable()) {
    const server = await requestServerVoice(text, {
      fetchImpl: options.fetchImpl,
      endpoint: serverEndpoint,
    });
    if (server.ok) {
      serverVoiceAbsent = false;
      try {
        if (options.playAudio) {
          options.onEngine?.("preview");
          await options.playAudio(server.bytes, server.contentType);
        } else {
          const audioBytes = server.bytes.buffer.slice(
            server.bytes.byteOffset,
            server.bytes.byteOffset + server.bytes.byteLength,
          ) as ArrayBuffer;
          await playPreviewAudio(new Blob([audioBytes], { type: server.contentType }), () =>
            options.onEngine?.("preview"),
          );
        }
        return "preview";
      } catch (error) {
        warnVoice(error instanceof Error ? error.message : "playback_failed");
      }
    } else if (server.reason === "not_configured") {
      serverVoiceAbsent = true;
      warnVoice("not_configured");
    } else {
      warnVoice(server.reason);
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
      await playPreviewAudio(await response.blob(), () => options.onEngine?.("preview"));
      return "preview";
    } catch (error) {
      warnVoice(error instanceof Error ? error.message : "playback_failed");
    }
  }

  if (!browserVoiceSupport().synthesis) return "unavailable";
  options.onEngine?.("browser");
  await speakBrowserText(text, options);
  return "browser";
}
