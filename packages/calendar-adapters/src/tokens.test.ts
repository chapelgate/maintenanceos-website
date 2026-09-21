import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  createFileTokenStore,
  createMemoryTokenStore,
  createTokenStoreFromEnv,
  parseGoogleStoredTokens,
} from "./tokens.ts";

test("memory token store round-trips a google refresh token", async () => {
  const store = createMemoryTokenStore();
  assert.equal(await store.get("google"), null);
  await store.set({
    provider: "google",
    refreshToken: "rt-1",
    accessToken: "at-1",
    calendarId: "primary",
  });
  const stored = await store.get("google");
  assert.equal(stored?.refreshToken, "rt-1");
  assert.equal(stored?.accessToken, "at-1");
  await store.clear("google");
  assert.equal(await store.get("google"), null);
});

test("parseGoogleStoredTokens refuses empty refresh tokens", () => {
  assert.equal(parseGoogleStoredTokens({ refreshToken: "  " }), null);
  assert.equal(parseGoogleStoredTokens({ refreshToken: "ok" })?.refreshToken, "ok");
});

test("file token store writes gitignored-shaped JSON without inventing tokens", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "mos-cal-tokens-"));
  const file = path.join(dir, "google-calendar-tokens.json");
  const store = createFileTokenStore(file);
  assert.equal(await store.get("google"), null);
  await store.set({ provider: "google", refreshToken: "file-rt" });
  const stored = await store.get("google");
  assert.equal(stored?.refreshToken, "file-rt");
  const raw = JSON.parse(await readFile(file, "utf8")) as { google?: { refreshToken?: string } };
  assert.equal(raw.google?.refreshToken, "file-rt");
  await store.clear("google");
  assert.equal(await store.get("google"), null);
});

test("createTokenStoreFromEnv uses file when GOOGLE_CALENDAR_TOKEN_FILE is set", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "mos-cal-tokens-"));
  const file = path.join(dir, "tokens.json");
  const store = createTokenStoreFromEnv({ GOOGLE_CALENDAR_TOKEN_FILE: file });
  await store.set({ provider: "google", refreshToken: "env-file" });
  const again = createTokenStoreFromEnv({ GOOGLE_CALENDAR_TOKEN_FILE: file });
  assert.equal((await again.get("google"))?.refreshToken, "env-file");
});
