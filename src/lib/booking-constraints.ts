import { z } from "zod";

export const BOOKING_CONSTRAINTS_KEY = "bookingConstraints";

export const defaultBookingConstraints = {
  customTripDefaultPricing: "distance",
  enableDistancePricing: true,
  enableFlatPricing: true,
  enableHourlyPricing: true,
  chargeBagsOnDistance: false,
  chargeBagsOnEvent: false,
  chargeBagsOnFlat: false,
  chargeBagsOnHourly: false,
  chargeMileageOnDistance: true,
  chargeMileageOnEvent: false,
  chargeMileageOnFlat: false,
  chargeMileageOnHourly: false,
  chargePassengersOnDistance: false,
  chargePassengersOnEvent: false,
  chargePassengersOnFlat: false,
  chargePassengersOnHourly: false,
  perMileFee: 0,
  perBagFee: 0,
  perPassengerFee: 0,
  flatPerMileFee: null,
  flatPerBagFee: null,
  flatPerPassengerFee: null,
  distancePerMileFee: null,
  distancePerBagFee: null,
  distancePerPassengerFee: null,
  hourlyPerMileFee: null,
  hourlyPerBagFee: null,
  hourlyPerPassengerFee: null,
  maxAdvanceDays: 180,
  minimumLeadMinutes: 120,
  operatingHoursEnd: "23:00",
  operatingHoursStart: "04:00",
  hourlyMinimumHours: 3,
  hourlyServiceFee: 0,
  presetRouteDefaultPricing: "flat",
  timeZone: "America/Los_Angeles",
} as const;

const bookingConstraintsSchema = z.object({
  customTripDefaultPricing: z.enum(["flat", "distance"]).optional(),
  enableDistancePricing: z.boolean().optional(),
  enableFlatPricing: z.boolean().optional(),
  enableHourlyPricing: z.boolean().optional(),
  chargeBagsOnDistance: z.boolean().optional(),
  chargeBagsOnEvent: z.boolean().optional(),
  chargeBagsOnFlat: z.boolean().optional(),
  chargeBagsOnHourly: z.boolean().optional(),
  chargeMileageOnDistance: z.boolean().optional(),
  chargeMileageOnEvent: z.boolean().optional(),
  chargeMileageOnFlat: z.boolean().optional(),
  chargeMileageOnHourly: z.boolean().optional(),
  chargePassengersOnDistance: z.boolean().optional(),
  chargePassengersOnEvent: z.boolean().optional(),
  chargePassengersOnFlat: z.boolean().optional(),
  chargePassengersOnHourly: z.boolean().optional(),
  perMileFee: z.number().min(0).max(500).optional(),
  perBagFee: z.number().min(0).max(500).optional(),
  perPassengerFee: z.number().min(0).max(500).optional(),
  flatPerMileFee: z.number().min(0).max(500).nullable().optional(),
  flatPerBagFee: z.number().min(0).max(500).nullable().optional(),
  flatPerPassengerFee: z.number().min(0).max(500).nullable().optional(),
  distancePerMileFee: z.number().min(0).max(500).nullable().optional(),
  distancePerBagFee: z.number().min(0).max(500).nullable().optional(),
  distancePerPassengerFee: z.number().min(0).max(500).nullable().optional(),
  hourlyPerMileFee: z.number().min(0).max(500).nullable().optional(),
  hourlyPerBagFee: z.number().min(0).max(500).nullable().optional(),
  hourlyPerPassengerFee: z.number().min(0).max(500).nullable().optional(),
  maxAdvanceDays: z.number().int().min(1).max(730).optional(),
  minimumLeadMinutes: z.number().int().min(0).max(7 * 24 * 60).optional(),
  operatingHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  operatingHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  hourlyMinimumHours: z.number().int().min(1).max(24).optional(),
  hourlyServiceFee: z.number().min(0).max(5000).optional(),
  presetRouteDefaultPricing: z.enum(["flat", "distance"]).optional(),
  timeZone: z.string().min(1).optional(),
});

