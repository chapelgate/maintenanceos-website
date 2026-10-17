import { spawn } from "node:child_process";
import { createHash, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const MAX_TEXT = 400;
const MAX_BODY = 8_192;
const CACHE_FILES = 200;

function secretMatches(presented, expected) {
  if (!presented || !expected) return false;
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function bearer(header) {
  const match = /^Bearer\s+(\S+)$/.exec(header || "");
  return match ? match[1] : "";
}

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) {
      const error = new Error("too_large");
      error.code = "TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }
  if (size === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function cacheName(text) {
  return createHash("sha256").update(text, "utf8").digest("hex") + ".wav";
}

async function trimCache(dir) {
  const names = await readdir(dir);
  if (names.length <= CACHE_FILES) return;
  const rows = await Promise.all(
    names.map(async (name) => ({ name, mtime: (await stat(path.join(dir, name))).mtimeMs })),
  );
  rows.sort((a, b) => a.mtime - b.mtime);
  const { unlink } = await import("node:fs/promises");
  for (const row of rows.slice(0, rows.length - CACHE_FILES)) {
    await unlink(path.join(dir, row.name)).catch(() => undefined);
  }
}

function runPiper(bin, model, text, outFile, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, ["--model", model, "--output_file", outFile], {
      stdio: ["pipe", "ignore", "pipe"],
    });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("timeout"));
    }, timeoutMs);
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error("piper_exit_" + String(code)));
    });
    child.stdin.end(text);
  });
}

export function startPiperHttp(options = {}) {
  const secret = options.secret ?? process.env.PIPER_TTS_SECRET ?? "";
  const bin = options.bin ?? process.env.PIPER_BIN ?? "piper";
  const model = options.model ?? process.env.PIPER_MODEL ?? "";
  const cacheDir = options.cacheDir ?? process.env.PIPER_CACHE_DIR ?? path.join(tmpdir(), "piper-cache");
  const timeoutMs = options.timeoutMs ?? Number(process.env.PIPER_TIMEOUT_MS || 8_000);
  const voice = options.voice ?? "jenny_dioco";

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (req.method === "GET" && (url.pathname === "/health" || url.pathname === "/v1/voice/piper/health")) {
      send(res, 200, JSON.stringify({ ok: true, engine: "piper", voice }), "application/json");
      return;
    }
    if (req.method !== "POST" || (url.pathname !== "/v1/voice/piper" && url.pathname !== "/")) {
      send(res, 404, JSON.stringify({ ok: false, error: "not_found" }), "application/json");
      return;
    }
    if (!secretMatches(bearer(req.headers.authorization), secret)) {
      send(res, 401, JSON.stringify({ ok: false, error: "unauthorized" }), "application/json");
      return;
    }
    let text = "";
    try {
      const body = await readJson(req);
      text = typeof body.text === "string" ? body.text.trim() : "";
    } catch {
      send(res, 400, JSON.stringify({ ok: false, error: "invalid_json" }), "application/json");
      return;
    }
    if (!text) {
      send(res, 400, JSON.stringify({ ok: false, error: "text_missing" }), "application/json");
      return;
    }
    if (text.length > MAX_TEXT) {
      send(res, 400, JSON.stringify({ ok: false, error: "text_too_long" }), "application/json");
      return;
    }
    try {
      await mkdir(cacheDir, { recursive: true });
      const file = path.join(cacheDir, cacheName(text));
      let wav;
      try {
        wav = await readFile(file);
      } catch {
        wav = null;
      }
      if (!wav || wav.subarray(0, 4).toString("ascii") !== "RIFF") {
        const temp = path.join(cacheDir, cacheName(text) + ".part");
        await runPiper(bin, model, text, temp, timeoutMs);
        wav = await readFile(temp);
        if (wav.subarray(0, 4).toString("ascii") !== "RIFF") {
          send(res, 502, JSON.stringify({ ok: false, error: "piper_unavailable" }), "application/json");
          return;
        }
        await writeFile(file, wav);
        const { unlink } = await import("node:fs/promises");
        await unlink(temp).catch(() => undefined);
        await trimCache(cacheDir);
      }
      send(res, 200, wav, "audio/wav");
    } catch {
      send(res, 503, JSON.stringify({ ok: false, error: "piper_unavailable" }), "application/json");
    }
  });

  const port = options.port ?? Number(process.env.PORT || 8790);
  const host = options.host ?? "0.0.0.0";
  return new Promise((resolve) => {
    server.listen(port, host, () => {
      const address = server.address();
      resolve({
        server,
        port: typeof address === "object" && address ? address.port : port,
        close() {
          return new Promise((done) => server.close(() => done()));
        },
      });
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startPiperHttp().catch(() => {
    process.exitCode = 1;
  });
}
