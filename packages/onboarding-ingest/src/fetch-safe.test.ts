import assert from "node:assert/strict";
import test from "node:test";
import { fetchPublicHttps } from "./fetch-safe.ts";
import { ScanError } from "./types.ts";

test("fetchPublicHttps rejects http and private literals without connecting", async () => {
  const get = async () => {
    throw new Error("connect");
  };
  await assert.rejects(
    () => fetchPublicHttps("http://example.com/", { get, lookup: async () => ["203.0.113.1"] }),
    (err: unknown) => err instanceof ScanError && err.code === "http_not_allowed",
  );
  await assert.rejects(
    () =>
      fetchPublicHttps("https://127.0.0.1/", {
        get,
        lookup: async () => ["127.0.0.1"],
      }),
    (err: unknown) => err instanceof ScanError && err.code === "non_public_host",
  );
});

test("fetchPublicHttps re-checks DNS and redirect targets", async () => {
  await assert.rejects(
    () =>
      fetchPublicHttps("https://rebind.example/", {
        lookup: async () => ["10.0.0.5"],
        get: async () => {
          throw new Error("must not connect");
        },
      }),
    (err: unknown) =>
      err instanceof ScanError && err.code === "non_public_resolved_ip",
  );

  await assert.rejects(
    () =>
      fetchPublicHttps("https://ok.example/", {
        lookup: async (hostname) => {
          if (hostname === "ok.example") return ["203.0.113.9"];
          return ["169.254.169.254"];
        },
        get: async (url) => ({
          status: 301,
          headers: { location: "https://metadata.google.internal/" },
          body: "",
          url,
        }),
      }),
    (err: unknown) =>
      err instanceof ScanError &&
      (err.code === "non_public_host" || err.code === "non_public_resolved_ip"),
  );
});

test("fetchPublicHttps returns the body when DNS and HTTPS stay public", async () => {
  const res = await fetchPublicHttps("https://ok.example/about", {
    lookup: async () => ["203.0.113.9"],
    get: async (url, ip) => {
      assert.equal(ip, "203.0.113.9");
      return {
        status: 200,
        headers: { "content-type": "text/html" },
        body: "<html><title>Ok</title></html>",
        url,
      };
    },
  });
  assert.equal(res.status, 200);
  assert.match(res.body, /<title>Ok<\/title>/);
});
