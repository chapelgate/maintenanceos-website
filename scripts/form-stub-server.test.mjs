import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { beforeEach } from "node:test";
import {
  LEAD_TYPES,
  createFormStubServer,
  corsHeaders,
  successBody,
  validateLead,
  rateLimit,
  rateLimitMap,
  RATE_LIMIT_MAX_PER_WINDOW,
} from "./form-stub-server.mjs";

const validLead = {
  lead_type: "launch_list",
  email: "alex@example.com",
  name: "Alex Example",
  source: "maintenanceos-website",
  public_launch: false,
};

beforeEach(() => {
  rateLimitMap.clear();
});

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

async function withServer(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "form-stub-"));
  const dataFile = path.join(dir, "leads.jsonl");
  const { server } = createFormStubServer({ dataFile });
  const port = await listen(server);
  const base = `http://127.0.0.1:${port}`;
  try {
    return await fn({ base, dataFile });
  } finally {
    await new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("success body never claims email delivery", () => {
  const body = successBody();
  assert.equal(body.ok, true);
  assert.equal(body.mode, "queued_stub");
  assert.equal(body.sends_email, false);
});

test("lead types match the public contract", () => {
  assert.deepEqual(
    [...LEAD_TYPES].sort(),
    ["contact", "create_receptionist", "early_demo", "launch_list"],
  );
});

test("validateLead accepts the four conversion types", () => {
  for (const lead_type of LEAD_TYPES) {
    const result = validateLead({ ...validLead, lead_type });
    assert.equal(result.ok, true);
    assert.equal(result.record.sends_email, false);
  }
});

test("validateLead rejects bad email and unknown type", () => {
  assert.equal(validateLead({ ...validLead, email: "not-an-email" }).ok, false);
  assert.equal(validateLead({ ...validLead, lead_type: "waitlist" }).ok, false);
});

test("honeypot is discarded without recording a lead", () => {
  const result = validateLead({ ...validLead, website: "https://spam.test" });
  assert.equal(result.ok, true);
  assert.equal(result.discarded, true);
});

test("POST /leads stores jsonl and returns queued_stub", async () => {
  await withServer(async ({ base, dataFile }) => {
    const res = await fetch(`${base}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({ ...validLead, lead_type: "early_demo" }),
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:3000");
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.mode, "queued_stub");
    assert.equal(json.sends_email, false);
    assert.equal(JSON.stringify(json).toLowerCase().includes("email was sent"), false);

    const lines = fs.readFileSync(dataFile, "utf8").trim().split("\n");
    assert.equal(lines.length, 1);
    const stored = JSON.parse(lines[0]);
    assert.equal(stored.lead_type, "early_demo");
    assert.equal(stored.email, "[REDACTED]");
    assert.equal(stored.sends_email, false);
  });
});

test("POST /leads create_receptionist type is accepted", async () => {
  await withServer(async ({ base, dataFile }) => {
    const res = await fetch(`${base}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_type: "create_receptionist",
        email: "ops@example.com",
        message:
          "Website-to-receptionist early access request.\nBusiness URL: https://example.com/\nDraft JSON:\n{}",
      }),
    });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).mode, "queued_stub");
    const stored = JSON.parse(fs.readFileSync(dataFile, "utf8").trim());
    assert.equal(stored.lead_type, "create_receptionist");
    assert.match(stored.message, /Business URL: https:\/\/example.com\//);
  });
});

test("POST /leads contact type is accepted", async () => {
  await withServer(async ({ base }) => {
    const res = await fetch(`${base}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_type: "contact",
        email: "ops@example.com",
        message: "General enquiry",
      }),
    });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).mode, "queued_stub");
  });
});

test("OPTIONS preflight is empty 204 with CORS", async () => {
  await withServer(async ({ base }) => {
    const res = await fetch(`${base}/leads`, {
      method: "OPTIONS",
      headers: { Origin: "http://127.0.0.1:3000" },
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get("access-control-allow-methods")?.includes("POST"), true);
  });
});

test("GET /health advertises no email sending", async () => {
  await withServer(async ({ base }) => {
    const res = await fetch(`${base}/health`);
    const json = await res.json();
    assert.equal(res.status, 200);
    assert.equal(json.ok, true);
    assert.equal(json.sends_email, false);
  });
});

test("invalid JSON and unknown path fail closed", async () => {
  await withServer(async ({ base }) => {
    const bad = await fetch(`${base}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(bad.status, 400);
    const missing = await fetch(`${base}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validLead),
    });
    assert.equal(missing.status, 404);
  });
});

test("corsHeaders rejects unlisted origins", () => {
  const h = corsHeaders("https://evil.example.com");
  assert.equal(h["Access-Control-Allow-Origin"], "");
  assert.equal(h.Vary, "Origin");
});

test("corsHeaders accepts configured allow-list origin", () => {
  const h = corsHeaders("https://worksmartos.co.uk");
  assert.equal(h["Access-Control-Allow-Origin"], "https://worksmartos.co.uk");
});

test("corsHeaders accepts localhost dev origins", () => {
  const h = corsHeaders("http://localhost:3000");
  assert.equal(h["Access-Control-Allow-Origin"], "http://localhost:3000");
});

test("rateLimit allows up to max per window then rejects", () => {
  const id = `unit-${Date.now()}`;
  for (let i = 0; i < RATE_LIMIT_MAX_PER_WINDOW; i += 1) {
    assert.equal(rateLimit(id).ok, true);
  }
  const limited = rateLimit(id);
  assert.equal(limited.ok, false);
  assert.equal(typeof limited.retryAfter, "number");
});

test("rateLimit resets after map clear", () => {
  const id = `unit-reset-${Date.now()}`;
  assert.equal(rateLimit(id).ok, true);
  rateLimitMap.delete(id);
  assert.equal(rateLimit(id).ok, true);
});

test("POST /leads rejects non-json content type", async () => {
  await withServer(async ({ base }) => {
    const res = await fetch(`${base}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Origin: "http://localhost:3000",
      },
      body: "not json",
    });
    assert.equal(res.status, 415);
    const json = await res.json();
    assert.equal(json.ok, false);
    assert.match(json.error, /application\/json/i);
  });
});

test("POST /leads rate limits repeated requests", async () => {
  await withServer(async ({ base }) => {
    for (let i = 0; i < RATE_LIMIT_MAX_PER_WINDOW; i += 1) {
      const res = await fetch(`${base}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify(validLead),
      });
      assert.equal(res.status, 200);
    }
    const limited = await fetch(`${base}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify(validLead),
    });
    assert.equal(limited.status, 429);
    assert.ok(limited.headers.get("retry-after"));
    const json = await limited.json();
    assert.equal(json.ok, false);
    assert.equal(json.error, "Rate limited.");
  });
});

test("appendJsonl persists redacted email (masked by handler)", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "form-stub-"));
  const dataFile = path.join(dir, "leads.jsonl");
  const { server } = createFormStubServer({ dataFile });
  const port = await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
  const base = `http://127.0.0.1:${port}`;
  try {
    const res = await fetch(`${base}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
      body: JSON.stringify({ ...validLead, lead_type: "contact", email: "real@example.com" }),
    });
    assert.equal(res.status, 200);
    const lines = fs.readFileSync(dataFile, "utf8").trim().split("\n");
    assert.equal(lines.length, 1);
    const stored = JSON.parse(lines[0]);
    assert.equal(stored.email, "[REDACTED]");
    assert.equal(stored.sends_email, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