export type BookingConstraints = {
  customTripDefaultPricing: "flat" | "distance";
  enableDistancePricing: boolean;
  enableFlatPricing: boolean;
  enableHourlyPricing: boolean;
  chargeBagsOnDistance: boolean;
  chargeBagsOnEvent: boolean;
  chargeBagsOnFlat: boolean;
  chargeBagsOnHourly: boolean;
  chargeMileageOnDistance: boolean;
  chargeMileageOnEvent: boolean;
  chargeMileageOnFlat: boolean;
  chargeMileageOnHourly: boolean;
  chargePassengersOnDistance: boolean;
  chargePassengersOnEvent: boolean;
  chargePassengersOnFlat: boolean;
  chargePassengersOnHourly: boolean;
  perMileFee: number;
  perBagFee: number;
  perPassengerFee: number;
  flatPerMileFee: number | null;
  flatPerBagFee: number | null;
  flatPerPassengerFee: number | null;
  distancePerMileFee: number | null;
  distancePerBagFee: number | null;
  distancePerPassengerFee: number | null;
  hourlyPerMileFee: number | null;
  hourlyPerBagFee: number | null;
  hourlyPerPassengerFee: number | null;
  maxAdvanceDays: number;
  minimumLeadMinutes: number;
  operatingHoursEnd: string;
  operatingHoursStart: string;
  hourlyMinimumHours: number;
  hourlyServiceFee: number;
  presetRouteDefaultPricing: "flat" | "distance";
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

function resolveOperatingWindow(startValue: string, endValue: string) {
  const defaultStartValue = defaultBookingConstraints.operatingHoursStart;
  const defaultEndValue = defaultBookingConstraints.operatingHoursEnd;
  const defaultStartMinutes = parseClockMinutes(defaultStartValue) ?? 4 * 60;
  const defaultEndMinutes = parseClockMinutes(defaultEndValue) ?? 23 * 60;
  const startMinutes = parseClockMinutes(startValue);
  const endMinutes = parseClockMinutes(endValue);

  if (startMinutes === null || endMinutes === null) {
    return {
      endMinutes: defaultEndMinutes,
      endValue: defaultEndValue,
      isTwentyFourHours: false,
      startMinutes: defaultStartMinutes,
      startValue: defaultStartValue,
    };
  }

  if (startMinutes === endMinutes) {
    return {
      endMinutes,
      endValue,
      isTwentyFourHours: true,
      startMinutes,
      startValue,
    };
  }

  if (startMinutes > endMinutes) {
    return {
      endMinutes: defaultEndMinutes,
      endValue: defaultEndValue,
      isTwentyFourHours: false,
      startMinutes: defaultStartMinutes,
      startValue: defaultStartValue,
    };
  }

  return {
    endMinutes,
    endValue,
    isTwentyFourHours: false,
    startMinutes,
    startValue,
  };
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

function isValidDate(value: Date) {
  return Number.isFinite(value.getTime());
}

export function normalizeBookingConstraints(value: unknown): BookingConstraints {
  const parsed = bookingConstraintsSchema.safeParse(value);

  if (!parsed.success) {
    return { ...defaultBookingConstraints };
  }

  const normalized: BookingConstraints = {
    customTripDefaultPricing:
      parsed.data.customTripDefaultPricing ??
      defaultBookingConstraints.customTripDefaultPricing,
    enableDistancePricing:
      parsed.data.enableDistancePricing ??
      defaultBookingConstraints.enableDistancePricing,
    enableFlatPricing:
      parsed.data.enableFlatPricing ?? defaultBookingConstraints.enableFlatPricing,
    enableHourlyPricing:
      parsed.data.enableHourlyPricing ??
      defaultBookingConstraints.enableHourlyPricing,
    chargeBagsOnDistance:
      parsed.data.chargeBagsOnDistance ??
      defaultBookingConstraints.chargeBagsOnDistance,
    chargeBagsOnEvent:
      parsed.data.chargeBagsOnEvent ?? defaultBookingConstraints.chargeBagsOnEvent,
    chargeBagsOnFlat:
      parsed.data.chargeBagsOnFlat ?? defaultBookingConstraints.chargeBagsOnFlat,
    chargeBagsOnHourly:
      parsed.data.chargeBagsOnHourly ??
      defaultBookingConstraints.chargeBagsOnHourly,
    chargeMileageOnDistance:
      parsed.data.chargeMileageOnDistance ??
      defaultBookingConstraints.chargeMileageOnDistance,
    chargeMileageOnEvent:
      parsed.data.chargeMileageOnEvent ??
      defaultBookingConstraints.chargeMileageOnEvent,
    chargeMileageOnFlat:
      parsed.data.chargeMileageOnFlat ??
      defaultBookingConstraints.chargeMileageOnFlat,
    chargeMileageOnHourly:
      parsed.data.chargeMileageOnHourly ??
      defaultBookingConstraints.chargeMileageOnHourly,
    chargePassengersOnDistance:
      parsed.data.chargePassengersOnDistance ??
      defaultBookingConstraints.chargePassengersOnDistance,
    chargePassengersOnEvent:
      parsed.data.chargePassengersOnEvent ??
      defaultBookingConstraints.chargePassengersOnEvent,
    chargePassengersOnFlat:
      parsed.data.chargePassengersOnFlat ??
      defaultBookingConstraints.chargePassengersOnFlat,
    chargePassengersOnHourly:
      parsed.data.chargePassengersOnHourly ??
      defaultBookingConstraints.chargePassengersOnHourly,
    perMileFee: parsed.data.perMileFee ?? defaultBookingConstraints.perMileFee,
    perBagFee: parsed.data.perBagFee ?? defaultBookingConstraints.perBagFee,
    perPassengerFee:
      parsed.data.perPassengerFee ?? defaultBookingConstraints.perPassengerFee,
    flatPerMileFee:
      parsed.data.flatPerMileFee ?? defaultBookingConstraints.flatPerMileFee,
    flatPerBagFee:
      parsed.data.flatPerBagFee ?? defaultBookingConstraints.flatPerBagFee,
    flatPerPassengerFee:
      parsed.data.flatPerPassengerFee ??
      defaultBookingConstraints.flatPerPassengerFee,
    distancePerMileFee:
      parsed.data.distancePerMileFee ??
      defaultBookingConstraints.distancePerMileFee,
    distancePerBagFee:
      parsed.data.distancePerBagFee ?? defaultBookingConstraints.distancePerBagFee,
    distancePerPassengerFee:
      parsed.data.distancePerPassengerFee ??
      defaultBookingConstraints.distancePerPassengerFee,
    hourlyPerMileFee:
      parsed.data.hourlyPerMileFee ?? defaultBookingConstraints.hourlyPerMileFee,
    hourlyPerBagFee:
      parsed.data.hourlyPerBagFee ?? defaultBookingConstraints.hourlyPerBagFee,
    hourlyPerPassengerFee:
      parsed.data.hourlyPerPassengerFee ??
      defaultBookingConstraints.hourlyPerPassengerFee,
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
    hourlyMinimumHours:
      parsed.data.hourlyMinimumHours ??
      defaultBookingConstraints.hourlyMinimumHours,
    hourlyServiceFee:
      parsed.data.hourlyServiceFee ?? defaultBookingConstraints.hourlyServiceFee,
    presetRouteDefaultPricing:
      parsed.data.presetRouteDefaultPricing ??
      defaultBookingConstraints.presetRouteDefaultPricing,
    timeZone: parsed.data.timeZone ?? defaultBookingConstraints.timeZone,
  };

  if (
    !normalized.enableFlatPricing &&
    !normalized.enableDistancePricing &&
    !normalized.enableHourlyPricing
  ) {
    normalized.enableFlatPricing = true;
  }

  const safeWindow = resolveOperatingWindow(
    normalized.operatingHoursStart,
    normalized.operatingHoursEnd,
  );
  normalized.operatingHoursStart = safeWindow.startValue;
  normalized.operatingHoursEnd = safeWindow.endValue;

  return normalized;
}

export function describeBookingConstraints(constraints: BookingConstraints) {
  const operatingWindow = resolveOperatingWindow(
    constraints.operatingHoursStart,
    constraints.operatingHoursEnd,
  );
  const overage =
    constraints.perMileFee > 0 ||
    constraints.perPassengerFee > 0 ||
    constraints.perBagFee > 0
      ? ` Default pricing adds ${constraints.perMileFee.toFixed(2)} per mile, ${constraints.perPassengerFee.toFixed(2)} per rider, and ${constraints.perBagFee.toFixed(2)} per bag unless the vehicle type overrides it.`
      : "";

  return `Bookings require at least ${constraints.minimumLeadMinutes} minutes notice and can be scheduled ${
    operatingWindow.isTwentyFourHours
      ? "24 hours a day"
      : `between ${formatClockLabel(operatingWindow.startValue)} and ${formatClockLabel(
          operatingWindow.endValue,
        )}`
  } up to ${
    constraints.maxAdvanceDays
  } days ahead.${overage}`;
}

export function shouldChargeComponent(
  constraints: BookingConstraints,
  tripType: "flat" | "distance" | "hourly" | "event",
  component: "mileage" | "passengers" | "bags",
) {
  if (tripType === "flat") {
    if (component === "mileage") return constraints.chargeMileageOnFlat;
    if (component === "passengers") return constraints.chargePassengersOnFlat;
    return constraints.chargeBagsOnFlat;
  }

  if (tripType === "distance") {
    if (component === "mileage") return constraints.chargeMileageOnDistance;
    if (component === "passengers") return constraints.chargePassengersOnDistance;
    return constraints.chargeBagsOnDistance;
  }

  if (tripType === "hourly") {
    if (component === "mileage") return constraints.chargeMileageOnHourly;
    if (component === "passengers") return constraints.chargePassengersOnHourly;
    return constraints.chargeBagsOnHourly;
  }

  if (component === "mileage") {
    return constraints.chargeMileageOnEvent || constraints.chargeMileageOnHourly;
  }

  if (component === "passengers") {
    return (
      constraints.chargePassengersOnEvent || constraints.chargePassengersOnHourly
    );
  }

  return constraints.chargeBagsOnEvent || constraints.chargeBagsOnHourly;
}

export function getPricingComponentFee(
  constraints: BookingConstraints,
  tripType: "flat" | "distance" | "hourly" | "event",
  component: "mileage" | "passengers" | "bags",
) {
  if (tripType === "flat") {
    if (component === "mileage") return constraints.flatPerMileFee ?? constraints.perMileFee;
    if (component === "passengers") {
      return constraints.flatPerPassengerFee ?? constraints.perPassengerFee;
    }
    return constraints.flatPerBagFee ?? constraints.perBagFee;
  }

  if (tripType === "distance") {
    if (component === "mileage") {
      return constraints.distancePerMileFee ?? constraints.perMileFee;
    }
    if (component === "passengers") {
      return constraints.distancePerPassengerFee ?? constraints.perPassengerFee;
    }
    return constraints.distancePerBagFee ?? constraints.perBagFee;
  }

  if (component === "mileage") {
    return constraints.hourlyPerMileFee ?? constraints.perMileFee;
  }

  if (component === "passengers") {
    return constraints.hourlyPerPassengerFee ?? constraints.perPassengerFee;
  }

  return constraints.hourlyPerBagFee ?? constraints.perBagFee;
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

  const operatingWindow = resolveOperatingWindow(
    constraints.operatingHoursStart,
    constraints.operatingHoursEnd,
  );
  const startMinutes = operatingWindow.startMinutes;
  const endMinutes = operatingWindow.endMinutes;
  const pickupParts = getDatePartsInTimeZone(params.pickupAt, constraints.timeZone);
  const pickupMinutes = pickupParts.hour * 60 + pickupParts.minute;

  if (
    !operatingWindow.isTwentyFourHours &&
    (pickupMinutes < startMinutes || pickupMinutes >= endMinutes)
  ) {
    return `Pickups must be scheduled between ${formatClockLabel(
      operatingWindow.startValue,
    )} and ${formatClockLabel(operatingWindow.endValue)}.`;
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

    if (
      !operatingWindow.isTwentyFourHours &&
      (returnMinutes < startMinutes || returnMinutes >= endMinutes)
    ) {
      return `Return trips must stay within operating hours of ${formatClockLabel(
        operatingWindow.startValue,
      )} to ${formatClockLabel(operatingWindow.endValue)}.`;
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
  const operatingWindow = resolveOperatingWindow(
    params.constraints.operatingHoursStart,
    params.constraints.operatingHoursEnd,
  );
  const startMinutes = operatingWindow.startMinutes;
  const endMinutes = operatingWindow.endMinutes;
  const leadCutoff = new Date(
    now.getTime() + params.constraints.minimumLeadMinutes * 60 * 1000,
  );

  return Array.from({ length: 48 }, (_, index) => {
    const hours = String(Math.floor(index / 2)).padStart(2, "0");
    const minutes = index % 2 === 0 ? "00" : "30";

    return `${hours}:${minutes}`;
  }).filter((time) => {
    const minutes = parseClockMinutes(time);

    if (
      minutes === null ||
      (!operatingWindow.isTwentyFourHours &&
        (minutes < startMinutes || minutes >= endMinutes))
    ) {
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
  const safeNow = isValidDate(now) ? now : new Date();
  const safeLeadMinutes = Number.isFinite(constraints.minimumLeadMinutes)
    ? constraints.minimumLeadMinutes
    : defaultBookingConstraints.minimumLeadMinutes;
  const leadCutoff = new Date(safeNow.getTime() + safeLeadMinutes * 60 * 1000);
  const rounded = new Date(leadCutoff);
  const minutes = rounded.getMinutes();

  rounded.setMinutes(minutes <= 30 ? 30 : 60, 0, 0);
  if (minutes > 30) {
    rounded.setHours(rounded.getHours() + 1);
    rounded.setMinutes(0, 0, 0);
  }

  const operatingWindow = resolveOperatingWindow(
    constraints.operatingHoursStart,
    constraints.operatingHoursEnd,
  );
  const startMinutes = operatingWindow.startMinutes;
  const endMinutes = operatingWindow.endMinutes;

  let candidate = rounded;

  while (!operatingWindow.isTwentyFourHours) {
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

  const preferredMorningMinutes = 7 * 60;
  const candidateMinutes = candidate.getHours() * 60 + candidate.getMinutes();

  if (
    candidateMinutes < preferredMorningMinutes &&
    preferredMorningMinutes >= startMinutes &&
    (operatingWindow.isTwentyFourHours || preferredMorningMinutes < endMinutes)
  ) {
    candidate = new Date(candidate);
    candidate.setHours(7, 0, 0, 0);
  }

  if (!isValidDate(candidate)) {
    const fallback = new Date();
    fallback.setHours(7, 0, 0, 0);

    return {
      date: fallback.toISOString().slice(0, 10),
      time: "07:00",
    };
  }

  return {
    date: candidate.toISOString().slice(0, 10),
    time: `${String(candidate.getHours()).padStart(2, "0")}:${String(
      candidate.getMinutes(),
    ).padStart(2, "0")}`,
  };
}
