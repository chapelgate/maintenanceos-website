import assert from "node:assert/strict";
import test from "node:test";
import {
  allowPublicHttpsUrl,
  assertResolvedAddressesPublic,
  isProbablyPublicHostname,
  isPrivateOrReservedIPv4,
  parseIPv4Literal,
} from "./ssrf.ts";

test("blocks localhost hostnames", () => {
  assert.equal(isProbablyPublicHostname("localhost"), false);
  assert.equal(isProbablyPublicHostname("localhost."), false);
  assert.equal(isProbablyPublicHostname("LOCALHOST"), false);
  assert.equal(allowPublicHttpsUrl("https://localhost/path").ok, false);
  assert.equal(allowPublicHttpsUrl("https://foo.localhost/").ok, false);
});

test("blocks loopback and private IPv4 literals", () => {
  for (const host of [
    "127.0.0.1",
    "127.1.2.3",
    "0.0.0.0",
    "10.0.0.4",
    "192.168.1.10",
    "172.16.0.2",
    "172.31.255.1",
    "169.254.169.254",
    "169.254.1.1",
    "100.64.0.1",
  ]) {
    assert.equal(isProbablyPublicHostname(host), false, host);
    assert.equal(allowPublicHttpsUrl(`https://${host}/`).ok, false, host);
  }
});

test("blocks IPv6 loopback, link-local, ULA, and mapped loopback", () => {
  for (const raw of [
    "https://[::1]/",
    "https://[fe80::1]/",
    "https://[fd12:3456:789a:1::1]/",
    "https://[fc00::1]/",
    "https://[::ffff:127.0.0.1]/",
    "https://[::ffff:10.0.0.1]/",
    "https://[::ffff:7f00:1]/",
  ]) {
    const decision = allowPublicHttpsUrl(raw);
    assert.equal(decision.ok, false, raw);
  }
});

test("blocks cloud metadata hosts", () => {
  for (const host of [
    "metadata.google.internal",
    "metadata.google.internal.",
    "metadata",
    "instance-data",
    "metadata.aws.example.invalid",
  ]) {
    assert.equal(isProbablyPublicHostname(host), false, host);
  }
  assert.equal(
    allowPublicHttpsUrl("https://metadata.google.internal/latest/meta-data")
      .ok,
    false,
  );
});

test("blocks .local / .internal and http or non-https schemes", () => {
  assert.equal(isProbablyPublicHostname("printer.local"), false);
  assert.equal(isProbablyPublicHostname("vault.internal"), false);
  const upgraded = allowPublicHttpsUrl("http://example.com/path");
  assert.equal(upgraded.ok, true);
  if (upgraded.ok) assert.equal(upgraded.url.toString(), "https://example.com/path");
  assert.equal(allowPublicHttpsUrl("ftp://example.com/").ok, false);
  assert.equal(allowPublicHttpsUrl("file:///etc/passwd").ok, false);
});

test("rejects userinfo and invalid URLs", () => {
  assert.equal(
    allowPublicHttpsUrl("https://user:pass@example.com/secret").ok,
    false,
  );
  assert.equal(allowPublicHttpsUrl("not a url").ok, false);
  assert.equal(allowPublicHttpsUrl("").ok, false);
});

test("allows public https hostnames and public IPv4", () => {
  const publicHosts = [
    "https://example.com/",
    "https://www.example.co.uk/about",
    "https://8.8.8.8/",
    "https://1.1.1.1/cdn-cgi/",
  ];
  for (const raw of publicHosts) {
    const decision = allowPublicHttpsUrl(raw);
    assert.equal(decision.ok, true, raw);
    if (decision.ok) {
      assert.equal(decision.url.protocol, "https:");
    }
  }
});

test("parseIPv4Literal rejects short and octal-looking forms", () => {
  assert.equal(parseIPv4Literal("127.1"), null);
  assert.equal(parseIPv4Literal("010.0.0.1"), null);
  assert.deepEqual(parseIPv4Literal("8.8.4.4"), [8, 8, 4, 4]);
  assert.equal(isPrivateOrReservedIPv4(8, 8, 8, 8), false);
  assert.equal(isPrivateOrReservedIPv4(127, 0, 0, 1), true);
});

test("assertResolvedAddressesPublic fail-closes on private or junk", () => {
  assert.equal(assertResolvedAddressesPublic(["8.8.8.8"]).ok, true);
  assert.equal(assertResolvedAddressesPublic(["1.1.1.1", "9.9.9.9"]).ok, true);
  assert.equal(assertResolvedAddressesPublic(["127.0.0.1"]).ok, false);
  assert.equal(assertResolvedAddressesPublic(["10.1.2.3"]).ok, false);
  assert.equal(assertResolvedAddressesPublic(["169.254.169.254"]).ok, false);
  assert.equal(assertResolvedAddressesPublic(["::1"]).ok, false);
  assert.equal(assertResolvedAddressesPublic(["2001:4860:4860::8888"]).ok, true);
  assert.equal(assertResolvedAddressesPublic([]).ok, false);
  assert.equal(assertResolvedAddressesPublic(["not-an-ip"]).ok, false);
  // Mixed public + private is rejected
  assert.equal(assertResolvedAddressesPublic(["8.8.8.8", "10.0.0.1"]).ok, false);
});
