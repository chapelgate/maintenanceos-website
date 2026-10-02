import assert from "node:assert/strict";
import test from "node:test";
import { gzipSync } from "node:zlib";
import { decodeResponseBodyForText, fetchPublicHttps } from "./fetch-safe.ts";
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

test("fetchPublicHttps prefers public IPv4 when DNS also returns IPv6", async () => {
  const seen: string[] = [];
  const res = await fetchPublicHttps("https://dualstack.example/", {
    lookup: async () => ["2a07:7800::131", "185.151.30.131"],
    get: async (url, ip) => {
      seen.push(ip);
      return {
        status: 200,
        headers: { "content-type": "text/html" },
        body: "<html>dual stack ok</html>",
        url,
      };
    },
  });
  assert.equal(res.status, 200);
  assert.deepEqual(seen, ["185.151.30.131"]);
});

test("fetchPublicHttps does not switch to IPv6 after an IPv4 edge auth rejection", async () => {
  const seen: string[] = [];
  const res = await fetchPublicHttps("https://edge-policy.example/", {
    lookup: async () => ["2a07:7800::131", "185.151.30.131"],
    get: async (url, ip) => {
      seen.push(ip);
      if (ip.includes(":")) {
        throw new Error("IPv6 must not be attempted while public IPv4 exists");
      }
      return {
        status: 401,
        headers: { "content-type": "text/html" },
        body: "edge rejected",
        url,
      };
    },
  });
  assert.equal(res.status, 401);
  assert.equal(res.body, "edge rejected");
  assert.deepEqual(seen, ["185.151.30.131"]);
});

test("fetchPublicHttps still supports an IPv6-only public hostname", async () => {
  const seen: string[] = [];
  const res = await fetchPublicHttps("https://ipv6-only.example/", {
    lookup: async () => ["2a07:7800::131"],
    get: async (url, ip) => {
      seen.push(ip);
      return {
        status: 200,
        headers: { "content-type": "text/html" },
        body: "<html>ipv6 only ok</html>",
        url,
      };
    },
  });
  assert.equal(res.status, 200);
  assert.deepEqual(seen, ["2a07:7800::131"]);
});

test("fetchPublicHttps forwards bounded caller headers without allowing Host override", async () => {
  let received: Record<string, string> | undefined;
  const res = await fetchPublicHttps("https://reader.example/page", {
    lookup: async () => ["203.0.113.9"],
    headers: {
      Accept: "text/html",
      "X-Respond-With": "html",
    },
    get: async (url, _ip, opts) => {
      received = opts.headers;
      return {
        status: 200,
        headers: { "content-type": "text/html" },
        body: "<html>reader ok</html>",
        url,
      };
    },
  });
  assert.equal(res.status, 200);
  assert.deepEqual(received, {
    Accept: "text/html",
    "X-Respond-With": "html",
  });
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

test("bounded gzip decoding supports .xml.gz and enforces decompressed size", () => {
  const xml = Buffer.from(
    '<urlset><url><loc>https://acme.example/a</loc></url></urlset>',
    "utf8",
  );
  const compressed = gzipSync(xml);

  const decoded = decodeResponseBodyForText({
    body: compressed,
    url: new URL("https://acme.example/sitemap.xml.gz"),
    headers: { "content-type": "application/gzip" },
    acceptCompressed: true,
    maxDecompressedBytes: 1024,
  });
  assert.equal(decoded.toString("utf8"), xml.toString("utf8"));

  assert.throws(
    () =>
      decodeResponseBodyForText({
        body: compressed,
        url: new URL("https://acme.example/sitemap.xml.gz"),
        headers: { "content-type": "application/gzip" },
        acceptCompressed: true,
        maxDecompressedBytes: 8,
      }),
    (err: unknown) =>
      err instanceof ScanError && err.code === "response_too_large",
  );
});

test("compressed response support is opt-in and propagated only when requested", async () => {
  let defaultAcceptCompressed: boolean | undefined;
  let requestedAcceptCompressed: boolean | undefined;
  let requestedMaxDecompressedBytes: number | undefined;

  await fetchPublicHttps("https://plain.example/", {
    lookup: async () => ["203.0.113.9"],
    get: async (url, _ip, opts) => {
      defaultAcceptCompressed = opts.acceptCompressed;
      return {
        status: 200,
        headers: { "content-type": "text/plain" },
        body: "plain",
        url,
      };
    },
  });

  await fetchPublicHttps("https://gzip.example/sitemap.xml.gz", {
    lookup: async () => ["203.0.113.9"],
    acceptCompressed: true,
    maxDecompressedBytes: 4096,
    get: async (url, _ip, opts) => {
      requestedAcceptCompressed = opts.acceptCompressed;
      requestedMaxDecompressedBytes = opts.maxDecompressedBytes;
      return {
        status: 200,
        headers: { "content-type": "application/xml" },
        body: "<urlset></urlset>",
        url,
      };
    },
  });

  assert.equal(defaultAcceptCompressed, undefined);
  assert.equal(requestedAcceptCompressed, true);
  assert.equal(requestedMaxDecompressedBytes, 4096);
});

