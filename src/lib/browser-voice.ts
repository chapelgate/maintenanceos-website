export type BrowserVoiceSupport = {
  recognition: boolean;
  synthesis: boolean;
};

type RecognitionAlternativeLike = { transcript?: string };
type RecognitionResultLike = { 0?: RecognitionAlternativeLike };
type RecognitionEventLike = { results?: { 0?: RecognitionResultLike } };
type RecognitionErrorEventLike = { error?: string };

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: RecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

type RecognitionConstructor = new () => RecognitionLike;

type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

function speechWindow(): SpeechWindow | null {
  return typeof window === "undefined" ? null : (window as SpeechWindow);
}

type BrowserVoiceCandidate = {
  name: string;
  lang: string;
  default?: boolean;
  localService?: boolean;
};

const MODERN_VOICE_HINT =
  /\b(?:natural|neural|premium|enhanced|siri|serena|sonia|libby|ryan|google uk english)\b/i;

function normalizedLocale(value: string): string {
  return value.trim().replaceAll("_", "-").toLowerCase();
}

export function selectPreferredBrowserVoice<T extends BrowserVoiceCandidate>(
  voices: readonly T[],
  lang = "en-GB",
): T | null {
  if (!voices.length) return null;
  const requested = normalizedLocale(lang);
  const requestedLanguage = requested.split("-")[0] ?? requested;

  let best: { voice: T; score: number; index: number } | null = null;
  voices.forEach((voice, index) => {
    const locale = normalizedLocale(voice.lang);
    const language = locale.split("-")[0] ?? locale;
    let score = 0;
    if (locale === requested) score += 1_000;
    else if (language === requestedLanguage) score += 500;
    else score -= 1_000;

    if (MODERN_VOICE_HINT.test(voice.name)) score += 120;
    if (voice.localService === false) score += 20;
    if (voice.default) score += 5;

    if (!best || score > best.score || (score === best.score && index < best.index)) {
      best = { voice, score, index };
    }
  });
  return best && best.score >= 0 ? best.voice : null;
}

async function loadBrowserVoices(timeoutMs = 350): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const synthesis = window.speechSynthesis;
  const immediate = synthesis.getVoices();
  if (immediate.length) return immediate;

  return await new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      synthesis.removeEventListener("voiceschanged", finish);
      resolve(synthesis.getVoices());
    };
    synthesis.addEventListener("voiceschanged", finish);
    const timer = setTimeout(finish, timeoutMs);
  });
}

export function browserVoiceSupport(): BrowserVoiceSupport {
  const target = speechWindow();
  return {
    recognition: Boolean(
      target?.SpeechRecognition ?? target?.webkitSpeechRecognition,
    ),
    synthesis:
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      typeof SpeechSynthesisUtterance !== "undefined",
  };
}

export async function speakBrowserText(
  text: string,
  options: { lang?: string; rate?: number } = {},
): Promise<void> {
  const target = speechWindow();
  if (!target || !browserVoiceSupport().synthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang ?? "en-GB";
  utterance.rate = options.rate ?? 1;
  try {
    const preferred = selectPreferredBrowserVoice(
      await loadBrowserVoices(),
      utterance.lang,
    );
    if (preferred) utterance.voice = preferred;
  } catch {
    // Voice enumeration differs across browsers. The existing browser default
    // remains the fail-safe instead of breaking the receptionist preview.
  }

  await new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export type BrowserRecognitionSession = {
  result: Promise<string>;
  stop(): void;
};

export function startBrowserSpeechRecognition(
  lang = "en-GB",
): BrowserRecognitionSession {
  const target = speechWindow();
  const Constructor =
    target?.SpeechRecognition ?? target?.webkitSpeechRecognition;
  if (!Constructor) {
    return {
      result: Promise.reject(new Error("speech_recognition_unavailable")),
      stop() {},
    };
  }

  const recognition = new Constructor();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let settled = false;
  const result = new Promise<string>((resolve, reject) => {
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? "";
      settled = true;
      if (transcript) resolve(transcript);
      else reject(new Error("speech_not_understood"));
    };
    recognition.onerror = (event) => {
      settled = true;
      reject(new Error(event.error || "speech_recognition_failed"));
    };
    recognition.onend = () => {
      if (!settled) reject(new Error("speech_recognition_ended"));
    };
    try {
      recognition.start();
    } catch {
      settled = true;
      reject(new Error("speech_recognition_start_failed"));
    }
  });

  return {
    result,
    stop() {
      if (settled) return;
      settled = true;
      try {
        recognition.abort();
      } catch {
        try {
          recognition.stop();
        } catch {}
      }
    },
  };
}
