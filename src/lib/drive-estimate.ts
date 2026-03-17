type CachedDriveEstimate = {
  expiresAt: number;
  minutes: number | null;
};

const CACHE_TTL_MS = 15 * 60 * 1000;

const globalForDriveEstimates = globalThis as unknown as {
  driveEstimateCache?: Map<string, CachedDriveEstimate>;
};

const driveEstimateCache =
  globalForDriveEstimates.driveEstimateCache ??
  new Map<string, CachedDriveEstimate>();

if (process.env.NODE_ENV !== "production") {
  globalForDriveEstimates.driveEstimateCache = driveEstimateCache;
}

function normalizeAddress(address: string) {
  return address.trim().toLowerCase();
}

function buildCacheKey(origin: string, destination: string) {
  return `${normalizeAddress(origin)}::${normalizeAddress(destination)}`;
}

export async function estimateDriveMinutes(origin: string, destination: string) {
  if (!origin.trim() || !destination.trim()) {
    return null;
  }

  if (normalizeAddress(origin) === normalizeAddress(destination)) {
    return 0;
  }

  const cacheKey = buildCacheKey(origin, destination);
  const cached = driveEstimateCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.minutes;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return null;
  }

  const params = new URLSearchParams({
    origin,
    destination,
    mode: "driving",
    departure_time: "now",
    key: apiKey,
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      driveEstimateCache.set(cacheKey, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        minutes: null,
      });
      return null;
    }

    const data = (await response.json()) as {
      routes?: Array<{
        legs?: Array<{
          duration?: { value?: number };
          duration_in_traffic?: { value?: number };
        }>;
      }>;
      status?: string;
    };
    const leg = data.routes?.[0]?.legs?.[0];
    const seconds = leg?.duration_in_traffic?.value ?? leg?.duration?.value;
    const minutes = typeof seconds === "number" ? Math.max(Math.round(seconds / 60), 0) : null;

    driveEstimateCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      minutes,
    });

    return minutes;
  } catch {
    driveEstimateCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      minutes: null,
    });
    return null;
  }
}
