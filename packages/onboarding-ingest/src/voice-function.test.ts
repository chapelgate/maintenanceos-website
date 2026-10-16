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

type VoiceResult = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
};

function jsonBody(result: VoiceResult) {
  assert.equal(typeof result.body, "string");
  assert.match(result.headers["Content-Type"] ?? "", /^application\/json/);
  return JSON.parse(result.body as string) as {
    ok?: boolean;
    error?: string;
    fallback?: string;
    reason?: string;
    configured?: boolean;
    keyPresent?: boolean;
    keyLength?: number;
    keyPrefixKind?: string;
    model?: string;
    voice?: string;
    build?: string | null;
    envNames?: string[];
    envCount?: number;
  };
}

function wavBytes(result: VoiceResult) {
  assert.equal(result.statusCode, 200);
  assert.equal(result.headers["Content-Type"], "audio/wav");
  assert.equal(typeof result.body, "string");
  assert.equal("isBase64Encoded" in result, false);
  return Buffer.from(result.body as string, "base64");
}

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
  for (const env of [{}, { GEMINI_API_KEY: "  " }, { GEMINI_API_KEY: "\n\0" }]) {
    const result = await main(event("POST", "Hello"), { env });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(jsonBody(result), {
      ok: false,
      fallback: "browser",
      reason: "voice_not_configured",
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
  const wav = wavBytes(result);
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
  assert.doesNotMatch(String(result.body), new RegExp(SECRET));
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
  const wav = wavBytes(result);
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
  assert.equal(first.body, second.body);
  assert.equal(typeof first.body, "string");
});

test("Gemini 429 and a timeout fall back without the upstream body", async () => {
  resetVoiceRateLimitForTests();
  const limited = await main(event("POST", "Hello", "203.0.113.63"), {
    env: { GEMINI_API_KEY: SECRET },
    fetchImpl: (async () =>
      new Response(JSON.stringify({ error: { message: SECRET } }), { status: 429 })) as typeof fetch,
  });
  assert.equal(limited.statusCode, 200);
  assert.deepEqual(jsonBody(limited), {
    ok: false,
    fallback: "browser",
    reason: "upstream_429",
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
  assert.equal(timedOut.statusCode, 200);
  assert.deepEqual(jsonBody(timedOut), { ok: false, fallback: "browser", reason: "upstream_timeout" });
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
  assert.equal(result.statusCode, 200);
  assert.equal(jsonBody(result).reason, "internal_error");
  assert.equal(jsonBody(result).fallback, "browser");
  assert.doesNotMatch(JSON.stringify(result), new RegExp(SECRET));
});

test("voice function reports missing audio without a 5xx", async () => {
  resetVoiceRateLimitForTests();
  const result = await main(event("POST", "Hello", "203.0.113.66"), {
    env: { GEMINI_API_KEY: SECRET },
    fetchImpl: (async () =>
      new Response(JSON.stringify({ candidates: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })) as typeof fetch,
  });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(jsonBody(result), {
    ok: false,
    fallback: "browser",
    reason: "upstream_no_audio",
  });
});

test("voice function turns an upstream 5xx into a browser fallback", async () => {
  resetVoiceRateLimitForTests();
  const result = await main(event("POST", "Hello", "203.0.113.51"), {
    env: { GEMINI_API_KEY: SECRET },
    fetchImpl: (async () => new Response("nope", { status: 500 })) as typeof fetch,
  });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(jsonBody(result), {
    ok: false,
    fallback: "browser",
    reason: "upstream_500",
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
  assert.equal(empty.statusCode, 200);
  assert.equal(jsonBody(empty).reason, "text_missing");
  assert.equal(jsonBody(empty).fallback, "browser");
  assert.equal(long.statusCode, 200);
  assert.equal(jsonBody(long).reason, "text_too_long");
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
    if (i === 6) assert.equal(jsonBody(result).reason, "rate_limited");
  }
  assert.equal(last, 200);
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
  assert.equal(result.statusCode, 200);
  const body = jsonBody(result);
  assert.equal(body.reason, "voice_not_configured");
  assert.equal(body.fallback, "browser");
  assert.doesNotMatch(bundled, /AbortSignal\.timeout/);
  assert.match(project, /name:\s*website/);
  assert.match(project, /runtime:\s*nodejs:22/);
  assert.match(project, /name:\s*website[\s\S]*environment:[\s\S]*GEMINI_API_KEY:\s*"\$\{GEMINI_API_KEY\}"/);
  assert.match(project, /GEMINI_TTS_MODEL:\s*"\$\{GEMINI_TTS_MODEL\}"/);
  assert.match(project, /GEMINI_TTS_VOICE:\s*"\$\{GEMINI_TTS_VOICE\}"/);
  assert.match(project, /SCANNER_V2_RUNTIME_URL:\s*"\$\{SCANNER_V2_RUNTIME_URL\}"/);
  assert.match(bundled, /envNames/);
  assert.match(bundled, /envCount/);
});

function geminiFetcher(calls: Array<{ url: string; init?: RequestInit }>) {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return geminiAudio();
  }) as typeof fetch;
}

test("web-action events with array headers and parsed or base64 bodies return audio/wav", async () => {
  resetVoiceRateLimitForTests();
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const env = { GEMINI_API_KEY: SECRET };
  const shapes = [
    {
      http: {
        method: "post",
        headers: {
          origin: "https://worksmartos.co.uk",
          "x-forwarded-for": ["203.0.113.80", "10.0.0.1"],
        },
        body: { text: "Hi" },
      },
    },
    {
      __ow_method: "post",
      __ow_headers: { "x-forwarded-for": "203.0.113.81" },
      __ow_isBase64Encoded: true,
      __ow_body: Buffer.from(JSON.stringify({ text: "Hi" }), "utf8").toString("base64"),
    },
    {
      http: {
        method: "POST",
        headers: { "x-forwarded-for": "203.0.113.82" },
        isBase64Encoded: true,
        body: Buffer.from(JSON.stringify({ text: "Hi" }), "utf8").toString("base64"),
      },
    },
  ];

  for (const shape of shapes) {
    calls.length = 0;
    const result = await main(shape, { env, fetchImpl: geminiFetcher(calls) });
    const wav = wavBytes(result);
    const header = wavHeader(wav);
    assert.equal(header.sampleRate, 24000);
    assert.deepEqual(header.pcm, PCM);
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.url.includes("?"), false);
    assert.equal(calls[0]?.url.includes(SECRET), false);
    const headers = calls[0]?.init?.headers as Record<string, string>;
    assert.equal(headers["x-goog-api-key"], SECRET);
    assert.equal(JSON.parse(String(calls[0]?.init?.body)).contents[0].parts[0].text, "Hi");
    resetVoiceRateLimitForTests();
  }
});

test("a thrown handler error returns a string JSON browser fallback", async () => {
  resetVoiceRateLimitForTests();
  const env = {};
  Object.defineProperty(env, "GEMINI_API_KEY", {
    get() {
      throw new Error(`boom ${SECRET}`);
    },
  });
  const result = await main(
    {
      http: {
        method: "POST",
        headers: { "x-forwarded-for": ["203.0.113.83"] },
        body: { text: "Hi" },
      },
    },
    { env },
  );
  assert.equal(result.statusCode, 200);
  const body = jsonBody(result);
  assert.deepEqual(body, { ok: false, fallback: "browser", reason: "internal_error" });
  assert.doesNotMatch(result.body as string, new RegExp(SECRET));
  assert.doesNotMatch(result.body as string, /boom/);

  const saved = globalThis.fetch;
  // @ts-expect-error exercise a runtime without global fetch
  globalThis.fetch = undefined;
  try {
    resetVoiceRateLimitForTests();
    const missing = await main(event("POST", "Hi", "203.0.113.84"), { env: { GEMINI_API_KEY: SECRET } });
    assert.equal(missing.statusCode, 200);
    assert.equal(jsonBody(missing).reason, "internal_error");
    assert.equal(jsonBody(missing).fallback, "browser");
  } finally {
    globalThis.fetch = saved;
  }
});

test("the deployed bundle accepts a DigitalOcean web-action event and a thrown error", async () => {
  const deployed = require(path.join(functionDir, "bundle.cjs")) as {
    main: typeof main;
    resetVoiceRateLimitForTests: typeof resetVoiceRateLimitForTests;
  };
  deployed.resetVoiceRateLimitForTests();
  const calls: Array<{ url: string }> = [];
  const result = await deployed.main(
    {
      http: {
        method: "POST",
        headers: { "x-forwarded-for": ["203.0.113.85"] },
        body: { text: "Hi" },
      },
    },
    {
      env: { GEMINI_API_KEY: SECRET },
      fetchImpl: (async (input: string | URL | Request) => {
        calls.push({ url: String(input) });
        return geminiAudio();
      }) as typeof fetch,
    },
  );
  assert.equal(wavHeader(wavBytes(result)).sampleRate, 24000);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url.includes(SECRET), false);

  deployed.resetVoiceRateLimitForTests();
  const env = {};
  Object.defineProperty(env, "GEMINI_API_KEY", {
    get() {
      throw new Error(SECRET);
    },
  });
  const failed = await deployed.main({ http: { method: "POST", body: { text: "Hi" } } }, { env });
  assert.equal(failed.statusCode, 200);
  const body = jsonBody(failed);
  assert.equal(body.reason, "internal_error");
  assert.equal(body.fallback, "browser");
  assert.doesNotMatch(String(failed.body), new RegExp(SECRET));
});

test("GET reports whether the key is present without returning it", async () => {
  resetVoiceRateLimitForTests();
  const present = await main(
    { http: { method: "GET", headers: { origin: "https://worksmartos.co.uk" } } },
    { env: { GEMINI_API_KEY: SECRET, GEMINI_TTS_MODEL: "gemini-2.5-flash-preview-tts", GEMINI_TTS_VOICE: "Algenib" } },
  );
  assert.equal(present.statusCode, 200);
  const presentBody = jsonBody(present);
  assert.equal(presentBody.ok, true);
  assert.equal(presentBody.configured, true);
  assert.equal(presentBody.keyPresent, true);
  assert.equal(presentBody.keyLength, SECRET.length);
  assert.equal(presentBody.keyPrefixKind, "other");
  assert.equal(presentBody.model, "gemini-2.5-flash-preview-tts");
  assert.equal(presentBody.voice, "Algenib");
  assert.ok(presentBody.build === null || /^[0-9a-f]{7,64}$/i.test(presentBody.build));
  assert.doesNotMatch(JSON.stringify(present), new RegExp(SECRET));

  const absent = await main({ http: { method: "GET" } }, { env: {} });
  assert.equal(absent.statusCode, 200);
  const body = jsonBody(absent);
  assert.equal(body.ok, true);
  assert.equal(body.configured, false);
  assert.equal(body.keyPresent, false);
  assert.equal(body.keyLength, 0);
  assert.equal(body.keyPrefixKind, "other");
  assert.equal(body.model, "gemini-2.5-flash-preview-tts");
  assert.equal(body.voice, "Charon");
});

const AQ_KEY = `AQ.${"x".repeat(50)}`;

function withEnvKey(value: string | undefined, run: () => Promise<void>): Promise<void> {
  const saved = process.env.GEMINI_API_KEY;
  if (value === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = value;
  return run().finally(() => {
    if (saved === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = saved;
  });
}

test("an AQ. key is configured and sent in x-goog-api-key", async () => {
  resetVoiceRateLimitForTests();
  assert.equal(AQ_KEY.length, 53);
  const health = await main(
    { http: { method: "GET", headers: { origin: "https://worksmartos.co.uk" } } },
    { env: { GEMINI_API_KEY: `  ${AQ_KEY}\n` } },
  );
  const healthBody = jsonBody(health);
  assert.equal(healthBody.configured, true);
  assert.equal(healthBody.keyPresent, true);
  assert.equal(healthBody.keyLength, 53);
  assert.equal(healthBody.keyPrefixKind, "AQ.");
  assert.doesNotMatch(JSON.stringify(health), new RegExp(AQ_KEY));

  const stripped = await main(
    { http: { method: "GET" } },
    { env: { GEMINI_API_KEY: "bad\nkey" } },
  );
  assert.equal(jsonBody(stripped).configured, true);
  assert.equal(jsonBody(stripped).keyLength, "badkey".length);
  assert.doesNotMatch(JSON.stringify(stripped), /\n/);

  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const spoken = await main(event("POST", "Hello", "203.0.113.90"), {
    env: { GEMINI_API_KEY: AQ_KEY },
    fetchImpl: geminiFetcher(calls),
  });
  assert.equal(spoken.statusCode, 200);
  assert.equal(wavHeader(wavBytes(spoken)).sampleRate, 24000);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.url.includes("?"), false);
  assert.equal(calls[0]?.url.includes(AQ_KEY), false);
  const headers = calls[0]?.init?.headers as Record<string, string>;
  assert.equal(headers["x-goog-api-key"], AQ_KEY);
  assert.equal(headers.Authorization, undefined);
});

test("GEMINI_API_KEY is read at call time and from action parameters", async () => {
  resetVoiceRateLimitForTests();
  await withEnvKey(AQ_KEY, async () => {
    const fromProcess = await main({ http: { method: "GET" } });
    const body = jsonBody(fromProcess);
    assert.equal(body.configured, true);
    assert.equal(body.keyPrefixKind, "AQ.");
    assert.equal(body.keyLength, 53);
    assert.doesNotMatch(JSON.stringify(fromProcess), new RegExp(AQ_KEY));
  });

  await withEnvKey(undefined, async () => {
    const fromParam = await main({
      __ow_method: "get",
      __ow_params: { GEMINI_API_KEY: AQ_KEY, GEMINI_TTS_VOICE: "Algenib" },
    });
    const body = jsonBody(fromParam);
    assert.equal(body.configured, true);
    assert.equal(body.keyPresent, true);
    assert.equal(body.keyLength, 53);
    assert.equal(body.keyPrefixKind, "AQ.");
    assert.equal(body.voice, "Algenib");
    assert.doesNotMatch(JSON.stringify(fromParam), new RegExp(AQ_KEY));

    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const spoken = await main(
      {
        __ow_method: "post",
        __ow_headers: { "x-forwarded-for": "203.0.113.91" },
        params: { GEMINI_API_KEY: AQ_KEY },
        text: "Hello from params",
      },
      { fetchImpl: geminiFetcher(calls) },
    );
    assert.equal(wavHeader(wavBytes(spoken)).sampleRate, 24000);
    const headers = calls[0]?.init?.headers as Record<string, string>;
    assert.equal(headers["x-goog-api-key"], AQ_KEY);
    assert.equal(calls[0]?.url.includes(AQ_KEY), false);
  });

  const deployed = require(path.join(functionDir, "bundle.cjs")) as {
    main: typeof main;
    resetVoiceRateLimitForTests: typeof resetVoiceRateLimitForTests;
  };
  deployed.resetVoiceRateLimitForTests();
  await withEnvKey(undefined, async () => {
    const bundled = await deployed.main({
      __ow_method: "get",
      __ow_params: { GEMINI_API_KEY: AQ_KEY },
    });
    const body = jsonBody(bundled);
    assert.equal(body.configured, true);
    assert.equal(body.keyPrefixKind, "AQ.");
    assert.equal(body.keyLength, 53);
    assert.doesNotMatch(JSON.stringify(bundled), new RegExp(AQ_KEY));
  });
});

test("GET lists matching env names and never their values", async () => {
  const secret = `AQ.${"z".repeat(50)}`;
  const visible = [
    "GEMINI_DIAGNOSTIC_MARKER",
    "ONBOARDING_DIAGNOSTIC_MARKER",
    "SCAN_DIAGNOSTIC_MARKER",
    "COMMIT_DIAGNOSTIC_MARKER",
    "GIT_DIAGNOSTIC_MARKER",
    "SOURCE_DIAGNOSTIC_MARKER",
    "__OW_DIAGNOSTIC_MARKER",
    "DO_DIAGNOSTIC_MARKER",
  ];
  const hidden = "SCANNER_DIAGNOSTIC_MARKER";
  const saved = new Map<string, string | undefined>();
  for (const name of [...visible, hidden]) {
    saved.set(name, process.env[name]);
    process.env[name] = secret;
  }
  try {
    const result = await main({ http: { method: "GET" } }, { env: {} });
    const body = jsonBody(result);
    assert.ok(Array.isArray(body.envNames));
    const names = body.envNames ?? [];
    for (const name of visible) assert.ok(names.includes(name), name);
    assert.equal(names.includes(hidden), false);
    assert.equal(names.includes("PATH"), false);
    assert.deepEqual(names, [...names].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    assert.equal(body.envCount, Object.keys(process.env).length);
    assert.doesNotMatch(JSON.stringify(result), new RegExp(secret));

    const deployed = require(path.join(functionDir, "bundle.cjs")) as { main: typeof main };
    const bundled = await deployed.main({ http: { method: "GET" } }, { env: {} });
    const bundledBody = jsonBody(bundled);
    assert.deepEqual(bundledBody.envNames, names);
    assert.equal(bundledBody.envCount, body.envCount);
    assert.doesNotMatch(JSON.stringify(bundled), new RegExp(secret));
  } finally {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
