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

export function speakBrowserText(
  text: string,
  options: { lang?: string; rate?: number } = {},
): Promise<void> {
  const target = speechWindow();
  if (!target || !browserVoiceSupport().synthesis) return Promise.resolve();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang ?? "en-GB";
    utterance.rate = options.rate ?? 1;
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
