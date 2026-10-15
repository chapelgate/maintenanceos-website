import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { main, pcm16ToWav, resetVoiceRateLimitForTests } from "../packages/website/voice/index.ts";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const functionDir = path.resolve(here, "../packages/website/voice");

const SECRET = "gemini-test-key-should-not-leak";
const PCM = Buffer.from([0x00, 0x10, 0xff, 0x7f, 0x00, 0x80]);

function event(method: string, text?: string, ip = "203.0.113.50") {
  return {
    http: {
      method,
      headers: {
        origin: "https://worksmartos.co.uk",
        "x-forwarded-for": ip,
      },
    },
    ...(text === undefined ? {} : { text }),
  };
}

function geminiAudio(pcm = PCM, mime = "audio/L16;codec=pcm;rate=24000") {
  return new Response(
    JSON.stringify({
      candidates: [
        {
          content: {
            parts: [{ inlineData: { mimeType: mime, data: pcm.toString("base64") } }],
          },
        },
      ],
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

function wavHeader(bytes: Buffer) {
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WAVE");
  assert.equal(bytes.subarray(12, 16).toString("ascii"), "fmt ");
  assert.equal(bytes.readUInt16LE(20), 1);
  assert.equal(bytes.readUInt16LE(22), 1);
  assert.equal(bytes.readUInt16LE(34), 16);
  assert.equal(bytes.subarray(36, 40).toString("ascii"), "data");
  return {
    sampleRate: bytes.readUInt32LE(24),
    dataSize: bytes.readUInt32LE(40),
    pcm: bytes.subarray(44, 44 + bytes.readUInt32LE(40)),
  };
}

test("pcm16ToWav writes a mono 16-bit header", () => {
  const wav = Buffer.from(pcm16ToWav(PCM, 24000));
  const header = wavHeader(wav);
  assert.equal(header.sampleRate, 24000);
  assert.equal(header.dataSize, PCM.byteLength);
  assert.deepEqual(header.pcm, PCM);
  assert.equal(wav.readUInt32LE(4), 36 + PCM.byteLength);
});

test("voice function stays unconfigured without a Gemini key", async () => {
  resetVoiceRateLimitForTests();
  for (const env of [{}, { GEMINI_API_KEY: "  " }, { GEMINI_API_KEY: "bad\nkey" }]) {
    const result = await main(event("POST", "Hello"), { env });
    assert.equal(result.statusCode, 503);
    assert.deepEqual(result.body, {
      ok: false,
      error: "voice_not_configured",
      fallback: "browser",
    });
    assert.equal(result.headers["Cache-Control"], "no-store");
    assert.doesNotMatch(JSON.stringify(result), /gemini-test-key/);
  }
});

test("voice function calls Gemini TTS and returns a WAV", async () => {
  resetVoiceRateLimitForTests();
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return geminiAudio();
  }) as typeof fetch;

  const result = await main(event("POST", "Good morning"), {
    env: { GEMINI_API_KEY: SECRET },
    fetchImpl: fetcher,
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.headers["Cache-Control"], "private, max-age=300");
  const body = result.body as { ok: boolean; contentType: string; audioBase64: string };
  assert.equal(body.ok, true);
  assert.equal(body.contentType, "audio/wav");
  const wav = Buffer.from(body.audioBase64, "base64");
  const header = wavHeader(wav);
  assert.equal(header.sampleRate, 24000);
  assert.deepEqual(header.pcm, PCM);
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0]?.url,
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent",
  );
  assert.equal(calls[0]?.url.includes("?"), false);
  assert.equal(calls[0]?.url.includes(SECRET), false);
  assert.equal(calls[0]?.init?.method, "POST");
  const headers = calls[0]?.init?.headers as Record<string, string>;
  assert.equal(headers["x-goog-api-key"], SECRET);
  assert.equal("xi-api-key" in headers, false);
  assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
    contents: [{ parts: [{ text: "Good morning" }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
      },
    },
  });
  assert.doesNotMatch(JSON.stringify(result.body), new RegExp(SECRET));
  assert.doesNotMatch(JSON.stringify(result), /ELEVENLABS|xi-api-key|elevenlabs/i);
});

test("GEMINI_TTS_MODEL and GEMINI_TTS_VOICE override the request", async () => {
  resetVoiceRateLimitForTests();
  let url = "";
  let voice = "";
  const result = await main(event("POST", "Hello", "203.0.113.61"), {
    env: {
      GEMINI_API_KEY: SECRET,
      GEMINI_TTS_MODEL: "gemini-2.5-flash-preview-tts",
      GEMINI_TTS_VOICE: "Algenib",
    },
    fetchImpl: (async (input: string | URL | Request, init?: RequestInit) => {
      url = String(input);
      voice = JSON.parse(String(init?.body)).generationConfig.speechConfig.voiceConfig
        .prebuiltVoiceConfig.voiceName;
      return geminiAudio(Buffer.from([1, 2]), "audio/L16;rate=16000");
    }) as typeof fetch,
  });
  assert.equal(result.statusCode, 200);
  assert.match(url, /models\/gemini-2\.5-flash-preview-tts:generateContent$/);
  assert.equal(voice, "Algenib");
  const wav = Buffer.from((result.body as { audioBase64: string }).audioBase64, "base64");
  assert.equal(wavHeader(wav).sampleRate, 16000);
});

