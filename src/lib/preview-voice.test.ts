import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  CONFIGURED_VOICE_NAME,
  GOLDEN_LINE_VOICE_NAME,
  GOLDEN_LINE_VOICE_PROVIDER,
  previewVoiceConfig,
  previewVoiceRequestBody,
  requestServerVoice,
  resetServerVoiceStateForTests,
  speakReceptionistText,
  unlockSpokenAudioOn,
  voiceEngineLabel,
} from "./preview-voice.ts";

test("spoken preview uses the browser until a website-owned endpoint exists", () => {
  const fallback = previewVoiceConfig({});
  assert.equal(fallback.mode, "browser");
  assert.equal(fallback.endpoint, "");
  assert.equal(fallback.voice, GOLDEN_LINE_VOICE_NAME);
  assert.equal(fallback.provider, GOLDEN_LINE_VOICE_PROVIDER);
  assert.equal(fallback.voice, "Gacrux");
  assert.equal(fallback.provider, "gemini");
  assert.equal("apiKey" in fallback, false);

  const configured = previewVoiceConfig({
    NEXT_PUBLIC_VOICE_PREVIEW_ENDPOINT: " https://voice.example/preview ",
    NEXT_PUBLIC_VOICE_PREVIEW_VOICE: "Gacrux",
  });
  assert.equal(configured.mode, "preview");
  assert.equal(configured.endpoint, "https://voice.example/preview");
  assert.deepEqual(previewVoiceRequestBody("Hello", configured), {
    text: "Hello",
    voice: "Gacrux",
    provider: "gemini",
  });
  assert.doesNotMatch(JSON.stringify(configured), /key|secret|token/i);
  assert.equal(CONFIGURED_VOICE_NAME, "Theatrical");
});

