import { browserVoiceSupport, speakBrowserText } from "./browser-voice.ts";

/**
 * Golden-line voice recorded in PRODUCT_CLAIMS_REGISTER.md V-01.
 * Kokoro is a commissioning candidate and is not this name.
 * The website never receives the golden line's credential.
 */
export const GOLDEN_LINE_VOICE_PROVIDER = "gemini";
export const GOLDEN_LINE_VOICE_NAME = "Gacrux";

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
  options: { lang?: string; rate?: number; fetchImpl?: typeof fetch } = {},
): Promise<"browser" | "preview" | "unavailable"> {
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
