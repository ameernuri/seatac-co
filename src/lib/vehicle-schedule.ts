export type VehicleScheduleRule = {
  dayOfWeek: number;
  enabled: boolean;
  endTime: string;
  startTime: string;
};

export type VehicleScheduleException = {
  allDay: boolean;
  dayOfWeek: number | null;
  enabled: boolean;
  endAt: Date | null;
  endTime: string | null;
  label: string;
  recurrence: string;
  startAt: Date | null;
  startTime: string | null;
  type: string;
};

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
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
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    weekday: "short",
    year: "numeric",
  }).formatToParts(value);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(map.day),
    dayOfWeek: weekdayMap[map.weekday] ?? -1,
    hour: Number(map.hour),
    minute: Number(map.minute),
    month: Number(map.month),
    year: Number(map.year),
  };
}

function buildExceptionMessage(exception: VehicleScheduleException) {
  if (exception.type === "holiday") {
    return `${exception.label} closes this service window.`;
  }

  if (exception.type === "blackout") {
    return `${exception.label} blocks this service window.`;
  }

  return `${exception.label} opens this service window.`;
}

function windowOverlapsOneOffException(params: {
  exception: VehicleScheduleException;
  windowEnd: Date;
  windowStart: Date;
}) {
  if (!params.exception.startAt || !params.exception.endAt) {
    return false;
  }

  return (
    params.exception.startAt.getTime() < params.windowEnd.getTime() &&
    params.exception.endAt.getTime() > params.windowStart.getTime()
  );
}

function windowFitsInsideOneOffException(params: {
  exception: VehicleScheduleException;
  windowEnd: Date;
  windowStart: Date;
}) {
  if (!params.exception.startAt || !params.exception.endAt) {
    return false;
  }

  return (
    params.exception.startAt.getTime() <= params.windowStart.getTime() &&
    params.exception.endAt.getTime() >= params.windowEnd.getTime()
  );
}

function windowOverlapsWeeklyException(params: {
  endParts: ReturnType<typeof getDatePartsInTimeZone>;
  exception: VehicleScheduleException;
  startParts: ReturnType<typeof getDatePartsInTimeZone>;
}) {
  if (
    params.exception.dayOfWeek === null ||
    params.exception.dayOfWeek !== params.startParts.dayOfWeek
  ) {
    return false;
  }

  if (params.exception.allDay) {
    return true;
  }

  const exceptionStartMinutes = parseClockMinutes(params.exception.startTime ?? "");
  const exceptionEndMinutes = parseClockMinutes(params.exception.endTime ?? "");

  if (exceptionStartMinutes === null || exceptionEndMinutes === null) {
    return false;
  }

  const windowStartMinutes = params.startParts.hour * 60 + params.startParts.minute;
  const windowEndMinutes = params.endParts.hour * 60 + params.endParts.minute + 1;

  return (
    exceptionStartMinutes < windowEndMinutes && exceptionEndMinutes > windowStartMinutes
  );
}

function windowFitsInsideWeeklyException(params: {
  endParts: ReturnType<typeof getDatePartsInTimeZone>;
  exception: VehicleScheduleException;
  startParts: ReturnType<typeof getDatePartsInTimeZone>;
}) {
  if (
    params.exception.dayOfWeek === null ||
    params.exception.dayOfWeek !== params.startParts.dayOfWeek
  ) {
    return false;
  }

  if (params.exception.allDay) {
    return true;
  }

  const exceptionStartMinutes = parseClockMinutes(params.exception.startTime ?? "");
  const exceptionEndMinutes = parseClockMinutes(params.exception.endTime ?? "");

  if (exceptionStartMinutes === null || exceptionEndMinutes === null) {
    return false;
  }

  const windowStartMinutes = params.startParts.hour * 60 + params.startParts.minute;
  const windowEndMinutes = params.endParts.hour * 60 + params.endParts.minute + 1;

  return (
    exceptionStartMinutes <= windowStartMinutes && exceptionEndMinutes >= windowEndMinutes
  );
}

export function evaluateAvailabilityWindow(params: {
  exceptions?: VehicleScheduleException[];
  rules: VehicleScheduleRule[];
  timeZone: string;
  windowEnd: Date;
  windowStart: Date;
}) {
  if (
    Number.isNaN(params.windowStart.getTime()) ||
    Number.isNaN(params.windowEnd.getTime()) ||
    params.windowEnd.getTime() <= params.windowStart.getTime()
  ) {
    return {
      allowed: false,
      reason: "Invalid booking window.",
    };
  }

  const startParts = getDatePartsInTimeZone(params.windowStart, params.timeZone);
  const endParts = getDatePartsInTimeZone(
    new Date(params.windowEnd.getTime() - 1),
    params.timeZone,
  );

  if (
    startParts.year !== endParts.year ||
    startParts.month !== endParts.month ||
    startParts.day !== endParts.day
  ) {
    return {
      allowed: false,
      reason: "This booking window crosses into a closed operating day.",
    };
  }

  const exceptions = (params.exceptions ?? []).filter((entry) => entry.enabled);
  const blockingException = exceptions.find((exception) => {
    if (exception.type === "override") {
      return false;
    }

    if (exception.recurrence === "weekly") {
      return windowOverlapsWeeklyException({
        endParts,
        exception,
        startParts,
      });
    }

    return windowOverlapsOneOffException({
      exception,
      windowEnd: params.windowEnd,
      windowStart: params.windowStart,
    });
  });

  if (blockingException) {
    return {
      allowed: false,
      reason: buildExceptionMessage(blockingException),
    };
  }

  const rule = params.rules.find(
    (entry) => entry.enabled && entry.dayOfWeek === startParts.dayOfWeek,
  );

  const startMinutes = startParts.hour * 60 + startParts.minute;
  const endMinutes = endParts.hour * 60 + endParts.minute + 1;
  const ruleStartMinutes = parseClockMinutes(rule?.startTime ?? "");
  const ruleEndMinutes = parseClockMinutes(rule?.endTime ?? "");
  const baseScheduleAllowed =
    Boolean(rule) &&
    ruleStartMinutes !== null &&
    ruleEndMinutes !== null &&
    startMinutes >= ruleStartMinutes &&
    endMinutes <= ruleEndMinutes;

  if (baseScheduleAllowed) {
    return {
      allowed: true,
      reason: null,
    };
  }

  const overrideException = exceptions.find((exception) => {
    if (exception.type !== "override") {
      return false;
    }

    if (exception.recurrence === "weekly") {
      return windowFitsInsideWeeklyException({
        endParts,
        exception,
        startParts,
      });
    }

    return windowFitsInsideOneOffException({
      exception,
      windowEnd: params.windowEnd,
      windowStart: params.windowStart,
    });
  });

  if (overrideException) {
    return {
      allowed: true,
      reason: null,
    };
  }

  return {
    allowed: false,
    reason: "Outside this vehicle's scheduled operating window.",
  };
}

export function isWindowWithinAvailabilityRules(params: {
  exceptions?: VehicleScheduleException[];
  rules: VehicleScheduleRule[];
  timeZone: string;
  windowEnd: Date;
  windowStart: Date;
}) {
  return evaluateAvailabilityWindow(params).allowed;
}
