import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCreateLeadMessage,
  hostnameBusinessHint,
  mapScanResponse,
  normalisePublicUrl,
} from "./onboarding-create.ts";

test("normalisePublicUrl accepts public http(s) and rejects junk", () => {
  assert.equal(normalisePublicUrl("example.co.uk"), "https://example.co.uk/");
  assert.equal(
    normalisePublicUrl("https://trades.example.com/contact"),
    "https://trades.example.com/contact",
  );
  assert.equal(normalisePublicUrl("localhost"), null);
  assert.equal(normalisePublicUrl("not a url"), null);
  assert.equal(normalisePublicUrl(""), null);
});

test("hostnameBusinessHint uses the first label only", () => {
  assert.equal(
    hostnameBusinessHint("https://www.acme-plumbing.co.uk/"),
    "acme plumbing",
  );
  assert.equal(hostnameBusinessHint("https://example.com"), "example");
});

test("mapScanResponse never invents fields", () => {
  assert.deepEqual(mapScanResponse(null), {});
  assert.deepEqual(mapScanResponse({ ok: true }), {});
  assert.deepEqual(mapScanResponse({ businessName: 12, greeting: "" }), {});
  assert.deepEqual(
    mapScanResponse({
      businessName: "Acme",
      extra: "ignore me",
      faqs: "  Do you cover London?  ",
    }),
    { businessName: "Acme", faqs: "Do you cover London?" },
  );
  assert.deepEqual(
    mapScanResponse({
      draft: { hours: "Mon–Fri 08:00–17:00", services: "Boilers" },
    }),
    { hours: "Mon–Fri 08:00–17:00", services: "Boilers" },
  );
});

test("buildCreateLeadMessage includes URL and draft JSON", () => {
  const message = buildCreateLeadMessage({
    businessUrl: "https://example.com/",
    scanNote: "not_configured_queued",
    draft: {
      businessName: "example",
      greeting: "",
      hours: "",
      services: "",
      faqs: "",
    },
  });
  assert.match(message, /Business URL: https:\/\/example.com\//);
  assert.match(message, /not_configured_queued/);
  assert.match(message, /"businessName": "example"/);
});
