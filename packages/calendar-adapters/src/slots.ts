import type { FreeSlot } from "./types.ts";

const WEEKDAYS = new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]);

export type BusyInterval = {
  start: Date;
  end: Date;
};

export type ComputeFreeSlotsInput = {
  from: Date;
  to: Date;
  busy?: BusyInterval[];
  slotMinutes?: number;
  timezone?: string;
  workdayStartHour?: number;
  workdayEndHour?: number;
  now?: Date;
};

export function parseInstant(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return null;
  return new Date(ms);
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function partsInZone(
  date: Date,
  timeZone: string,
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
} {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const map = Object.fromEntries(
    fmt.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: map.weekday ?? "",
  };
}

export function computeFreeSlots(input: ComputeFreeSlotsInput): FreeSlot[] {
  const slotMinutes = input.slotMinutes && input.slotMinutes > 0 ? input.slotMinutes : 30;
  const timezone = input.timezone || "Europe/London";
  const workStart = input.workdayStartHour ?? 9;
  const workEnd = input.workdayEndHour ?? 17;
  const now = input.now ?? new Date();
  const busy = input.busy ?? [];
  const step = slotMinutes * 60_000;
  let cursor = input.from.getTime();
  const rem = cursor % step;
  if (rem) cursor += step - rem;

  const slots: FreeSlot[] = [];
  for (let t = cursor; t + step <= input.to.getTime(); t += step) {
    const start = new Date(t);
    const end = new Date(t + step);
    if (end <= now) continue;
    const startParts = partsInZone(start, timezone);
    if (!WEEKDAYS.has(startParts.weekday)) continue;
    if (startParts.minute % slotMinutes !== 0) continue;
    if (startParts.hour < workStart || startParts.hour >= workEnd) continue;
    const endParts = partsInZone(new Date(t + step - 1), timezone);
    if (endParts.hour >= workEnd && endParts.minute > 0) continue;
    if (endParts.hour > workEnd) continue;
    if (busy.some((block) => overlaps(start, end, block.start, block.end))) continue;
    slots.push({
      start: start.toISOString(),
      end: end.toISOString(),
      timezone,
    });
  }
  return slots;
}

export function validateRange(
  from: string,
  to: string,
): { ok: true; from: Date; to: Date } | { ok: false } {
  const start = parseInstant(from);
  const end = parseInstant(to);
  if (!start || !end || end <= start) return { ok: false };
  return { ok: true, from: start, to: end };
}
