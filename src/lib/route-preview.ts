export type RoutePreview = {
  distanceMiles: number;
  durationMinutes: number;
  endAddress: string;
  startAddress: string;
};

const WASHINGTON_PLACE_ALIASES: Array<[RegExp, string]> = [
  [/^(sea[\s-]?tac|seatac)( airport)?$/i, "Seattle-Tacoma International Airport, SeaTac, WA, USA"],
  [/^(pier|port)\s*66$/i, "Bell Street Cruise Terminal at Pier 66, Seattle, WA, USA"],
  [/^(pier|port)\s*91$/i, "Smith Cove Cruise Terminal at Pier 91, Seattle, WA, USA"],
  [/^downtown seattle$/i, "Downtown Seattle, Seattle, WA, USA"],
];

const STATE_OR_COUNTRY_HINT =
  /\b(al|ak|az|ar|ca|co|ct|dc|de|fl|ga|hi|ia|id|il|in|ks|ky|la|ma|md|me|mi|mn|mo|ms|mt|nc|nd|ne|nh|nj|nm|nv|ny|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|va|vt|wa|wi|wv|wy|washington|united states|usa)\b/i;

export function normalizeAddressForWashingtonLookup(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  for (const [pattern, replacement] of WASHINGTON_PLACE_ALIASES) {
    if (pattern.test(trimmed)) {
      return replacement;
    }
  }

  if (trimmed.includes(",") || /\d/.test(trimmed) || STATE_OR_COUNTRY_HINT.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}, WA, USA`;
}

export async function fetchGoogleRoutePreview(origin: string, destination: string) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const normalizedOriginQuery = normalizeAddressForWashingtonLookup(origin);
  const normalizedDestinationQuery = normalizeAddressForWashingtonLookup(destination);
  const normalizedOrigin = normalizedOriginQuery.toLowerCase();
  const normalizedDestination = normalizedDestinationQuery.toLowerCase();

  if (!apiKey) {
    return {
      error: "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.",
      preview: null,
    } as const;
  }

  if (!normalizedOriginQuery || !normalizedDestinationQuery) {
    return {
      error: "Origin and destination are required.",
      preview: null,
    } as const;
  }

  if (normalizedOrigin === normalizedDestination) {
    return {
      error: null,
      preview: {
        distanceMiles: 0,
        durationMinutes: 0,
        endAddress: normalizedDestinationQuery,
        startAddress: normalizedOriginQuery,
      } satisfies RoutePreview,
    } as const;
  }

  const params = new URLSearchParams({
    departure_time: "now",
    destination: normalizedDestinationQuery,
    key: apiKey,
    mode: "driving",
    origin: normalizedOriginQuery,
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        error: "Google route lookup failed.",
        preview: null,
      } as const;
    }

    const data = (await response.json()) as {
      routes?: Array<{
        legs?: Array<{
          distance?: { value?: number };
          duration?: { value?: number };
          duration_in_traffic?: { value?: number };
          end_address?: string;
          start_address?: string;
        }>;
      }>;
    };
    const leg = data.routes?.[0]?.legs?.[0];

    if (!leg?.distance?.value || !leg?.duration?.value) {
      return {
        error: "Google did not return a drivable route for these locations.",
        preview: null,
      } as const;
    }

    return {
      error: null,
      preview: {
        distanceMiles: Number((leg.distance.value / 1609.344).toFixed(1)),
        durationMinutes: Math.max(
          Math.round((leg.duration_in_traffic?.value ?? leg.duration.value) / 60),
          1,
        ),
        endAddress: leg.end_address ?? normalizedDestinationQuery,
        startAddress: leg.start_address ?? normalizedOriginQuery,
      } satisfies RoutePreview,
    } as const;
  } catch {
    return {
      error: "Google route lookup failed.",
      preview: null,
    } as const;
  }
}
