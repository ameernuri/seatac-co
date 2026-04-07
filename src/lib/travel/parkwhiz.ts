import { env } from "@/env";
import type { ParkingOffer, ParkingSearchInput, SearchMeta } from "@/lib/travel/types";

type ParkingSearchResult = {
  meta: SearchMeta;
  offers: ParkingOffer[];
  raw?: unknown;
};

function hasParkWhizCredentials() {
  return Boolean(env.parkwhizClientId && env.parkwhizClientSecret);
}

let parkWhizTokenCache:
  | {
      accessToken: string;
      expiresAt: number;
    }
  | null = null;

async function getParkWhizAccessToken() {
  const now = Date.now();

  if (parkWhizTokenCache && parkWhizTokenCache.expiresAt > now + 60_000) {
    return parkWhizTokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.parkwhizClientId,
    client_secret: env.parkwhizClientSecret,
    scope: "public",
  });

  const response = await fetch(`${env.parkwhizBaseUrl}${env.parkwhizTokenPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`ParkWhiz token request failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new Error("ParkWhiz token response did not include an access token.");
  }

  parkWhizTokenCache = {
    accessToken: payload.access_token,
    expiresAt: now + Math.max(300, payload.expires_in ?? 3600) * 1000,
  };

  return payload.access_token;
}

export async function searchParkWhizParking(
  input: ParkingSearchInput,
): Promise<ParkingSearchResult> {
  if (!hasParkWhizCredentials()) {
    return {
      meta: {
        providerEnabled: false,
        providerName: "ParkWhiz",
        error: "ParkWhiz credentials are not configured yet.",
      },
      offers: [],
    };
  }

  const params = new URLSearchParams({
    q: `${input.latitude},${input.longitude}`,
    start_time: input.startsAt,
    end_time: input.endsAt,
    option_types: "bookable",
  });

  try {
    const accessToken = await getParkWhizAccessToken();
    const response = await fetch(
      `${env.parkwhizBaseUrl}${env.parkwhizSearchPath}?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        next: {
          revalidate: 900,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`ParkWhiz search failed: ${response.status}`);
    }

    const raw = await response.json();

    return {
      meta: {
        providerEnabled: true,
        providerName: "ParkWhiz",
      },
      offers: extractParkingOffers(raw, input),
      raw,
    };
  } catch (error) {
    return {
      meta: {
        providerEnabled: true,
        providerName: "ParkWhiz",
        error: error instanceof Error ? error.message : "ParkWhiz parking search failed.",
      },
      offers: [],
    };
  }
}

function extractParkingOffers(payload: unknown, input: ParkingSearchInput): ParkingOffer[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.slice(0, 8).map((entry) => {
    const record = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;
    const price =
      typeof record.price === "number"
        ? record.price
        : typeof record.total_price === "number"
          ? record.total_price
          : null;

    return {
      provider: "parkwhiz",
      title:
        (typeof record.location_name === "string" && record.location_name) ||
        (typeof record.name === "string" && record.name) ||
        "Parking option",
      locationLabel: input.locationLabel,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      totalPrice: price,
      currency:
        (typeof record.currency === "string" && record.currency) ||
        (typeof record.currency_code === "string" && record.currency_code) ||
        (record.price &&
        typeof record.price === "object" &&
        typeof (record.price as Record<string, unknown>).USD === "string"
          ? "USD"
          : null) ||
        "USD",
      distanceMiles:
        (record.distance &&
        typeof record.distance === "object" &&
        typeof (record.distance as Record<string, unknown>).straight_line === "object" &&
        typeof (
          ((record.distance as Record<string, unknown>).straight_line as Record<string, unknown>)
            .miles
        ) === "number"
          ? (((record.distance as Record<string, unknown>).straight_line as Record<string, unknown>)
              .miles as number)
          : null) ??
        (typeof record.distance === "number"
          ? record.distance
          : typeof record.distance_miles === "number"
            ? record.distance_miles
            : null),
      deepLinkUrl:
        (typeof record.action === "string" && record.action) ||
        (typeof record.purchase_url === "string" && record.purchase_url) ||
        (typeof record.deep_link === "string" && record.deep_link) ||
        null,
    };
  });
}
