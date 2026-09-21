import assert from "node:assert/strict";
import test from "node:test";
import {
  createMemoryOauthStateStore,
  exchangeAuthorizationCode,
  googleAuthorizationUrl,
  googleClientFromEnv,
  googleRedirectUriFromEnv,
  resolveGoogleCredentials,
} from "./oauth.ts";
import { handleGoogleOAuthCallback, handleGoogleOAuthStart } from "./oauth-http.ts";
import { createMemoryTokenStore } from "./tokens.ts";

test("googleAuthorizationUrl includes state, offline access, and callback path", () => {
  const url = googleAuthorizationUrl("cid", "http://127.0.0.1:8789/oauth/google/callback", {
    state: "abc",
  });
  assert.match(url, /accounts\.google\.com/);
  assert.match(url, /access_type=offline/);
  assert.match(url, /calendar\.events/);
  assert.match(url, /state=abc/);
  assert.match(url, /oauth%2Fgoogle%2Fcallback/);
});

test("googleRedirectUriFromEnv defaults to loopback callback", () => {
  assert.equal(
    googleRedirectUriFromEnv({}),
    "http://127.0.0.1:8789/oauth/google/callback",
  );
  assert.equal(
    googleRedirectUriFromEnv({ CALENDAR_ADAPTERS_PORT: "8799" }),
    "http://127.0.0.1:8799/oauth/google/callback",
  );
  assert.equal(
    googleRedirectUriFromEnv({ GOOGLE_CALENDAR_REDIRECT_URI: "http://127.0.0.1:9/cb" }),
    "http://127.0.0.1:9/cb",
  );
});

test("googleClientFromEnv is null without client id/secret", () => {
  assert.equal(googleClientFromEnv({}), null);
  assert.equal(
    googleClientFromEnv({ GOOGLE_CALENDAR_CLIENT_ID: "cid" }),
    null,
  );
  const client = googleClientFromEnv({
    GOOGLE_CALENDAR_CLIENT_ID: "cid",
    GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
  });
  assert.equal(client?.clientId, "cid");
  assert.equal(client?.calendarId, "primary");
});

test("resolveGoogleCredentials prefers env refresh then token store", async () => {
  const store = createMemoryTokenStore({
    provider: "google",
    refreshToken: "stored",
    calendarId: "stored-cal",
  });
  assert.equal(await resolveGoogleCredentials({}, store), null);
  const fromStore = await resolveGoogleCredentials(
    {
      GOOGLE_CALENDAR_CLIENT_ID: "cid",
      GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
    },
    store,
  );
  assert.equal(fromStore?.refreshToken, "stored");
  assert.equal(fromStore?.calendarId, "stored-cal");
  const fromEnv = await resolveGoogleCredentials(
    {
      GOOGLE_CALENDAR_CLIENT_ID: "cid",
      GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
      GOOGLE_CALENDAR_REFRESH_TOKEN: "env-rt",
      GOOGLE_CALENDAR_CALENDAR_ID: "primary",
    },
    store,
  );
  assert.equal(fromEnv?.refreshToken, "env-rt");
  assert.equal(fromEnv?.calendarId, "primary");
});

test("exchangeAuthorizationCode requires a refresh_token", async () => {
  const fetchFn: typeof fetch = async () =>
    new Response(JSON.stringify({ access_token: "only-access" }), { status: 200 });
  const failed = await exchangeAuthorizationCode({
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: "cid",
    clientSecret: "sec",
    code: "code-1",
    redirectUri: "http://127.0.0.1:8789/oauth/google/callback",
    fetch: fetchFn,
  });
  assert.equal(failed.ok, false);
  if (!failed.ok) {
    assert.equal(failed.error, "auth_failed");
    assert.match(failed.message, /No token was stored/);
  }

  const okFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        access_token: "at",
        refresh_token: "rt",
        expires_in: 3600,
      }),
      { status: 200 },
    );
  const ok = await exchangeAuthorizationCode({
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: "cid",
    clientSecret: "sec",
    code: "code-2",
    redirectUri: "http://127.0.0.1:8789/oauth/google/callback",
    fetch: okFetch,
  });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.data.refreshToken, "rt");
    assert.equal(ok.data.accessToken, "at");
  }
});

test("oauth state store rejects reuse", () => {
  const store = createMemoryOauthStateStore();
  const state = store.issue();
  assert.equal(store.consume(state), true);
  assert.equal(store.consume(state), false);
  assert.equal(store.consume("nope"), false);
});

test("oauth start is 503 when disabled or not configured", () => {
  const store = createMemoryTokenStore();
  const disabled = handleGoogleOAuthStart({
    adaptersEnabled: false,
    env: {
      GOOGLE_CALENDAR_CLIENT_ID: "cid",
      GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
    },
    tokenStore: store,
  });
  assert.equal(disabled.status, 503);
  assert.match(disabled.body, /calendar_disabled/);

  const missing = handleGoogleOAuthStart({
    adaptersEnabled: true,
    env: {},
    tokenStore: store,
  });
  assert.equal(missing.status, 503);
  assert.match(missing.body, /not_configured/);
});

test("oauth start redirects to Google with CSRF state", () => {
  const stateStore = createMemoryOauthStateStore();
  const result = handleGoogleOAuthStart({
    adaptersEnabled: true,
    env: {
      GOOGLE_CALENDAR_CLIENT_ID: "cid",
      GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
    },
    tokenStore: createMemoryTokenStore(),
    oauthStateStore: stateStore,
  });
  assert.equal(result.status, 302);
  const location = result.headers.Location;
  assert.ok(location);
  assert.match(location, /accounts\.google\.com/);
  const url = new URL(location);
  const state = url.searchParams.get("state");
  assert.ok(state);
  assert.equal(stateStore.consume(state), true);
});

test("oauth callback stores refresh token from Google and refuses missing refresh", async () => {
  const stateStore = createMemoryOauthStateStore();
  const tokenStore = createMemoryTokenStore();
  const env = {
    GOOGLE_CALENDAR_CLIENT_ID: "cid",
    GOOGLE_CALENDAR_CLIENT_SECRET: "sec",
  };
  const state = stateStore.issue();
  const fetchFn: typeof fetch = async () =>
    new Response(
      JSON.stringify({ access_token: "at", refresh_token: "rt-live", expires_in: 3600 }),
      { status: 200 },
    );
  const ok = await handleGoogleOAuthCallback(
    `/oauth/google/callback?code=abc&state=${state}`,
    {
      adaptersEnabled: true,
      env,
      tokenStore,
      oauthStateStore: stateStore,
      fetch: fetchFn,
    },
  );
  assert.equal(ok.status, 200);
  assert.match(ok.body, /token stored locally/i);
  assert.match(ok.body, /not a live Google Calendar product on staging/i);
  assert.equal((await tokenStore.get("google"))?.refreshToken, "rt-live");

  const reused = await handleGoogleOAuthCallback(
    `/oauth/google/callback?code=abc&state=${state}`,
    {
      adaptersEnabled: true,
      env,
      tokenStore,
      oauthStateStore: stateStore,
      fetch: fetchFn,
    },
  );
  assert.equal(reused.status, 400);
  assert.match(reused.body, /invalid state/i);
});
