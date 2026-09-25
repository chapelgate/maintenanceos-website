"use client";

import { useEffect, useId, useState } from "react";
import { siteConfig } from "@/config/site";
import {
  formatBookingWindow,
  formatDuration,
  formatSessionWhen,
  outcomeLabel,
  requestDashboardBookings,
  requestDashboardSession,
  requestDashboardSessions,
  type CallSession,
  type DashboardBooking,
  type DashboardCatalogKind,
  type SessionDetail,
} from "@/lib/customer-dashboard";

type LoadState = "idle" | "loading" | "ready" | "error";

/**
 * Honest customer dashboard. Default build: coming / under testing.
 * Flag on: SAMPLE / DEMO catalogue or an empty store that invents nothing.
 */
export function CustomerDashboard({
  demoMode = false,
}: {
  demoMode?: boolean;
} = {}) {
  const enabled = siteConfig.customerDashboardEnabled || demoMode;
  const endpoint = demoMode ? "" : siteConfig.customerDashboardEndpoint.trim();
  const usesCompanion = Boolean(endpoint);
  const [catalogKind, setCatalogKind] = useState<DashboardCatalogKind>("demo");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [detailState, setDetailState] = useState<LoadState>("idle");
  const [sessions, setSessions] = useState<CallSession[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const statusId = useId();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoadState("loading");
    setError(null);
    setDetail(null);
    setSelectedId("");
    void Promise.all([
      requestDashboardSessions({ enabled, endpoint, catalogKind }),
      requestDashboardBookings({ enabled, endpoint, catalogKind }),
    ]).then(([sessionOutcome, bookingOutcome]) => {
      if (cancelled) return;
      if (sessionOutcome.status === "disabled") {
        setLoadState("idle");
        return;
      }
      if (sessionOutcome.status === "error") {
        setSessions([]);
        setBookings([]);
        setError(sessionOutcome.message);
        setLoadState("error");
        return;
      }
      setSessions(sessionOutcome.data.sessions);
      setDisclaimer(sessionOutcome.data.disclaimer);
      if (demoMode && sessionOutcome.data.sessions[0]) {
        setSelectedId(sessionOutcome.data.sessions[0].id);
      }
      if (bookingOutcome.status === "ok") {
        setBookings(bookingOutcome.data.bookings);
      } else if (bookingOutcome.status === "error") {
        setBookings([]);
        setError(bookingOutcome.message);
      }
      setLoadState("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, endpoint, catalogKind, demoMode]);

  useEffect(() => {
    if (!enabled || !selectedId) {
      setDetail(null);
      setDetailState("idle");
      return;
    }
    let cancelled = false;
    setDetailState("loading");
    void requestDashboardSession({
      enabled,
      endpoint,
      id: selectedId,
      catalogKind,
    }).then((outcome) => {
      if (cancelled) return;
      if (outcome.status === "ok") {
        setDetail(outcome.data);
        setDetailState("ready");
        return;
      }
      setDetail(null);
      setDetailState("error");
      setError(
        outcome.status === "disabled"
          ? "The customer dashboard is off in this build."
          : outcome.message,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, endpoint, selectedId, catalogKind]);

  if (!enabled) {
    return (
      <section
        className="rounded-md border border-border bg-surface p-5"
        data-customer-dashboard="off"
        aria-labelledby="dashboard-coming-heading"
      >
        <h2
          id="dashboard-coming-heading"
          className="text-base font-semibold text-ink"
        >
          Customer dashboard — coming / under testing
        </h2>
        <p className="mt-2 text-sm text-muted">
          Call history, transcripts, and booking stubs live in{" "}
          <code className="text-xs">packages/customer-dashboard</code> behind{" "}
          <code className="text-xs">NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED=false</code>{" "}
          (default off). This page is not a live customer portal and does not
          show production call metrics.
        </p>
      </section>
    );
  }

  return (
    <div
      className="space-y-6"
      data-customer-dashboard="on"
      data-dashboard-source={usesCompanion ? "companion" : "browser-mock"}
      data-dashboard-catalog={catalogKind}
    >
      <section
        className="rounded-md border border-dashed border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-5"
        aria-labelledby="dashboard-demo-banner"
      >
        <h2
          id="dashboard-demo-banner"
          className="text-base font-semibold text-[var(--color-warning-text)]"
        >
          SAMPLE / DEMO — not live production metrics
        </h2>
        <p className="mt-2 text-sm text-[var(--color-warning-text)]">
          {demoMode
            ? "This public demonstration uses the existing labelled in-browser SAMPLE catalogue."
            : "The dashboard flag is on in this build only."}{" "}
          {usesCompanion
            ? "Rows come from the companion service (SAMPLE catalogue or empty store — whatever that process was started with)."
            : "No dashboard endpoint is configured, so this view uses an in-browser mock."}{" "}
          Nothing here is a live customer, a production KPI, or a telephony
          recording.
        </p>
        {!usesCompanion && !demoMode ? (
          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-ink">
              Local store
            </legend>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-ink">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="dashboard-catalog"
                  value="demo"
                  checked={catalogKind === "demo"}
                  onChange={() => setCatalogKind("demo")}
                />
                Labelled SAMPLE catalogue
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="dashboard-catalog"
                  value="empty"
                  checked={catalogKind === "empty"}
                  onChange={() => setCatalogKind("empty")}
                />
                Empty store (no invented customers)
              </label>
            </div>
          </fieldset>
        ) : null}
      </section>

      <p id={statusId} className="text-sm text-muted" aria-live="polite">
        {loadState === "loading" ? "Loading dashboard store…" : null}
        {loadState === "error" ? error : null}
        {loadState === "ready" ? disclaimer : null}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-md border border-border bg-surface p-5"
          aria-labelledby="dashboard-history-heading"
        >
          <h2
            id="dashboard-history-heading"
            className="text-base font-semibold text-ink"
          >
            Call history (SAMPLE)
          </h2>
          {loadState === "ready" && sessions.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No sample sessions in this store. This page does not invent
              customers or live call history.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {sessions.map((session) => {
                const selected = selectedId === session.id;
                return (
                  <li key={session.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(session.id)}
                      className={`w-full rounded-md border px-3 py-3 text-left text-sm transition-colors ${
                        selected
                          ? "border-accent bg-accent-subtle text-ink"
                          : "border-border bg-paper text-ink hover:border-accent"
                      }`}
                      aria-pressed={selected}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="rounded bg-[var(--color-warning-bg)] px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-warning-text)]">
                          {session.sampleLabel}
                        </span>
                        <span className="font-medium">{session.callerDisplay}</span>
                      </span>
                      <span className="mt-1 block text-muted">
                        {formatSessionWhen(session.startedAt)} ·{" "}
                        {formatDuration(session.durationSeconds)} ·{" "}
                        {outcomeLabel(session.outcome)}
                      </span>
                      <span className="mt-1 block">{session.summary}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section
          className="rounded-md border border-border bg-surface p-5"
          aria-labelledby="dashboard-bookings-heading"
        >
          <h2
            id="dashboard-bookings-heading"
            className="text-base font-semibold text-ink"
          >
            Bookings stub (SAMPLE)
          </h2>
          {loadState === "ready" && bookings.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No sample bookings in this store. Calendar connect remains under
              testing unless the calendar adapter flag is on. Nothing was
              invented.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="rounded-md border border-border bg-paper px-3 py-3 text-sm"
                >
                  <p className="inline-flex items-center gap-2 font-medium text-ink">
                    <span className="rounded bg-[var(--color-warning-bg)] px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-warning-text)]">
                      {booking.sampleLabel}
                    </span>
                    {booking.title}
                  </p>
                  <p className="mt-1 text-muted">
                    {formatBookingWindow(booking)} · {booking.status} ·{" "}
                    {booking.provider}
                  </p>
                  <p className="mt-1 text-muted">{booking.note}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section
        className="rounded-md border border-border bg-surface p-5"
        aria-labelledby="dashboard-transcript-heading"
      >
        <h2
          id="dashboard-transcript-heading"
          className="text-base font-semibold text-ink"
        >
          Transcript (SAMPLE)
        </h2>
        {!selectedId ? (
          <p className="mt-3 text-sm text-muted">
            Select a SAMPLE session to read its labelled mock transcript. No
            live recording is attached.
          </p>
        ) : null}
        {detailState === "loading" ? (
          <p className="mt-3 text-sm text-muted">Loading SAMPLE transcript…</p>
        ) : null}
        {detailState === "error" ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error ?? "No sample transcript is available. Nothing was invented."}
          </p>
        ) : null}
        {detail ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted">{detail.transcript.disclaimer}</p>
            <ol className="space-y-2">
              {detail.transcript.turns.map((turn, index) => (
                <li
                  key={`${turn.speaker}-${index}`}
                  className="rounded-md border border-border bg-paper px-3 py-2 text-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {turn.speaker === "assistant" ? "Assistant (demo)" : "Caller (demo)"}
                  </p>
                  <p className="mt-1 text-ink">{turn.text}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>
    </div>
  );
}
