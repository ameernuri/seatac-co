type SearchParamInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

export type ReserveUrlState = {
  bags?: string;
  dropoffAddress?: string;
  hoursRequested?: string;
  passengers?: string;
  pickupAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  returnTrip?: boolean;
  routeDistanceMiles?: number;
  routeDurationMinutes?: number;
  routeSlug?: string;
  selectedExtras?: string[];
  selectedVehicleSlug?: string;
  step?: 1 | 2 | 3;
  tripType?: "flat" | "distance" | "hourly";
};

const CONTROLLED_QUERY_KEYS = new Set([
  "bags",
  "date",
  "extras",
  "from",
  "hours",
  "miles",
  "mins",
  "passengers",
  "route",
  "rt",
  "rdate",
  "rtime",
  "step",
  "time",
  "to",
  "trip",
  "vehicle",
]);

function readFirstValue(input: SearchParamInput, key: string) {
  if (input instanceof URLSearchParams) {
    return input.get(key) ?? undefined;
  }

  const value = input[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function readTrimmedValue(input: SearchParamInput, key: string) {
  const value = readFirstValue(input, key)?.trim();
  return value ? value : undefined;
}

function parseStep(value?: string) {
  if (value === "1" || value === "2" || value === "3") {
    return Number(value) as 1 | 2 | 3;
  }

  return undefined;
}

function parseTripType(value?: string) {
  if (value === "flat" || value === "distance" || value === "hourly") {
    return value;
  }

  return undefined;
}

function parseBooleanFlag(value?: string) {
  if (!value) {
    return undefined;
  }

  return value === "1" || value.toLowerCase() === "true";
}

function parsePositiveNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function parseExtras(value?: string) {
  if (!value) {
    return undefined;
  }

  const extras = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return extras.length > 0 ? extras : undefined;
}

export function parseReserveUrlState(input: SearchParamInput): ReserveUrlState {
  return {
    bags: readTrimmedValue(input, "bags"),
    dropoffAddress: readTrimmedValue(input, "to"),
    hoursRequested: readTrimmedValue(input, "hours"),
    passengers: readTrimmedValue(input, "passengers"),
    pickupAddress: readTrimmedValue(input, "from"),
    pickupDate: readTrimmedValue(input, "date"),
    pickupTime: readTrimmedValue(input, "time"),
    returnDate: readTrimmedValue(input, "rdate"),
    returnTime: readTrimmedValue(input, "rtime"),
    returnTrip: parseBooleanFlag(readTrimmedValue(input, "rt")),
    routeDistanceMiles: parsePositiveNumber(readTrimmedValue(input, "miles")),
    routeDurationMinutes: parsePositiveNumber(readTrimmedValue(input, "mins")),
    routeSlug: readTrimmedValue(input, "route"),
    selectedExtras: parseExtras(readTrimmedValue(input, "extras")),
    selectedVehicleSlug: readTrimmedValue(input, "vehicle"),
    step: parseStep(readTrimmedValue(input, "step")),
    tripType: parseTripType(readTrimmedValue(input, "trip")),
  };
}

function setParam(params: URLSearchParams, key: string, value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    params.delete(key);
    return;
  }

  params.set(key, normalized);
}

export function buildReserveUrlSearchParams(
  state: ReserveUrlState,
  existingSearch?: URLSearchParams,
) {
  const params = new URLSearchParams();

  existingSearch?.forEach((value, key) => {
    if (!CONTROLLED_QUERY_KEYS.has(key) && key !== "resume") {
      params.append(key, value);
    }
  });

  setParam(params, "trip", state.tripType);
  setParam(params, "route", state.routeSlug);
  setParam(params, "from", state.pickupAddress);
  setParam(params, "to", state.dropoffAddress);
  setParam(params, "date", state.pickupDate);
  setParam(params, "time", state.pickupTime);
  setParam(params, "rt", state.returnTrip ? "1" : undefined);
  setParam(params, "rdate", state.returnDate);
  setParam(params, "rtime", state.returnTime);
  setParam(params, "passengers", state.passengers);
  setParam(params, "bags", state.bags);
  setParam(params, "hours", state.hoursRequested);
  setParam(params, "vehicle", state.selectedVehicleSlug);
  setParam(
    params,
    "extras",
    state.selectedExtras && state.selectedExtras.length > 0
      ? state.selectedExtras.join(",")
      : undefined,
  );
  setParam(params, "step", state.step ? String(state.step) : undefined);
  setParam(
    params,
    "miles",
    typeof state.routeDistanceMiles === "number"
      ? state.routeDistanceMiles.toFixed(1)
      : undefined,
  );
  setParam(
    params,
    "mins",
    typeof state.routeDurationMinutes === "number"
      ? String(Math.round(state.routeDurationMinutes))
      : undefined,
  );

  return params;
}

export function buildReserveUrlPath(
  state: ReserveUrlState,
  options?: {
    basePath?: string;
    existingSearch?: URLSearchParams;
  },
) {
  const params = buildReserveUrlSearchParams(state, options?.existingSearch);
  const query = params.toString();
  const basePath = options?.basePath ?? "/reserve";

  return query ? `${basePath}?${query}` : basePath;
}

export function summarizeReserveLocations(state: ReserveUrlState) {
  const from = state.pickupAddress?.split(",")[0]?.trim();
  const to = state.dropoffAddress?.split(",")[0]?.trim();

  return { from, to };
}