test("an identical line is served from memory without a second Gemini call", async () => {
  resetVoiceRateLimitForTests();
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    return geminiAudio();
  }) as typeof fetch;
  const env = { GEMINI_API_KEY: SECRET };
  const first = await main(event("POST", "Same line", "203.0.113.62"), { env, fetchImpl: fetcher });
  const second = await main(event("POST", "Same line", "203.0.113.62"), { env, fetchImpl: fetcher });
  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.equal(calls, 1);
  assert.equal(
    (first.body as { audioBase64: string }).audioBase64,
    (second.body as { audioBase64: string }).audioBase64,
  );
});

test("Gemini 429 and a timeout fall back without the upstream body", async () => {
  resetVoiceRateLimitForTests();
  const limited = await main(event("POST", "Hello", "203.0.113.63"), {
    env: { GEMINI_API_KEY: SECRET },
    fetchImpl: (async () =>
      new Response(JSON.stringify({ error: { message: SECRET } }), { status: 429 })) as typeof fetch,
  });
  assert.equal(limited.statusCode, 429);
  assert.deepEqual(limited.body, {
    ok: false,
    error: "voice_rate_limited",
    fallback: "browser",
  });
  assert.doesNotMatch(JSON.stringify(limited), new RegExp(SECRET));

  const timedOut = await main(event("POST", "Hello", "203.0.113.64"), {
    env: { GEMINI_API_KEY: SECRET },
    fetchImpl: (async () => {
      const error = new Error("The operation was aborted due to timeout");
      error.name = "TimeoutError";
      throw error;
    }) as typeof fetch,
  });
  assert.equal(timedOut.statusCode, 504);
  assert.deepEqual(timedOut.body, { ok: false, error: "timeout", fallback: "browser" });
});

test("a model override cannot put the key into the Gemini URL", async () => {
  resetVoiceRateLimitForTests();
  let calls = 0;
  const result = await main(event("POST", "Hello", "203.0.113.65"), {
    env: { GEMINI_API_KEY: SECRET, GEMINI_TTS_MODEL: "gemini?key=" + SECRET },
    fetchImpl: (async () => {
      calls += 1;
      return geminiAudio();
    }) as typeof fetch,
  });
  assert.equal(calls, 0);
  assert.equal(result.statusCode, 502);
  assert.equal((result.body as { fallback: string }).fallback, "browser");
  assert.doesNotMatch(JSON.stringify(result), new RegExp(SECRET));
});

test("voice function turns an upstream 5xx into a browser fallback", async () => {
  resetVoiceRateLimitForTests();
  const result = await main(event("POST", "Hello", "203.0.113.51"), {
    env: { GEMINI_API_KEY: SECRET },
    fetchImpl: (async () => new Response("nope", { status: 500 })) as typeof fetch,
  });
  assert.equal(result.statusCode, 502);
  assert.deepEqual(result.body, {
    ok: false,
    error: "voice_unavailable",
    fallback: "browser",
  });
  assert.doesNotMatch(JSON.stringify(result), /nope/);
});

test("voice function rejects an empty or oversized line before calling Gemini", async () => {
  resetVoiceRateLimitForTests();
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    return geminiAudio();
  }) as typeof fetch;
  const env = { GEMINI_API_KEY: SECRET };
  const empty = await main(event("POST", "   ", "203.0.113.52"), { env, fetchImpl: fetcher });
  const long = await main(event("POST", "a".repeat(401), "203.0.113.52"), { env, fetchImpl: fetcher });
  assert.equal(empty.statusCode, 400);
  assert.equal((empty.body as { error: string }).error, "text_required");
  assert.equal((empty.body as { fallback: string }).fallback, "browser");
  assert.equal(long.statusCode, 400);
  assert.equal((long.body as { error: string }).error, "text_too_long");
  assert.equal(calls, 0);
});

test("voice function rate limits one address", async () => {
  resetVoiceRateLimitForTests();
  const env = { GEMINI_API_KEY: SECRET };
  const fetcher = (async () => geminiAudio()) as typeof fetch;
  let last = 0;
  for (let i = 0; i < 7; i += 1) {
    const result = await main(event("POST", `Line ${i}`, "203.0.113.70"), { env, fetchImpl: fetcher });
    last = result.statusCode;
  }
  assert.equal(last, 429);
});

test("deployed voice artifact is prebuilt and matches the unconfigured fallback", async () => {
  assert.equal(fs.existsSync(path.join(functionDir, "package.json")), false);
  assert.equal(fs.readFileSync(path.join(functionDir, ".include"), "utf8").trim(), "bundle.cjs");
  const project = fs.readFileSync(path.resolve(here, "../project.yml"), "utf8");
  assert.match(project, /name:\s*voice/);
  assert.match(project, /main:\s*main/);
  const bundled = fs.readFileSync(path.join(functionDir, "bundle.cjs"), "utf8");
  assert.doesNotMatch(bundled, /ELEVENLABS|elevenlabs|xi-api-key/i);
  assert.match(bundled, /gemini-2\.5-flash-preview-tts/);
  assert.match(bundled, /x-goog-api-key/);

  const deployed = require(path.join(functionDir, "bundle.cjs")) as {
    main: typeof main;
    resetVoiceRateLimitForTests: typeof resetVoiceRateLimitForTests;
  };
  assert.equal(typeof deployed.main, "function");
  deployed.resetVoiceRateLimitForTests();
  const result = await deployed.main(event("POST", "Hello", "203.0.113.53"), { env: {} });
  assert.equal(result.statusCode, 503);
  assert.equal((result.body as { error?: string }).error, "voice_not_configured");
  assert.equal((result.body as { fallback?: string }).fallback, "browser");
});
