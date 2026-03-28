import { env } from "@/env";

type AmadeusTokenState = {
  accessToken: string;
  expiresAt: number;
} | null;

let tokenState: AmadeusTokenState = null;

export type FlightStatus = {
  provider: "amadeus";
  carrierCode: string;
  flightNumber: string;
  scheduledDepartureDate: string;
  departureAirportCode?: string | null;
  arrivalAirportCode?: string | null;
  departureTerminal?: string | null;
  departureGate?: string | null;
  arrivalTerminal?: string | null;
  arrivalGate?: string | null;
  scheduledDepartureTime?: string | null;
  estimatedDepartureTime?: string | null;
  actualDepartureTime?: string | null;
  scheduledArrivalTime?: string | null;
  estimatedArrivalTime?: string | null;
  actualArrivalTime?: string | null;
  scheduledDuration?: string | null;
};

function hasFlightStatusCredentials() {
  return Boolean(env.amadeusClientId && env.amadeusClientSecret);
}

async function getAmadeusAccessToken() {
  if (!hasFlightStatusCredentials()) {
    return null;
  }

  if (tokenState && tokenState.expiresAt > Date.now() + 60_000) {
    return tokenState.accessToken;
  }

  const response = await fetch(`${env.amadeusBaseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.amadeusClientId,
      client_secret: env.amadeusClientSecret,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Amadeus auth failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new Error("Amadeus auth response missing access_token");
  }

  tokenState = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 1800) * 1000,
  };

  return tokenState.accessToken;
}

function getCandidateDepartureDates() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 86_400_000).toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);

  return [today, tomorrow, yesterday];
}

function getTimingValue(timings: unknown, qualifier: string) {
  if (!Array.isArray(timings)) {
    return null;
  }

  const match = timings.find((entry) => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    return (entry as { qualifier?: string }).qualifier === qualifier;
  }) as { value?: string } | undefined;

  return match?.value ?? null;
}

function parseFlightStatusPayload(payload: unknown): FlightStatus | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = (payload as { data?: unknown[] }).data;

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const flight = data[0] as {
    scheduledDepartureDate?: string;
    flightDesignator?: {
      carrierCode?: string;
      flightNumber?: string | number;
    };
    flightPoints?: Array<{
      iataCode?: string;
      departure?: {
        timings?: unknown;
        terminal?: { code?: string };
        gate?: { mainGate?: string };
      };
      arrival?: {
        timings?: unknown;
        terminal?: { code?: string };
        gate?: { mainGate?: string };
      };
    }>;
    segments?: Array<{
      scheduledSegmentDuration?: string;
    }>;
    legs?: Array<{
      scheduledLegDuration?: string;
    }>;
  };

  const points = Array.isArray(flight.flightPoints) ? flight.flightPoints : [];
  const departurePoint = points.find((point) => point.departure) ?? points[0];
  const arrivalPoint =
    [...points].reverse().find((point) => point.arrival) ?? points[points.length - 1];

  const scheduledDuration =
    flight.segments?.[0]?.scheduledSegmentDuration ??
    flight.legs?.[0]?.scheduledLegDuration ??
    null;

  return {
    provider: "amadeus",
    carrierCode: String(flight.flightDesignator?.carrierCode ?? ""),
    flightNumber: String(flight.flightDesignator?.flightNumber ?? ""),
    scheduledDepartureDate: String(flight.scheduledDepartureDate ?? ""),
    departureAirportCode: departurePoint?.iataCode ?? null,
    arrivalAirportCode: arrivalPoint?.iataCode ?? null,
    departureTerminal: departurePoint?.departure?.terminal?.code ?? null,
    departureGate: departurePoint?.departure?.gate?.mainGate ?? null,
    arrivalTerminal: arrivalPoint?.arrival?.terminal?.code ?? null,
    arrivalGate: arrivalPoint?.arrival?.gate?.mainGate ?? null,
    scheduledDepartureTime: getTimingValue(departurePoint?.departure?.timings, "STD"),
    estimatedDepartureTime: getTimingValue(departurePoint?.departure?.timings, "ETD"),
    actualDepartureTime: getTimingValue(departurePoint?.departure?.timings, "ATD"),
    scheduledArrivalTime: getTimingValue(arrivalPoint?.arrival?.timings, "STA"),
    estimatedArrivalTime: getTimingValue(arrivalPoint?.arrival?.timings, "ETA"),
    actualArrivalTime: getTimingValue(arrivalPoint?.arrival?.timings, "ATA"),
    scheduledDuration,
  };
}

export async function getFlightStatus(params: {
  carrierCode?: string | null;
  flightNumber?: string | null;
}) {
  if (!params.carrierCode || !params.flightNumber || !hasFlightStatusCredentials()) {
    return null;
  }

  const accessToken = await getAmadeusAccessToken();

  if (!accessToken) {
    return null;
  }

  for (const scheduledDepartureDate of getCandidateDepartureDates()) {
    const search = new URLSearchParams({
      carrierCode: params.carrierCode,
      flightNumber: params.flightNumber,
      scheduledDepartureDate,
    });

    const response = await fetch(`${env.amadeusBaseUrl}/v2/schedule/flights?${search.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      continue;
    }

    const payload = await response.json();
    const status = parseFlightStatusPayload(payload);

    if (status) {
      return status;
    }
  }

  return null;
}
