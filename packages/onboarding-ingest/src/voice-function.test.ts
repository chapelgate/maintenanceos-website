import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { main, resetVoiceRateLimitForTests } from "../packages/website/voice/index.ts";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const functionDir = path.resolve(here, "../packages/website/voice");

const SECRET = "eleven-test-key-should-not-leak";
const VOICE_ID = "theatrical-voice-id";

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

test("voice function stays unconfigured without a key or voice ID", async () => {
  resetVoiceRateLimitForTests();
  for (const env of [
    {},
    { ELEVENLABS_API_KEY: SECRET },
    { ELEVENLABS_VOICE_ID: VOICE_ID },
    { ELEVENLABS_API_KEY: "  ", ELEVENLABS_VOICE_ID: "  " },
  ]) {
    const result = await main(event("POST", "Hello"), { env });
    assert.equal(result.statusCode, 503);
    assert.deepEqual(result.body, {
      ok: false,
      error: "voice_not_configured",
      fallback: "browser",
    });
    assert.doesNotMatch(JSON.stringify(result), new RegExp(SECRET));
  }
});

test("voice function calls ElevenLabs with the server voice ID and hides the key", async () => {
  resetVoiceRateLimitForTests();
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(Uint8Array.from([1, 2, 3, 4]), {
      status: 200,
      headers: { "content-type": "audio/mpeg" },
    });
  }) as typeof fetch;

  const result = await main(event("POST", "Good morning"), {
    env: { ELEVENLABS_API_KEY: SECRET, ELEVENLABS_VOICE_ID: VOICE_ID },
    fetchImpl: fetcher,
  });

  assert.equal(result.statusCode, 200);
  const body = result.body as { ok: boolean; contentType: string; audioBase64: string };
  assert.equal(body.ok, true);
  assert.equal(body.contentType, "audio/mpeg");
  assert.deepEqual([...Buffer.from(body.audioBase64, "base64")], [1, 2, 3, 4]);
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0]?.url,
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(VOICE_ID)}`,
  );
  assert.equal(calls[0]?.init?.method, "POST");
  const headers = calls[0]?.init?.headers as Record<string, string>;
  assert.equal(headers["xi-api-key"], SECRET);
  assert.deepEqual(JSON.parse(String(calls[0]?.init?.body)), {
    text: "Good morning",
    model_id: "eleven_multilingual_v2",
  });
  assert.doesNotMatch(JSON.stringify(result.body), new RegExp(SECRET));
  assert.doesNotMatch(JSON.stringify(result.body), new RegExp(VOICE_ID));
});

test("voice function turns an upstream 5xx into a browser fallback", async () => {
  resetVoiceRateLimitForTests();
  const result = await main(event("POST", "Hello", "203.0.113.51"), {
    env: { ELEVENLABS_API_KEY: SECRET, ELEVENLABS_VOICE_ID: VOICE_ID },
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

test("voice function rejects an empty or oversized line before calling ElevenLabs", async () => {
  resetVoiceRateLimitForTests();
  let calls = 0;
  const fetcher = (async () => {
    calls += 1;
    return new Response(null, { status: 200 });
  }) as typeof fetch;
  const env = { ELEVENLABS_API_KEY: SECRET, ELEVENLABS_VOICE_ID: VOICE_ID };
  const empty = await main(event("POST", "   ", "203.0.113.52"), { env, fetchImpl: fetcher });
  const long = await main(event("POST", "a".repeat(401), "203.0.113.52"), { env, fetchImpl: fetcher });
  assert.equal(empty.statusCode, 400);
  assert.equal((empty.body as { error: string }).error, "text_required");
  assert.equal(long.statusCode, 400);
  assert.equal((long.body as { error: string }).error, "text_too_long");
  assert.equal(calls, 0);
});

test("deployed voice artifact is prebuilt and matches the unconfigured fallback", async () => {
  assert.equal(fs.existsSync(path.join(functionDir, "package.json")), false);
  assert.equal(fs.readFileSync(path.join(functionDir, ".include"), "utf8").trim(), "bundle.cjs");
  const project = fs.readFileSync(path.resolve(here, "../project.yml"), "utf8");
  assert.match(project, /name:\s*voice/);
  assert.match(project, /main:\s*main/);

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
