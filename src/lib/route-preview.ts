export type RoutePreview = {
  distanceMiles: number;
  durationMinutes: number;
  endAddress: string;
  startAddress: string;
};

export async function fetchGoogleRoutePreview(origin: string, destination: string) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      error: "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.",
      preview: null,
    } as const;
  }

  if (!origin.trim() || !destination.trim()) {
    return {
      error: "Origin and destination are required.",
      preview: null,
    } as const;
  }

  const params = new URLSearchParams({
    departure_time: "now",
    destination,
    key: apiKey,
    mode: "driving",
    origin,
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
        endAddress: leg.end_address ?? destination,
        startAddress: leg.start_address ?? origin,
      } satisfies RoutePreview,
    } as const;
  } catch {
    return {
      error: "Google route lookup failed.",
      preview: null,
    } as const;
  }
}