test("the browser voice module never names the server voice secrets", () => {
  const source = fs.readFileSync(new URL("./preview-voice.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /ELEVENLABS_API_KEY/);
  assert.doesNotMatch(source, /ELEVENLABS_VOICE_ID/);
  assert.doesNotMatch(source, /GEMINI_API_KEY/);
  assert.doesNotMatch(source, /xi-api-key/);
  assert.doesNotMatch(source, /x-goog-api-key/);
});

test("server voice plays returned audio and sends text only", async () => {
  resetServerVoiceStateForTests();
  const calls: Array<{ url: string; body: string }> = [];
  const played: string[] = [];
  const mode = await speakReceptionistText("Hello from the desk", {
    fetchImpl: async (input, init) => {
      calls.push({ url: String(input), body: String(init?.body) });
      return new Response(
        JSON.stringify({ ok: true, contentType: "audio/mpeg", audioBase64: btoa("MP3") }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
    playAudio: async (bytes) => {
      played.push(new TextDecoder().decode(bytes));
    },
  });
  assert.equal(mode, "preview");
  assert.deepEqual(played, ["MP3"]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url, "/api/website/voice");
  assert.deepEqual(JSON.parse(calls[0]?.body ?? "{}"), { text: "Hello from the desk" });
  assert.doesNotMatch(calls[0]?.body ?? "", /ELEVENLABS|GEMINI_API_KEY|xi-api-key|x-goog-api-key|voiceId/i);
});

test("a Gemini rate limit falls back and a later line can try the server again", async () => {
  resetServerVoiceStateForTests();
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return new Response(
      JSON.stringify({ ok: false, fallback: "browser", reason: "rate_limited" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  const first = await speakReceptionistText("Hello", { fetchImpl });
  const second = await speakReceptionistText("Hello again", { fetchImpl });
  assert.equal(first, "unavailable");
  assert.equal(second, "unavailable");
  assert.equal(calls, 2);
  resetServerVoiceStateForTests();
});

test("an HTML gateway page is not parsed and the next line retries", async () => {
  resetServerVoiceStateForTests();
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return new Response("<html>504 Gateway Timeout</html>", {
      status: 504,
      headers: { "content-type": "text/html", "x-do-orig-status": "503" },
    });
  };
  const first = await speakReceptionistText("Hello", { fetchImpl });
  const second = await speakReceptionistText("Hello again", { fetchImpl });
  assert.equal(first, "unavailable");
  assert.equal(second, "unavailable");
  assert.equal(calls, 2);
  assert.deepEqual(await requestServerVoice("Hi", { fetchImpl }), { ok: false, reason: "unavailable" });
  resetServerVoiceStateForTests();
});

test("a missing server voice is tried again on the next line and the reason is warned", async () => {
  resetServerVoiceStateForTests();
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(" "));
  };
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return new Response(
      JSON.stringify({ ok: false, fallback: "browser", reason: "voice_not_configured" }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  try {
    const first = await speakReceptionistText("Hello", { fetchImpl });
    const second = await speakReceptionistText("Hello again", { fetchImpl });
    assert.equal(first, "unavailable");
    assert.equal(second, "unavailable");
    assert.equal(calls, 2);
    assert.match(warnings.join("\n"), /not_configured/);
  } finally {
    console.warn = original;
  }
  const direct = await requestServerVoice("Hello", {
    endpoint: "/api/website/voice",
    fetchImpl: async () =>
      new Response("missing", { status: 404, headers: { "content-type": "text/plain" } }),
  });
  assert.deepEqual(direct, { ok: false, reason: "not_configured" });
  resetServerVoiceStateForTests();
});

test("the tap unlocks one audio element and the fetched wav plays through it", async () => {
  resetServerVoiceStateForTests();
  const plays: string[] = [];
  let resumes = 0;
  class FakeAudio {
    src = "";
    onended: (() => void) | null = null;
    onerror: (() => void) | null = null;
    pause(): void {}
    play(): Promise<void> {
      plays.push(this.src);
      queueMicrotask(() => this.onended?.());
      return Promise.resolve();
    }
  }
  class FakeContext {
    resume(): Promise<void> {
      resumes += 1;
      return Promise.resolve();
    }
  }
  const unlocked = unlockSpokenAudioOn({ Audio: FakeAudio, AudioContext: FakeContext });
  const createObjectURL = URL.createObjectURL;
  const revokeObjectURL = URL.revokeObjectURL;
  URL.createObjectURL = () => "blob:gemini-wav";
  URL.revokeObjectURL = () => {};
  try {
    const mode = await speakReceptionistText("Hello", {
      fetchImpl: async () =>
        new Response(Uint8Array.from([82, 73, 70, 70]), {
          status: 200,
          headers: { "content-type": "audio/wav" },
        }),
    });
    assert.equal(mode, "preview");
    assert.equal(resumes, 1);
    assert.deepEqual(plays, ["blob:gemini-wav"]);
    assert.equal(unlocked.src, "blob:gemini-wav");
  } finally {
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    resetServerVoiceStateForTests();
  }
});

test("a blocked play warns and does not pretend the Gemini voice played", async () => {
  resetServerVoiceStateForTests();
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(" "));
  };
  class FakeAudio {
    src = "";
    onended: (() => void) | null = null;
    onerror: (() => void) | null = null;
    pause(): void {}
    play(): Promise<void> {
      if (this.src.startsWith("blob:")) return Promise.reject(new Error("NotAllowedError"));
      return Promise.resolve();
    }
  }
  unlockSpokenAudioOn({ Audio: FakeAudio });
  const createObjectURL = URL.createObjectURL;
  const revokeObjectURL = URL.revokeObjectURL;
  URL.createObjectURL = () => "blob:gemini-wav";
  URL.revokeObjectURL = () => {};
  try {
    const mode = await speakReceptionistText("Hello", {
      fetchImpl: async () =>
        new Response(Uint8Array.from([82, 73, 70, 70]), {
          status: 200,
          headers: { "content-type": "audio/wav" },
        }),
    });
    assert.notEqual(mode, "preview");
    assert.match(warnings.join("\n"), /NotAllowedError/);
  } finally {
    console.warn = original;
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    resetServerVoiceStateForTests();
  }
});

test("a Piper wav names Jenny Dioco and a failed server voice stays a browser warning", async () => {
  resetServerVoiceStateForTests();
  const engines: string[] = [];
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(" "));
  };
  try {
    const played = await speakReceptionistText("Good morning", {
      fetchImpl: async () =>
        new Response(Uint8Array.from([82, 73, 70, 70]), {
          status: 200,
          headers: { "content-type": "audio/wav", "x-voice-engine": "piper" },
        }),
      playAudio: async () => {},
      onEngine: (engine) => engines.push(engine),
    });
    assert.equal(played, "preview");
    assert.deepEqual(engines, ["piper"]);
    assert.equal(voiceEngineLabel("piper"), "Neural voice (Jenny Dioco)");
    assert.equal(voiceEngineLabel("gemini"), "Gemini voice");
    assert.equal(voiceEngineLabel("browser"), "Browser voice");

    engines.length = 0;
    const browser = await speakReceptionistText("Good morning", {
      fetchImpl: async () =>
        new Response(
          JSON.stringify({ ok: false, fallback: "browser", engine: "browser", reason: "piper_unavailable" }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      onEngine: (engine) => engines.push(engine),
    });
    assert.equal(browser, "unavailable");
    assert.deepEqual(engines, []);
    assert.match(warnings.join("\n"), /Gemini voice unavailable: unavailable/);
  } finally {
    console.warn = original;
    resetServerVoiceStateForTests();
  }
});

test("the fetched wav plays through the audio context resumed on the tap", async () => {
  resetServerVoiceStateForTests();
  const elementPlays: string[] = [];
  const started: unknown[] = [];
  let decoded: Uint8Array | null = null;
  let resumes = 0;
  class FakeAudio {
    src = "";
    onended: (() => void) | null = null;
    onerror: (() => void) | null = null;
    pause(): void {}
    play(): Promise<void> {
      elementPlays.push(this.src);
      return Promise.resolve();
    }
  }
  const destination = { kind: "speakers" };
  class FakeContext {
    destination = destination;
    resume(): Promise<void> {
      resumes += 1;
      return Promise.resolve();
    }
    decodeAudioData(bytes: ArrayBuffer): Promise<{ mark: string }> {
      decoded = new Uint8Array(bytes);
      return Promise.resolve({ mark: "decoded" });
    }
    createBufferSource() {
      const source = {
        buffer: null as { mark: string } | null,
        onended: null as (() => void) | null,
        connect(target: unknown) {
          assert.equal(target, destination);
        },
        start() {
          started.push(source.buffer);
          queueMicrotask(() => source.onended?.());
        },
      };
      return source;
    }
  }
  const context = new FakeContext();
  unlockSpokenAudioOn({
    Audio: FakeAudio,
    AudioContext: class {
      constructor() {
        return context;
      }
    } as unknown as new () => FakeContext,
  });
  const createObjectURL = URL.createObjectURL;
  let objectUrls = 0;
  URL.createObjectURL = () => {
    objectUrls += 1;
    return "blob:should-not-play";
  };
  try {
    const mode = await speakReceptionistText("Hello", {
      fetchImpl: async () =>
        new Response(Uint8Array.from([82, 73, 70, 70, 1, 2, 3, 4]), {
          status: 200,
          headers: { "content-type": "audio/wav" },
        }),
    });
    assert.equal(mode, "preview");
    assert.equal(resumes, 1);
    assert.equal(objectUrls, 0);
    assert.deepEqual(Array.from(decoded ?? []), [82, 73, 70, 70, 1, 2, 3, 4]);
    assert.equal(started.length, 1);
    assert.deepEqual(started[0], { mark: "decoded" });
    assert.deepEqual(elementPlays, []);
  } finally {
    URL.createObjectURL = createObjectURL;
    resetServerVoiceStateForTests();
  }
});
