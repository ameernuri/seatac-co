import { z } from "zod";

export const BOOKING_CONSTRAINTS_KEY = "bookingConstraints";

export const defaultBookingConstraints = {
  maxAdvanceDays: 180,
  minimumLeadMinutes: 120,
  operatingHoursEnd: "23:00",
  operatingHoursStart: "04:00",
  timeZone: "America/Los_Angeles",
} as const;

const bookingConstraintsSchema = z.object({
  maxAdvanceDays: z.number().int().min(1).max(730).optional(),
  minimumLeadMinutes: z.number().int().min(0).max(7 * 24 * 60).optional(),
  operatingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  operatingHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timeZone: z.string().min(1).optional(),
});

export type BookingConstraints = {
  maxAdvanceDays: number;
  minimumLeadMinutes: number;
  operatingHoursEnd: string;
  operatingHoursStart: string;
  timeZone: string;
};

function parseClockMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function getDatePartsInTimeZone(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    month: Number(map.month),
    year: Number(map.year),
  };
}

function formatClockLabel(value: string) {
  const minutes = parseClockMinutes(value);

  if (minutes === null) {
    return value;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const meridiem = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHour}:${String(remainder).padStart(2, "0")} ${meridiem}`;
}

export function normalizeBookingConstraints(value: unknown): BookingConstraints {
  const parsed = bookingConstraintsSchema.safeParse(value);

  if (!parsed.success) {
    return { ...defaultBookingConstraints };
  }

  return {
    maxAdvanceDays:
      parsed.data.maxAdvanceDays ?? defaultBookingConstraints.maxAdvanceDays,
    minimumLeadMinutes:
      parsed.data.minimumLeadMinutes ??
      defaultBookingConstraints.minimumLeadMinutes,
    operatingHoursEnd:
      parsed.data.operatingHoursEnd ?? defaultBookingConstraints.operatingHoursEnd,
    operatingHoursStart:
      parsed.data.operatingHoursStart ??
      defaultBookingConstraints.operatingHoursStart,
    timeZone: parsed.data.timeZone ?? defaultBookingConstraints.timeZone,
  };
}

export function describeBookingConstraints(constraints: BookingConstraints) {
  return `Bookings require at least ${constraints.minimumLeadMinutes} minutes notice and can be scheduled between ${formatClockLabel(
    constraints.operatingHoursStart,
  )} and ${formatClockLabel(constraints.operatingHoursEnd)} up to ${
    constraints.maxAdvanceDays
  } days ahead.`;
}

export function validateBookingWindow(params: {
  constraints: BookingConstraints;
  now?: Date;
  pickupAt: Date;
  returnAt?: Date | null;
}) {
  const { constraints } = params;
  const now = params.now ?? new Date();

  if (Number.isNaN(params.pickupAt.getTime())) {
    return "Enter a valid pickup time.";
  }

  const leadCutoff = new Date(now.getTime() + constraints.minimumLeadMinutes * 60 * 1000);

  if (params.pickupAt.getTime() < leadCutoff.getTime()) {
    return `Reservations require at least ${constraints.minimumLeadMinutes} minutes notice.`;
  }

  const maxAdvanceCutoff = new Date(
    now.getTime() + constraints.maxAdvanceDays * 24 * 60 * 60 * 1000,
  );

  if (params.pickupAt.getTime() > maxAdvanceCutoff.getTime()) {
    return `Reservations can only be made up to ${constraints.maxAdvanceDays} days ahead.`;
  }

  const startMinutes =
    parseClockMinutes(constraints.operatingHoursStart) ??
    parseClockMinutes(defaultBookingConstraints.operatingHoursStart)!;
  const endMinutes =
    parseClockMinutes(constraints.operatingHoursEnd) ??
    parseClockMinutes(defaultBookingConstraints.operatingHoursEnd)!;
  const pickupParts = getDatePartsInTimeZone(params.pickupAt, constraints.timeZone);
  const pickupMinutes = pickupParts.hour * 60 + pickupParts.minute;

  if (pickupMinutes < startMinutes || pickupMinutes >= endMinutes) {
    return `Pickups must be scheduled between ${formatClockLabel(
      constraints.operatingHoursStart,
    )} and ${formatClockLabel(constraints.operatingHoursEnd)}.`;
  }

  if (params.returnAt) {
    if (Number.isNaN(params.returnAt.getTime())) {
      return "Enter a valid return time.";
    }

    if (params.returnAt.getTime() <= params.pickupAt.getTime()) {
      return "Return time must be after pickup time.";
    }

    const returnParts = getDatePartsInTimeZone(params.returnAt, constraints.timeZone);
    const returnMinutes = returnParts.hour * 60 + returnParts.minute;

    if (returnMinutes < startMinutes || returnMinutes >= endMinutes) {
      return `Return trips must stay within operating hours of ${formatClockLabel(
        constraints.operatingHoursStart,
      )} to ${formatClockLabel(constraints.operatingHoursEnd)}.`;
    }
  }

  return null;
}

export function buildBookingTimeOptions(params: {
  constraints: BookingConstraints;
  dateValue: string;
  now?: Date;
}) {
  if (!params.dateValue) {
    return [];
  }

  const now = params.now ?? new Date();
  const startMinutes =
    parseClockMinutes(params.constraints.operatingHoursStart) ??
    parseClockMinutes(defaultBookingConstraints.operatingHoursStart)!;
  const endMinutes =
    parseClockMinutes(params.constraints.operatingHoursEnd) ??
    parseClockMinutes(defaultBookingConstraints.operatingHoursEnd)!;
  const leadCutoff = new Date(
    now.getTime() + params.constraints.minimumLeadMinutes * 60 * 1000,
  );

  return Array.from({ length: 48 }, (_, index) => {
    const hours = String(Math.floor(index / 2)).padStart(2, "0");
    const minutes = index % 2 === 0 ? "00" : "30";

    return `${hours}:${minutes}`;
  }).filter((time) => {
    const minutes = parseClockMinutes(time);

    if (minutes === null || minutes < startMinutes || minutes >= endMinutes) {
      return false;
    }

    const candidate = new Date(`${params.dateValue}T${time}:00`);

    return candidate.getTime() >= leadCutoff.getTime();
  });
}

export function resolveInitialBookingSlot(
  constraints: BookingConstraints,
  now: Date = new Date(),
) {
  const leadCutoff = new Date(now.getTime() + constraints.minimumLeadMinutes * 60 * 1000);
  const rounded = new Date(leadCutoff);
  const minutes = rounded.getMinutes();

  rounded.setMinutes(minutes <= 30 ? 30 : 60, 0, 0);
  if (minutes > 30) {
    rounded.setHours(rounded.getHours() + 1);
    rounded.setMinutes(0, 0, 0);
  }

  const startMinutes =
    parseClockMinutes(constraints.operatingHoursStart) ??
    parseClockMinutes(defaultBookingConstraints.operatingHoursStart)!;
  const endMinutes =
    parseClockMinutes(constraints.operatingHoursEnd) ??
    parseClockMinutes(defaultBookingConstraints.operatingHoursEnd)!;

  let candidate = rounded;

  while (true) {
    const candidateMinutes = candidate.getHours() * 60 + candidate.getMinutes();

    if (candidateMinutes < startMinutes) {
      candidate = new Date(candidate);
      candidate.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
      break;
    }

    if (candidateMinutes >= endMinutes) {
      candidate = new Date(candidate);
      candidate.setDate(candidate.getDate() + 1);
      candidate.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
      continue;
    }

    break;
  }

  return {
    date: candidate.toISOString().slice(0, 10),
    time: `${String(candidate.getHours()).padStart(2, "0")}:${String(
      candidate.getMinutes(),
    ).padStart(2, "0")}`,
  };
}
