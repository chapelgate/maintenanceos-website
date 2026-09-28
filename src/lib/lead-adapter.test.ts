import assert from "node:assert/strict";
import test from "node:test";
import { createLeadSubmissionId, submitLead } from "./lead-adapter.ts";

const payload = {
  leadType: "create_receptionist" as const,
  email: "person@example.com",
  name: "Person",
  organisation: "Example Ltd",
  message: "reviewed configuration",
  website: "",
  submissionId: "create-test-001",
};

async function withFetch(response: Response, run: (body: Record<string, unknown>) => Promise<void>) {
  const originalFetch = globalThis.fetch;
  let sentBody: Record<string, unknown> = {};
  globalThis.fetch = (async (_input, init) => {
    sentBody = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
    return response;
  }) as typeof fetch;
  try {
    await run(sentBody);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("create submission sends stable id and parses durable receipt", async () => {
  await withFetch(
    new Response(
      JSON.stringify({
        ok: true,
        mode: "accepted",
        reference: "request-123",
        confirmation_email: "accepted",
      }),
      { status: 200 },
    ),
    async (body) => {
      const result = await submitLead(payload);
      assert.equal(body.submission_id, "create-test-001");
      assert.deepEqual(result, {
        ok: true,
        mode: "accepted",
        reference: "request-123",
        confirmationEmail: "accepted",
      });
    },
  );
});

test("durable lead plus failed customer email stays accepted without false email success", async () => {
  await withFetch(
    new Response(
      JSON.stringify({
        detail: "lead recorded; customer confirmation is temporarily unavailable",
      }),
      { status: 503 },
    ),
    async () => {
      const result = await submitLead(payload);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      assert.equal(result.mode, "accepted");
      assert.equal(result.confirmationEmail, "failed");
      assert.match(result.warning ?? "", /recorded/);
    },
  );
});

test("ordinary rejection remains an error", async () => {
  await withFetch(
    new Response(JSON.stringify({ detail: "request rejected" }), { status: 422 }),
    async () => {
      const result = await submitLead(payload);
      assert.deepEqual(result, { ok: false, error: "request rejected" });
    },
  );
});

test("generated submission ids satisfy receiver idempotency shape", () => {
  assert.match(createLeadSubmissionId(), /^create-[A-Za-z0-9-]{8,}$/);
});
