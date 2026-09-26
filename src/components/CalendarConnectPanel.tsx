"use client";

import { useEffect, useId, useState } from "react";
import { CalendarConnectComingSoon } from "@/components/CalendarConnectComingSoon";
import { siteConfig } from "@/config/site";
import {
  defaultSlotWindow,
  formatSlotLabel,
  requestCalendarBooking,
  requestCalendarSlots,
  type CalendarBooking,
  type CalendarSlot,
} from "@/lib/calendar-create";

type LoadState = "idle" | "loading" | "ready" | "empty" | "error";
type BookState = "idle" | "submitting" | "ok" | "error";

/**
 * Honest calendar-connect panel for /create.
 * Default: coming / under testing. Flag on: slot picker against mock or companion.
 */
export function CalendarConnectPanel() {
  const enabled = siteConfig.calendarAdaptersEnabled;
  const endpoint = siteConfig.calendarEndpoint.trim();
  const usesCompanion = Boolean(endpoint);
  const [loadState, setLoadState] = useState<LoadState>(() =>
    enabled ? "loading" : "idle",
  );
  const [bookState, setBookState] = useState<BookState>("idle");
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [detail, setDetail] = useState<string | null>(null);
  const [booking, setBooking] = useState<CalendarBooking | null>(null);
  const statusId = useId();

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const window = defaultSlotWindow();
    void requestCalendarSlots({
      enabled,
      endpoint,
      from: window.from,
      to: window.to,
      timezone: "Europe/London",
    }).then((outcome) => {
      if (cancelled) return;
      if (outcome.status === "ok") {
        setSlots(outcome.data);
        setSelected(outcome.data[0] ? `${outcome.data[0].start}|${outcome.data[0].end}` : "");
        setLoadState(outcome.data.length ? "ready" : "empty");
        return;
      }
      if (outcome.status === "disabled") {
        setLoadState("idle");
        return;
      }
      setSlots([]);
      setDetail(outcome.message);
      setLoadState("error");
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, endpoint]);

  async function onReserve() {
    const slot = slots.find((item) => `${item.start}|${item.end}` === selected);
    if (!slot) {
      setBookState("error");
      setDetail("Select a slot first. No booking was created.");
      setBooking(null);
      return;
    }
    setBookState("submitting");
    setDetail(null);
    setBooking(null);
    const outcome = await requestCalendarBooking({
      enabled,
      endpoint,
      start: slot.start,
      end: slot.end,
      timezone: slot.timezone,
      title: "Create-journey adapter test",
    });
    if (outcome.status === "ok") {
      setBooking(outcome.data);
      setBookState("ok");
      setSlots((current) =>
        current.filter((item) => item.start !== outcome.data.start),
      );
      return;
    }
    setBookState("error");
    setBooking(null);
    setDetail(
      outcome.status === "disabled"
        ? "Calendar adapters are off in this build. No booking was created."
        : outcome.message,
    );
  }

  if (!enabled) {
    return <CalendarConnectComingSoon />;
  }

  const shown = slots.slice(0, 8);

  return (
    <section
      className="rounded-md border border-border bg-surface p-5"
      data-calendar-adapters="on"
      data-calendar-source={usesCompanion ? "companion" : "browser-mock"}
      aria-labelledby="calendar-connect-heading"
    >
      <h2
        id="calendar-connect-heading"
        className="text-base font-semibold text-ink"
      >
        Calendar connect — local adapter testing
      </h2>
      <p className="mt-2 text-sm text-muted">
        Adapters are enabled in this build only.{" "}
        {usesCompanion
          ? "Slots come from the companion service. Mock is the default when Google OAuth is unset. Google Calendar OAuth is operator-configured on that process (not this static page) and stays not_configured without secrets — this is not live Google Calendar on staging."
          : "No calendar endpoint is configured, so this picker uses an in-browser mock. It is not Google or Microsoft."}{" "}
        Reserving a slot tests the adapter. It does not place a phone booking or
        create a live receptionist.
      </p>

      <div id={statusId} className="mt-4 space-y-2 text-sm text-muted" aria-live="polite">
        {loadState === "loading" ? <p>Loading adapter slots…</p> : null}
        {loadState === "empty" ? (
          <p>The adapter returned no free slots. Nothing was booked.</p>
        ) : null}
        {loadState === "error" ? (
          <p>{detail ?? "The adapter could not list slots. Nothing was booked."}</p>
        ) : null}
      </div>

      {loadState === "ready" ? (
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-ink">
            Available test slots (Europe/London)
          </legend>
          <ul className="mt-2 space-y-2">
            {shown.map((slot) => {
              const value = `${slot.start}|${slot.end}`;
              return (
                <li key={value}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
                    <input
                      type="radio"
                      name="calendar-slot"
                      value={value}
                      checked={selected === value}
                      onChange={() => setSelected(value)}
                      className="mt-1"
                    />
                    <span>{formatSlotLabel(slot)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            disabled={bookState === "submitting" || !selected}
            onClick={() => void onReserve()}
            className="mt-4 inline-flex min-h-6 items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
          >
            {bookState === "submitting"
              ? "Asking adapter…"
              : "Reserve selected slot (adapter test)"}
          </button>
        </fieldset>
      ) : null}

      {bookState === "ok" && booking ? (
        <p className="mt-4 text-sm text-ink" role="status">
          The {booking.provider} adapter returned booking id{" "}
          <code className="text-xs">{booking.id}</code> for{" "}
          {formatSlotLabel({
            start: booking.start,
            end: booking.end,
            timezone: booking.timezone,
          })}
          . This is an adapter test — not a live phone confirmation.
        </p>
      ) : null}
      {bookState === "error" ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {detail ?? "The adapter did not confirm a booking. No booking was invented."}
        </p>
      ) : null}
    </section>
  );
}
