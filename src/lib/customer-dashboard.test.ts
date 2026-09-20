import assert from "node:assert/strict";
import test from "node:test";
import {
  formatDuration,
  formatSessionWhen,
  mapBookingList,
  mapSessionDetail,
  mapSessionList,
  requestDashboardBookings,
  requestDashboardSession,
  requestDashboardSessions,
} from "./customer-dashboard.ts";

test("request helpers stay disabled when the public flag is off", async () => {
  const listed = await requestDashboardSessions({
    enabled: false,
    endpoint: "http://127.0.0.1:8791/v1/dashboard",
  });
  assert.equal(listed.status, "disabled");
  const detail = await requestDashboardSession({
    enabled: false,
    endpoint: "",
    id: "demo_session_1",
  });
  assert.equal(detail.status, "disabled");
  const bookings = await requestDashboardBookings({
    enabled: false,
    endpoint: "",
  });
  assert.equal(bookings.status, "disabled");
});

test("in-browser demo catalogue is labelled SAMPLE and does not invent unknown ids", async () => {
  const listed = await requestDashboardSessions({ enabled: true, endpoint: "" });
  assert.equal(listed.status, "ok");
  if (listed.status !== "ok") return;
  assert.equal(listed.data.kind, "demo");
  assert.ok(listed.data.sessions.length > 0);
  for (const session of listed.data.sessions) {
    assert.equal(session.sampleLabel, "SAMPLE");
    assert.match(session.summary, /SAMPLE/);
    assert.match(session.callerDisplay, /demo/i);
  }
  const found = await requestDashboardSession({
    enabled: true,
    endpoint: "",
    id: "demo_session_1",
  });
  assert.equal(found.status, "ok");
  if (found.status === "ok") {
    assert.match(found.data.transcript.turns[0].text, /SAMPLE/);
  }
  const missing = await requestDashboardSession({
    enabled: true,
    endpoint: "",
    id: "live_customer_9",
  });
  assert.equal(missing.status, "error");
  if (missing.status === "error") {
    assert.match(missing.message, /does not invent/);
  }
});

test("in-browser empty store invents no customers or bookings", async () => {
  const listed = await requestDashboardSessions({
    enabled: true,
    endpoint: "",
    catalogKind: "empty",
  });
  assert.equal(listed.status, "ok");
  if (listed.status === "ok") {
    assert.equal(listed.data.kind, "empty");
    assert.deepEqual(listed.data.sessions, []);
    assert.match(listed.data.disclaimer, /does not invent/);
  }
  const bookings = await requestDashboardBookings({
    enabled: true,
    endpoint: "",
    catalogKind: "empty",
  });
  assert.equal(bookings.status, "ok");
  if (bookings.status === "ok") {
    assert.deepEqual(bookings.data.bookings, []);
  }
});

test("mappers drop unlabelled or incomplete rows instead of inventing them", () => {
  assert.equal(mapSessionList(null), null);
  assert.deepEqual(
    mapSessionList({
      ok: true,
      data: {
        kind: "demo",
        disclaimer: "SAMPLE",
        sessions: [
          { id: "x", startedAt: "t", endedAt: "t", summary: "live customer", callerDisplay: "Pat" },
          {
            id: "demo_session_1",
            kind: "demo",
            sampleLabel: "SAMPLE",
            startedAt: "2026-09-18T09:12:00.000Z",
            endedAt: "2026-09-18T09:15:04.000Z",
            durationSeconds: 184,
            direction: "inbound",
            outcome: "ended",
            summary: "SAMPLE — ok",
            callerDisplay: "Sample caller (demo)",
          },
        ],
      },
    })?.sessions.map((row) => row.id),
    ["demo_session_1"],
  );
  assert.equal(
    mapSessionDetail({
      data: {
        session: {
          id: "demo_session_1",
          kind: "demo",
          sampleLabel: "SAMPLE",
          startedAt: "2026-09-18T09:12:00.000Z",
          endedAt: "2026-09-18T09:15:04.000Z",
          outcome: "ended",
          summary: "SAMPLE — ok",
          callerDisplay: "Sample caller (demo)",
        },
        transcript: {
          kind: "demo",
          sampleLabel: "SAMPLE",
          turns: [{ speaker: "caller", text: "unlabelled live chat" }],
        },
      },
    }),
    null,
  );
  assert.deepEqual(
    mapBookingList({
      data: {
        kind: "demo",
        bookings: [{ id: "1", start: "a", end: "b", title: "Booked customer", status: "confirmed" }],
      },
    })?.bookings,
    [],
  );
});

test("format helpers stay UK-readable for sample instants", () => {
  const when = formatSessionWhen("2026-09-18T09:12:00.000Z");
  assert.match(when, /18 Sep/);
  assert.match(when, /2026/);
  assert.match(when, /10:12/);
  assert.equal(formatDuration(184), "3m 04s");
  assert.equal(formatDuration(9), "9s");
});
