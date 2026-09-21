import assert from "node:assert/strict";
import test from "node:test";
import { createDashboardStore, DEMO_SESSION_IDS } from "./store.ts";
import { isSampleLabeled } from "./types.ts";

test("demo store rows are labelled SAMPLE / DEMO and never look like live customers", () => {
  const store = createDashboardStore("demo");
  const listed = store.listSessions();
  assert.equal(listed.kind, "demo");
  assert.match(listed.disclaimer, /SAMPLE \/ DEMO/);
  assert.match(listed.disclaimer, /not live production/i);
  assert.deepEqual(
    listed.sessions.map((row) => row.id),
    DEMO_SESSION_IDS,
  );
  for (const session of listed.sessions) {
    assert.equal(session.kind, "demo");
    assert.equal(session.sampleLabel, "SAMPLE");
    assert.ok(isSampleLabeled(session));
    assert.match(session.callerDisplay, /demo/i);
    assert.match(session.summary, /SAMPLE/);
  }
});

test("demo transcript is labelled and refuses unknown ids", () => {
  const store = createDashboardStore("demo");
  const found = store.getSession("demo_session_1");
  assert.equal(found.ok, true);
  if (found.ok) {
    assert.equal(found.data.session.id, "demo_session_1");
    assert.equal(found.data.transcript.sampleLabel, "SAMPLE");
    assert.match(found.data.transcript.disclaimer, /SAMPLE transcript/);
    assert.ok(found.data.transcript.turns.length > 0);
    for (const turn of found.data.transcript.turns) {
      assert.match(turn.text, /SAMPLE/);
    }
  }
  const missing = store.getSession("live_customer_1");
  assert.equal(missing.ok, false);
  if (!missing.ok) {
    assert.equal(missing.error, "session_not_found");
    assert.match(missing.message, /does not invent/);
  }
});

test("empty store invents no sessions, transcripts, or bookings", () => {
  const store = createDashboardStore("empty");
  const listed = store.listSessions();
  assert.equal(listed.kind, "empty");
  assert.deepEqual(listed.sessions, []);
  assert.match(listed.disclaimer, /does not invent/);
  const bookings = store.listBookings();
  assert.deepEqual(bookings.bookings, []);
  assert.match(bookings.disclaimer, /does not invent/);
  const missing = store.getSession("demo_session_1");
  assert.equal(missing.ok, false);
  if (!missing.ok) {
    assert.equal(missing.error, "session_not_found");
  }
});

test("demo bookings stub is labelled SAMPLE and uses the mock calendar shape", () => {
  const store = createDashboardStore("demo");
  const listed = store.listBookings();
  assert.ok(listed.bookings.length > 0);
  for (const booking of listed.bookings) {
    assert.equal(booking.kind, "demo");
    assert.equal(booking.sampleLabel, "SAMPLE");
    assert.equal(booking.provider, "mock");
    assert.match(booking.title, /SAMPLE/);
    assert.match(booking.note, /Not a live phone booking/);
    assert.ok(booking.id);
    assert.ok(booking.start);
    assert.ok(booking.end);
  }
});
