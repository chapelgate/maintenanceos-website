import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeHtml, sanitizeJsonLd } from "./sanitize.ts";

test("sanitizeHtml removes script tags from input", () => {
  const dirty = '<p>safe</p><script>alert("xss")</script>';
  const clean = sanitizeHtml(dirty);
  assert.equal(clean, "<p>safe</p>");
});

test("sanitizeHtml removes javascript: URL from links", () => {
  const dirty = '<a href="javascript:alert(1)">click</a>';
  const clean = sanitizeHtml(dirty);
  assert.equal(clean, '<a>click</a>');
});

test("sanitizeHtml allows basic heading tags", () => {
  const dirty = '<h2>Title</h2><h3>Sub</h3>';
  const clean = sanitizeHtml(dirty);
  assert.ok(clean.includes("<h2>"));
  assert.ok(clean.includes("<h3>"));
});

test("sanitizeHtml escapes < characters in JSON-LD output", () => {
  const data = { "@context": "https://schema.org", name: "<test>" };
  const json = sanitizeJsonLd(data);
  assert.ok(json.includes("\\u003c"));
  assert.ok(!json.includes("<"));
});
