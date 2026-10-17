import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { startPiperHttp } from "../deploy/piper-tts/server.mjs";

test("piper http requires the shared secret, caches a wav, and stays up when synthesis fails", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "piper-http-"));
  const bin = path.join(root, "fake-piper.sh");
  const model = path.join(root, "voice.onnx");
  await writeFile(model, "model");
  await writeFile(
    bin,
    "#!/bin/sh\n" +
      "out=\n" +
      "while [ $# -gt 0 ]; do\n" +
      "  if [ \"$1\" = \"--output_file\" ]; then out=$2; shift 2; continue; fi\n" +
      "  shift\n" +
      "done\n" +
      "cat >\"$out\"\n",
    { mode: 0o755 },
  );
  const cache = path.join(root, "cache");
  const started = await startPiperHttp({
    port: 0,
    host: "127.0.0.1",
    secret: "piper-test-secret",
    bin,
    model,
    cacheDir: cache,
    timeoutMs: 2_000,
  });
  const base = `http://127.0.0.1:${started.port}`;
  try {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true, engine: "piper", voice: "jenny_dioco" });

    const open = await fetch(`${base}/v1/voice/piper`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Hello" }),
    });
    assert.equal(open.status, 401);

    const calls = [];
    const original = bin;
    await writeFile(
      original,
      "#!/bin/sh\n" +
        "out=\n" +
        "while [ $# -gt 0 ]; do\n" +
        "  if [ \"$1\" = \"--output_file\" ]; then out=$2; shift 2; continue; fi\n" +
        "  shift\n" +
        "done\n" +
        "printf 'RIFF' >\"$out\"\n" +
        "cat >>\"$out\"\n",
      { mode: 0o755 },
    );
    const first = await fetch(`${base}/v1/voice/piper`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer piper-test-secret",
      },
      body: JSON.stringify({ text: "Hello from the desk" }),
    });
    assert.equal(first.status, 200);
    assert.match(first.headers.get("content-type") ?? "", /^audio\/wav/);
    const bytes = Buffer.from(await first.arrayBuffer());
    assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");

    await writeFile(original, "#!/bin/sh\nexit 9\n", { mode: 0o755 });
    const second = await fetch(`${base}/v1/voice/piper`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer piper-test-secret",
      },
      body: JSON.stringify({ text: "Hello from the desk" }),
    });
    assert.equal(second.status, 200);
    assert.equal(Buffer.from(await second.arrayBuffer()).equals(bytes), true);
    calls.push("cached");
    assert.deepEqual(calls, ["cached"]);
  } finally {
    await started.close();
    await rm(root, { recursive: true, force: true });
  }
});
