import assert from "node:assert/strict";
import test from "node:test";
import { gzipSync } from "node:zlib";
import http from "node:http";
import { USER_AGENT } from "./extract.ts";
import {
  decodeResponseBodyForText,
  fetchPublicHttps,
  PUBLIC_PAGE_ACCEPT_LANGUAGE,
  publicPageHeaders,
} from "./fetch-safe.ts";
import { ScanError } from "./types.ts";

test("fetchPublicHttps upgrades http to https and rejects private literals without connecting", async () => {
  let fetched = "";
  const get = async (url: URL) => {
    fetched = url.toString();
    throw new Error("connect");
  };
  await assert.rejects(
    () => fetchPublicHttps("http://example.com/contact", { get, lookup: async () => ["203.0.113.1"] }),
    (err: unknown) => err instanceof ScanError && err.code === "fetch_failed",
  );
  assert.equal(fetched, "https://example.com/contact");
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

test("fetchPublicHttps can enforce a same-origin redirect boundary", async () => {
  await assert.rejects(
    () =>
      fetchPublicHttps("https://acme.example/start", {
        allowedOrigin: "https://acme.example",
        lookup: async () => ["203.0.113.9"],
        get: async (url) => ({
          status: 302,
          headers: { location: "https://other.example/final" },
          body: "",
          url,
        }),
      }),
    (err: unknown) =>
      err instanceof ScanError && err.code === "cross_origin_redirect",
  );
});

test("fetchPublicHttps returns HTTP 304 as a terminal conditional response", async () => {
  const response = await fetchPublicHttps("https://acme.example/page", {
    lookup: async () => ["203.0.113.9"],
    get: async (url) => ({
      status: 304,
      headers: { etag: '"v1"' },
      body: "",
      url,
    }),
  });
  assert.equal(response.status, 304);
  assert.equal(response.headers.etag, '"v1"');
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
    "User-Agent": USER_AGENT,
    Accept: "text/html",
    "Accept-Language": PUBLIC_PAGE_ACCEPT_LANGUAGE,
    "X-Respond-With": "html",
  });
  assert.equal(received?.Authorization, undefined);
  assert.equal(received?.Cookie, undefined);
});

test("fetchPublicHttps drops credential headers and sends the honest browser agent", async () => {
  let received: Record<string, string> | undefined;
  await fetchPublicHttps("https://reader.example/page", {
    lookup: async () => ["203.0.113.9"],
    headers: {
      Authorization: "Bearer secret",
      Cookie: "session=secret",
      Host: "evil.example",
    },
    get: async (url, _ip, opts) => {
      received = opts.headers;
      return {
        status: 200,
        headers: { "content-type": "text/html" },
        body: "<html>ok</html>",
        url,
      };
    },
  });
  assert.match(received?.["User-Agent"] ?? "", /Mozilla\/5\.0/);
  assert.match(received?.["User-Agent"] ?? "", /WorkSmartOS-OnboardingScan/);
  assert.match(received?.["User-Agent"] ?? "", /MaintenanceOS-OnboardingScan/);
  assert.match(received?.Accept ?? "", /text\/html/);
  assert.match(received?.["Accept-Language"] ?? "", /en-GB/);
  assert.equal(received?.Authorization, undefined);
  assert.equal(received?.Cookie, undefined);
  assert.equal(received?.Host, undefined);
});

test("mocked server returns 401 for a bot user agent and 200 for the honest browser headers", async () => {
  const server = http.createServer((req, res) => {
    const ua = String(req.headers["user-agent"] ?? "");
    const accept = String(req.headers.accept ?? "");
    const language = String(req.headers["accept-language"] ?? "");
    if (req.headers.authorization || req.headers.cookie) {
      res.writeHead(401, { "content-type": "text/plain" });
      res.end("credentials");
      return;
    }
    const browser =
      ua.includes("Mozilla/5.0") &&
      ua.includes("WorkSmartOS-OnboardingScan") &&
      accept.includes("text/html") &&
      language.toLowerCase().includes("en-gb");
    if (!browser) {
      res.writeHead(401, { "content-type": "text/plain" });
      res.end("bot");
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end("<html><title>Alley Gates</title><body><h1>Alley Gates</h1><p>Public page.</p></body></html>");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  try {
    const bot = await fetch(`http://127.0.0.1:${port}/`, {
      headers: {
        "User-Agent":
          "MaintenanceOS-OnboardingScan/0.1 (+https://github.com/chapelgate/maintenanceos-website; untrusted-data)",
      },
    });
    assert.equal(bot.status, 401);
    assert.equal(await bot.text(), "bot");

    const headers = publicPageHeaders();
    assert.equal("Authorization" in headers, false);
    assert.equal("Cookie" in headers, false);
    const ok = await fetch(`http://127.0.0.1:${port}/`, { headers });
    assert.equal(ok.status, 200);
    assert.match(await ok.text(), /Alley Gates/);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
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

test("invalid gzip is typed separately from decompression limits", () => {
  assert.throws(
    () =>
      decodeResponseBodyForText({
        body: Buffer.from("not-gzip", "utf8"),
        url: new URL("https://acme.example/sitemap.xml.gz"),
        headers: { "content-type": "application/gzip" },
        acceptCompressed: true,
        maxDecompressedBytes: 1024,
      }),
    (err: unknown) =>
      err instanceof ScanError && err.code === "content_decode_failed",
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

