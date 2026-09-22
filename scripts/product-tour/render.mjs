#!/usr/bin/env node
/**
 * Render the claims-safe product tour to public/media/.
 *
 * Pipeline: CSS storyboard (real /create + how-it-works chrome) →
 * headless Chrome screenshots → ffmpeg H.264 720p.
 * No paid AI video APIs. Higgsfield is not used.
 *
 * Usage:
 *   node scripts/product-tour/render.mjs
 *   node scripts/product-tour/render.mjs --preview   # serve storyboard
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { mkdir, copyFile, readFile, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TOUR_DIR = path.join(ROOT, "scripts/product-tour");
const OUT_DIR = path.join(ROOT, "public/media");
const DURATION = 45;
const FPS = 12;
const WIDTH = 1280;
const HEIGHT = 720;
const MAX_BYTES = 12 * 1024 * 1024;

const CHROME =
  process.env.CHROME_PATH ||
  [
    "/opt/google/chrome/chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/local/bin/google-chrome",
    "/usr/bin/google-chrome",
  ].find((bin) => existsSync(bin)) ||
  "google-chrome";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", ...opts });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

function serveStoryboard() {
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".vtt": "text/vtt; charset=utf-8",
    ".css": "text/css; charset=utf-8",
  };
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      const name = url.pathname === "/" ? "/storyboard.html" : url.pathname;
      const file = path.join(TOUR_DIR, path.normalize(name).replace(/^\/+/, ""));
      if (!file.startsWith(TOUR_DIR)) {
        res.writeHead(403);
        res.end();
        return;
      }
      try {
        const body = await readFile(file);
        res.writeHead(200, {
          "content-type": mime[path.extname(file)] || "application/octet-stream",
        });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const payload = { id, method, params };
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
    });
  }
}

async function connectCdp(port) {
  const deadline = Date.now() + 20000;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => {
        if (!r.ok) throw new Error(`cdp list ${r.status}`);
        return r.json();
      });
      const page = pages.find((item) => item.type === "page") || pages[0];
      if (!page?.webSocketDebuggerUrl) throw new Error("no page target");
      const ws = new WebSocket(page.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        ws.addEventListener("open", resolve, { once: true });
        ws.addEventListener("error", reject, { once: true });
      });
      return new Cdp(ws);
    } catch (err) {
      lastErr = err;
      await wait(200);
    }
  }
  throw lastErr;
}

async function renderFrames(cdp, ffmpegStdin) {
  const total = DURATION * FPS;
  for (let i = 0; i < total; i += 1) {
    const t = i / FPS;
    await cdp.send("Runtime.evaluate", {
      expression: `window.__seek(${t})`,
      returnByValue: true,
    });
    const shot = await cdp.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 82,
      fromSurface: true,
    });
    ffmpegStdin.write(Buffer.from(shot.data, "base64"));
    if (i % 36 === 0) {
      process.stdout.write(`  frame ${i + 1}/${total} (t=${t.toFixed(2)}s)\n`);
    }
  }
}

async function encodeMp4() {
  const mp4 = path.join(OUT_DIR, "product-tour.mp4");
  const poster = path.join(OUT_DIR, "product-tour.poster.webp");
  const vtt = path.join(OUT_DIR, "product-tour.en-GB.vtt");
  await mkdir(OUT_DIR, { recursive: true });
  await copyFile(path.join(TOUR_DIR, "captions.en-GB.vtt"), vtt);

  const { server, port: httpPort } = await serveStoryboard();
  const debugPort = 9300 + Math.floor(Math.random() * 400);
  const profileDir = mkdtempSync(path.join(tmpdir(), "mos-tour-chrome-"));
  const chromeArgs = [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--font-render-hinting=none",
    "--no-first-run",
    "--no-default-browser-check",
    "--password-store=basic",
    `--user-data-dir=${profileDir}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    "--force-device-scale-factor=1",
    `--remote-debugging-port=${debugPort}`,
    "--remote-allow-origins=*",
    `http://127.0.0.1:${httpPort}/storyboard.html`,
  ];
  const chrome = spawn(CHROME, chromeArgs, { stdio: "ignore" });
  let cdp;
  try {
    cdp = await connectCdp(debugPort);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: WIDTH,
      height: HEIGHT,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send("Runtime.evaluate", {
      expression:
        "document.fonts ? document.fonts.ready.then(() => true) : true",
      awaitPromise: true,
      returnByValue: true,
    });
    await wait(250);
    await cdp.send("Runtime.evaluate", {
      expression: "window.__seek(0)",
      returnByValue: true,
    });

    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-y",
        "-f",
        "image2pipe",
        "-vcodec",
        "mjpeg",
        "-framerate",
        String(FPS),
        "-i",
        "-",
        "-vf",
        `scale=${WIDTH}:${HEIGHT}:flags=lanczos`,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-profile:v",
        "high",
        "-preset",
        "medium",
        "-crf",
        "28",
        "-movflags",
        "+faststart",
        "-an",
        mp4,
      ],
      { stdio: ["pipe", "inherit", "inherit"] },
    );
    const ffmpegDone = new Promise((resolve, reject) => {
      ffmpeg.on("error", reject);
      ffmpeg.on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited ${code}`));
      });
    });
    await renderFrames(cdp, ffmpeg.stdin);
    ffmpeg.stdin.end();
    await ffmpegDone;
  } finally {
    try {
      cdp?.ws.close();
    } catch {
      /* ignore */
    }
    chrome.kill("SIGTERM");
    server.close();
    await wait(400);
    try {
      rmSync(profileDir, { recursive: true, force: true, maxRetries: 8 });
    } catch {
      /* chrome may still hold the profile; leftover /tmp is fine */
    }
  }

  await run("ffmpeg", [
    "-y",
    "-i",
    mp4,
    "-ss",
    "5.2",
    "-frames:v",
    "1",
    "-vf",
    `scale=${WIDTH}:${HEIGHT}:flags=lanczos`,
    poster,
  ]);

  const { size } = await stat(mp4);
  const note = [
    `# Product tour media`,
    ``,
    `- Duration: ${DURATION}s · ${WIDTH}×${HEIGHT} · ${FPS} fps · H.264 CRF 28 · no audio track`,
    `- File: public/media/product-tour.mp4 (${(size / (1024 * 1024)).toFixed(2)} MB)`,
    `- Poster: public/media/product-tour.poster.webp (frame at 5.2s)`,
    `- Captions: public/media/product-tour.en-GB.vtt (en-GB)`,
    `- Budget: ~8–12 MB. ${size <= MAX_BYTES ? "Within budget." : `OVER budget (${size} bytes) — re-encode with a higher CRF before commit.`}`,
    `- Regenerated: ${new Date().toISOString()}`,
    ``,
  ].join("\n");
  await writeFile(path.join(TOUR_DIR, "LAST_RENDER.md"), note);
  process.stdout.write(note);
  if (size > MAX_BYTES) {
    process.exitCode = 2;
  }
}

async function preview() {
  const { port } = await serveStoryboard();
  process.stdout.write(
    `Storyboard: http://127.0.0.1:${port}/storyboard.html?preview=1\nCtrl+C to stop.\n`,
  );
}

const previewMode = process.argv.includes("--preview");
if (previewMode) {
  await preview();
} else {
  if (!existsSync(TOUR_DIR)) {
    throw new Error("missing scripts/product-tour");
  }
  await encodeMp4();
}
