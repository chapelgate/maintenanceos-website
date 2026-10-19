import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "./route.ts";

function createRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/enquiry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

test("POST /api/enquiry returns 400 for empty body", async () => {
  const req = createRequest({});
  const res = await POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test("POST /api/enquiry returns 400 for invalid email", async () => {
  const req = createRequest({ email: "not-an-email" });
  const res = await POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test("POST /api/enquiry returns 400 for invalid phone", async () => {
  const req = createRequest({ email: "test@example.co.uk", phone: "abc" });
  const res = await POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test("POST /api/enquiry returns 201 for valid submission", async () => {
  const req = createRequest({
    leadType: "contact",
    email: "test@example.co.uk",
    name: "Test User",
    organisation: "Test Org",
    role: "landlord",
    message: "Test message",
  });
  const res = await POST(req);
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.ok(data.reference);
  assert.equal(data.mode, "accepted");
});

test("POST /api/enquiry returns 201 for minimal valid submission", async () => {
  const req = createRequest({
    leadType: "early_demo",
    email: "minimal@example.co.uk",
  });
  const res = await POST(req);
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.ok(data.reference);
});

test("POST /api/enquiry rejects honeypot field", async () => {
  const req = createRequest({
    leadType: "contact",
    email: "test@example.co.uk",
    website: "http://spam.com",
  });
  const res = await POST(req);
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.mode, "local_stub");
});

test("POST /api/enquiry validates leadType", async () => {
  const req = createRequest({
    leadType: "invalid_type",
    email: "test@example.co.uk",
  });
  const res = await POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});