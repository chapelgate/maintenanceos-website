import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = fs.readFileSync(path.join(ROOT, "src/lib/browser-voice.ts"), "utf8");

test("browser-voice exports BrowserVoiceSupport type", () => {
  assert.match(src, /export type BrowserVoiceSupport/);
});

test("browser-voice exports selectPreferredBrowserVoice function", () => {
  assert.match(src, /export function selectPreferredBrowserVoice/);
});

test("browser-voice exports browserVoiceSupport function", () => {
  assert.match(src, /export function browserVoiceSupport/);
});

test("browser-voice exports startBrowserSpeechRecognition function", () => {
  assert.match(src, /export function startBrowserSpeechRecognition/);
});

test("browser-voice exports BrowserRecognitionSession type", () => {
  assert.match(src, /export type BrowserRecognitionSession/);
});

test("browser-voice exports speakBrowserText function", () => {
  assert.match(src, /export async function speakBrowserText/);
});
