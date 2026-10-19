import assert from "node:assert/strict";
import test from "node:test";
import { processEnquiry } from "./enquiry-processor.ts";

test("processEnquiry returns 400 for empty body", async () => {
  const { status, body } = await processEnquiry({});
  assert.equal(status, 400);
  assert.ok(body.error);
});

test("processEnquiry returns 400 for invalid email", async () => {
  const { status, body } = await processEnquiry({ email: "not-an-email" });
  assert.equal(status, 400);
  assert.ok(body.error);
});

test("processEnquiry returns 400 for invalid phone", async () => {
  const { status, body } = await processEnquiry({
    email: "test@example.co.uk",
    phone: "abc",
  });
  assert.equal(status, 400);
  assert.ok(body.error);
});

test("processEnquiry returns 201 for valid submission", async () => {
  const { status, body } = await processEnquiry({
    leadType: "contact",
    email: "test@example.co.uk",
    name: "Test User",
    organisation: "Test Org",
    role: "landlord",
    message: "Test message",
  });
  assert.equal(status, 201);
  assert.equal(body.ok, true);
  assert.ok(body.reference);
  assert.equal(body.mode, "accepted");
});

test("processEnquiry returns 201 for minimal valid submission", async () => {
  const { status, body } = await processEnquiry({
    leadType: "early_demo",
    email: "minimal@example.co.uk",
  });
  assert.equal(status, 201);
  assert.equal(body.ok, true);
  assert.ok(body.reference);
});

test("processEnquiry rejects honeypot field", async () => {
  const { status, body } = await processEnquiry({
    leadType: "contact",
    email: "test@example.co.uk",
    website: "http://spam.com",
  });
  assert.equal(status, 201);
  assert.equal(body.ok, true);
  assert.equal(body.mode, "local_stub");
});

test("processEnquiry validates leadType", async () => {
  const { status, body } = await processEnquiry({
    leadType: "invalid_type",
    email: "test@example.co.uk",
  });
  assert.equal(status, 400);
  assert.ok(body.error);
});

test("processEnquiry validates phone digit count", async () => {
  const { status, body } = await processEnquiry({
    leadType: "contact",
    email: "test@example.co.uk",
    phone: "123",
  });
  assert.equal(status, 400);
  assert.ok(body.error);
});

test("processEnquiry accepts valid phone formats", async () => {
  const { status, body } = await processEnquiry({
    leadType: "contact",
    email: "test@example.co.uk",
    phone: "+44 7700 900123",
  });
  assert.equal(status, 201);
  assert.equal(body.ok, true);
});