import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const FORBIDDEN = [
  /headset/i,
  /call[- ]centre/i,
  /call[- ]center/i,
  /beats Fonio/i,
  /always-on live phone is (live|ready|available)/i,
  /commercially generally available now/i,
  /your number is ready/i,
];

test("product-tour media files exist and stay claims-safe", () => {
  const mp4 = path.join(ROOT, "public/media/product-tour.mp4");
  const poster = path.join(ROOT, "public/media/product-tour.poster.webp");
  const vttPath = path.join(ROOT, "public/media/product-tour.en-GB.vtt");
  const vo = path.join(ROOT, "scripts/product-tour/vo/desmond.wav");
  assert.equal(fs.existsSync(mp4), true, "missing product-tour.mp4");
  assert.equal(fs.existsSync(poster), true, "missing product-tour.poster.webp");
  assert.equal(fs.existsSync(vttPath), true, "missing product-tour.en-GB.vtt");
  assert.equal(fs.existsSync(vo), true, "missing scripts/product-tour/vo/desmond.wav");

  const mp4Size = fs.statSync(mp4).size;
  assert.ok(mp4Size > 400_000, `mp4 too small for voiced remux (${mp4Size})`);
  assert.ok(
    mp4Size <= 5 * 1024 * 1024,
    `mp4 over 5 MB AAC soft ceiling (${mp4Size}) — drop VO bitrate before shipping`,
  );
  const header = fs.readFileSync(mp4, { encoding: null, flag: "r" }).subarray(4, 12);
  assert.equal(header.toString("ascii").includes("ftyp"), true);
  const atoms = fs.readFileSync(mp4);
  assert.equal(atoms.includes(Buffer.from("mp4a")), true, "mp4 missing AAC audio track");
  const wavHeader = fs.readFileSync(vo).subarray(0, 4).toString("ascii");
  assert.equal(wavHeader, "RIFF");

  const vtt = read("public/media/product-tour.en-GB.vtt");
  const story = read("scripts/product-tour/storyboard.html");
  const captionsSrc = read("scripts/product-tour/captions.en-GB.vtt");
  assert.match(vtt, /^WEBVTT/m);
  assert.match(vtt, /Paste a public company website URL/);
  assert.match(vtt, /do not invent extracted content/);
  assert.match(vtt, /Empty hours and services stay empty/);
  assert.match(vtt, /rules own safety and money/i);
  assert.match(vtt, /999 guidance — never 911/);
  assert.match(vtt, /not a public always-on live phone line/i);
  assert.equal(vtt, captionsSrc);

  assert.match(story, /your-business\.co\.uk/);
  assert.match(story, /Crawl queued/);
  assert.match(story, /Empty — not on file/);
  assert.match(story, /sandbox_knowledge_pack/);
  assert.match(story, /Rules own safety and money/);
  assert.match(story, /UK 999 — never 911/);
  assert.match(story, /Not a public always-on live phone/);
  assert.doesNotMatch(story, /intake-orb|SiriOrb/);
  for (const src of [vtt, story, captionsSrc]) {
    for (const pattern of FORBIDDEN) {
      assert.doesNotMatch(src, pattern);
    }
  }
});

test("product-tour player is click-to-play and static-export safe", () => {
  const player = read("src/components/ProductTour.tsx");
  const lib = read("src/lib/product-tour.ts");
  const css = read("src/app/globals.css");
  const hiw = read("src/app/how-it-works/page.tsx");
  const home = read("src/app/page.tsx");
  const config = read("next.config.ts");
  const csp = read("src/lib/static-security-headers.ts");

  assert.doesNotMatch(player, /^["']use client["']/);
  assert.match(player, /preload="none"/);
  assert.match(player, /<video/);
  assert.match(player, /controls/);
  assert.doesNotMatch(player, /\bautoPlay\b/);
  assert.doesNotMatch(player, /\sautoplay[\s>=]/);
  assert.doesNotMatch(player, /\smuted[\s>=]/);
  assert.match(lib, /product-tour\.mp4/);
  assert.match(lib, /product-tour\.poster\.webp/);
  assert.match(lib, /product-tour\.en-GB\.vtt/);
  assert.match(player, /PRODUCT_TOUR\.src/);
  assert.match(player, /PRODUCT_TOUR\.poster/);
  assert.match(player, /PRODUCT_TOUR\.captions/);
  assert.match(player, /srcLang="en-GB"/);
  assert.match(lib, /Product tour · pre-launch/);
  assert.match(player, /PRODUCT_TOUR\.caption/);
  assert.match(lib, /watchHref: "\/how-it-works\/#product-tour"/);
  assert.match(lib, /watchLabel: "Watch product tour"/);

  assert.match(css, /\.product-tour-card/);
  assert.match(css, /border-radius: 12px/);
  assert.match(css, /accent-color: var\(--color-accent\)/);

  assert.match(hiw, /id="product-tour"/);
  assert.match(hiw, /<ProductTour/);
  assert.match(hiw, /Click to play/);
  assert.match(hiw, /not a live phone demo/i);
  assert.doesNotMatch(hiw, /<video/);

  assert.match(home, /ProductTourWatchLink/);
  assert.doesNotMatch(home, /<video/);
  assert.doesNotMatch(home, /ProductTour \/>/);

  assert.match(config, /output:\s*["']export["']/);
  assert.match(csp, /media-src 'self'/);

  const render = read("scripts/product-tour/render.mjs");
  const notes = read("scripts/product-tour/README.md");
  assert.match(render, /--remux/);
  assert.match(render, /vo\/desmond\.wav/);
  assert.match(render, /apad=whole_dur=/);
  assert.doesNotMatch(render, /atempo|rubberband|asetrate/);
  assert.match(notes, /product-tour:remux/);
  assert.match(notes, /do not time-stretch/i);
});
