import { env } from "@/env";
import type { RideOffer, RideSearchInput, SearchMeta } from "@/lib/travel/types";

type RideSearchResult = {
  meta: SearchMeta;
  offers: RideOffer[];
  raw?: unknown;
};

function hasTransferzCredentials() {
  return Boolean(env.transferzApiKey || (env.transferzEmail && env.transferzPassword));
}

let transferzApiKeyCache: string | null = null;

function isSeaAirport(label: string) {
  const value = label.toLowerCase();
  return value.includes("sea") || value.includes("seatac") || value.includes("seattle-tacoma");
}

function toTransferzLocation(label: string) {
  if (isSeaAirport(label)) {
    return { iataCode: "SEA" };
  }

  return {
    address: {
      addressSearchPhrase: label,
      countryCode: "US",
    },
  };
}

async function getTransferzApiKey() {
  if (env.transferzApiKey) {
    return env.transferzApiKey;
  }

  if (transferzApiKeyCache) {
    return transferzApiKeyCache;
  }

  const tokenResponse = await fetch(
    `${env.transferzGatewayBaseUrl}${env.transferzTokenPath}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: env.transferzEmail,
        password: env.transferzPassword,
      }),
      cache: "no-store",
    },
  );

  if (!tokenResponse.ok) {
    throw new Error(`Transferz token request failed: ${tokenResponse.status}`);
  }

  const tokenPayload = (await tokenResponse.json()) as { accessToken?: string };

  if (!tokenPayload.accessToken) {
    throw new Error("Transferz token response did not include an access token.");
  }

  const keyResponse = await fetch(
    `${env.transferzGatewayBaseUrl}${env.transferzApiKeysPath}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${tokenPayload.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: "seatac.co integration",
      }),
      cache: "no-store",
    },
  );

  if (!keyResponse.ok) {
    throw new Error(`Transferz API key request failed: ${keyResponse.status}`);
  }

  const keyPayload = (await keyResponse.json()) as { key?: string };

  if (!keyPayload.key) {
    throw new Error("Transferz API key response did not include a key.");
  }

  transferzApiKeyCache = keyPayload.key;
  return keyPayload.key;
}

export async function createTransferzApiKeyFromCredentials() {
  const apiKey = await getTransferzApiKey();

  return {
    apiKey,
  };
}

export async function searchTransferzRides(
  input: RideSearchInput,
): Promise<RideSearchResult> {
  if (!hasTransferzCredentials()) {
    return {
      meta: {
        providerEnabled: false,
        providerName: "Transferz",
        error: "Transferz credentials are not configured yet.",
      },
      offers: [],
    };
  }

  try {
    const apiKey = await getTransferzApiKey();
    const response = await fetch(`${env.transferzBaseUrl}${env.transferzAvailabilityPath}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        origin: toTransferzLocation(input.pickupLabel),
        destination: toTransferzLocation(input.dropoffLabel),
        pickupDateTime: input.pickupAt,
        adultPassengers: input.passengers ?? 2,
        childPassengers: 0,
        infantPassengers: 0,
        checkedLuggage: Math.max(1, Math.ceil((input.passengers ?? 2) / 2)),
        carryOnLuggage: input.passengers ?? 2,
        currencyCode: "USD",
      }),
      next: {
        revalidate: 900,
      },
    });

    if (!response.ok) {
      throw new Error(`Transferz availability request failed: ${response.status}`);
    }

    const raw = await response.json();

    return {
      meta: {
        providerEnabled: true,
        providerName: "Transferz",
      },
      offers: extractRideOffers(raw, input),
      raw,
    };
  } catch (error) {
    return {
      meta: {
        providerEnabled: true,
        providerName: "Transferz",
        error: error instanceof Error ? error.message : "Transferz search failed.",
      },
      offers: [],
    };
  }
}

function extractRideOffers(payload: unknown, input: RideSearchInput): RideOffer[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const quotes = (payload as { quotes?: unknown[] }).quotes;

  if (!Array.isArray(quotes)) {
    return [];
  }

  return quotes.slice(0, 8).map((entry) => {
    const record = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;
    const price =
      typeof record.price === "number"
        ? record.price
        : null;

    return {
      provider: "transferz",
      title:
        (typeof record.vehicleCategory === "string" && record.vehicleCategory) ||
        (typeof record.vehicleModels === "string" && record.vehicleModels) ||
        "Airport transfer",
      pickupLabel: input.pickupLabel,
      dropoffLabel: input.dropoffLabel,
      pickupAt: input.pickupAt,
      totalPrice: price,
      currency:
        (typeof record.currencyCode === "string" && record.currencyCode) ||
        "USD",
      vehicleType:
        (typeof record.vehicleCategory === "string" && record.vehicleCategory) ||
        null,
      durationMinutes:
        typeof record.includedWaitingTimeInMinutes === "number"
          ? record.includedWaitingTimeInMinutes
          : null,
      deepLinkUrl: null,
    };
  });
}
