import { env } from "@/env";
import type { FlightOffer, FlightSearchInput, SearchMeta } from "@/lib/travel/types";

type FlightSearchResult = {
  meta: SearchMeta;
  offers: FlightOffer[];
  raw?: unknown;
};

function hasSkyscannerCredentials() {
  return Boolean(env.skyscannerApiKey);
}

function toCabinClass(value: FlightSearchInput["cabinClass"]) {
  switch (value) {
    case "premium_economy":
      return "CABIN_CLASS_PREMIUM_ECONOMY";
    case "business":
      return "CABIN_CLASS_BUSINESS";
    case "first":
      return "CABIN_CLASS_FIRST";
    case "economy":
    default:
      return "CABIN_CLASS_ECONOMY";
  }
}

function toDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return { year, month, day };
}

function toSkyscannerDate(date: string) {
  return date.replaceAll("-", "").slice(2);
}

export function buildSkyscannerSearchUrl(input: FlightSearchInput) {
  const origin = input.originIata.trim().toLowerCase();
  const destination = input.destinationIata.trim().toLowerCase();
  const departDate = toSkyscannerDate(input.departDate);
  const returnDate = input.returnDate ? `/${toSkyscannerDate(input.returnDate)}` : "";
  const adults = input.adults ?? 1;

  return `https://www.skyscanner.com/transport/flights/${origin}/${destination}/${departDate}${returnDate}/?adultsv2=${adults}`;
}

async function skyscannerFetch(path: string, body: unknown) {
  const response = await fetch(`${env.skyscannerBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.skyscannerApiKey,
    },
    body: JSON.stringify(body),
    next: {
      revalidate: 1_800,
    },
  });

  if (!response.ok) {
    throw new Error(`Skyscanner request failed: ${response.status}`);
  }

  return response.json();
}

async function createLiveSession(body: unknown) {
  return skyscannerFetch(env.skyscannerLiveCreatePath, body);
}

async function pollLiveSession(sessionToken: string) {
  const response = await fetch(
    `${env.skyscannerBaseUrl}${env.skyscannerLivePollPath}/${encodeURIComponent(sessionToken)}`,
    {
      method: "POST",
      headers: {
        "x-api-key": env.skyscannerApiKey,
      },
      next: {
        revalidate: 300,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Skyscanner poll failed: ${response.status}`);
  }

  return response.json();
}

function readNumericPrice(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  for (const key of ["amount", "raw", "value"]) {
    const candidate = (value as Record<string, unknown>)[key];

    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return null;
}

function extractFlightOffers(payload: unknown, input: FlightSearchInput): FlightOffer[] {
  const offers: FlightOffer[] = [];
  const stack: unknown[] = [payload];
  const seen = new Set<unknown>();

  while (stack.length > 0 && offers.length < 6) {
    const current = stack.pop();

    if (!current || typeof current !== "object" || seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        stack.push(item);
      }

      continue;
    }

    const record = current as Record<string, unknown>;
    const price = readNumericPrice(record.price);
    const deepLinkUrl =
      (typeof record.deepLink === "string" && record.deepLink) ||
      (typeof record.deeplinkUrl === "string" && record.deeplinkUrl) ||
      (typeof record.url === "string" && record.url) ||
      null;

    if (price !== null || deepLinkUrl) {
      const title =
        (typeof record.name === "string" && record.name) ||
        (typeof record.itineraryId === "string" && `Itinerary ${record.itineraryId}`) ||
        `${input.originIata} to ${input.destinationIata}`;

      offers.push({
        provider: "skyscanner",
        title,
        originIata: input.originIata,
        destinationIata: input.destinationIata,
        departDate: input.departDate,
        returnDate: input.returnDate ?? null,
        price,
        currency:
          (typeof record.currency === "string" && record.currency) ||
          (typeof record.currencyCode === "string" && record.currencyCode) ||
          "USD",
        carrierName:
          (typeof record.agentName === "string" && record.agentName) ||
          (typeof record.carrierName === "string" && record.carrierName) ||
          null,
        deepLinkUrl,
      });
    }

    for (const value of Object.values(record)) {
      stack.push(value);
    }
  }

  return offers;
}

export async function searchSkyscannerFlights(
  input: FlightSearchInput,
): Promise<FlightSearchResult> {
  const searchUrl = buildSkyscannerSearchUrl(input);

  if (!hasSkyscannerCredentials()) {
    return {
      meta: {
        providerEnabled: false,
        providerName: "Skyscanner",
        searchUrl,
        error: "Skyscanner credentials are not configured yet.",
      },
      offers: [],
    };
  }

  const payload = {
    query: {
      market: "US",
      locale: "en-US",
      currency: "USD",
      adults: input.adults ?? 1,
      cabinClass: toCabinClass(input.cabinClass),
      queryLegs: [
        {
          originPlaceId: { iata: input.originIata },
          destinationPlaceId: { iata: input.destinationIata },
          date: toDateParts(input.departDate),
        },
        ...(input.returnDate
          ? [
              {
                originPlaceId: { iata: input.destinationIata },
                destinationPlaceId: { iata: input.originIata },
                date: toDateParts(input.returnDate),
              },
            ]
          : []),
      ],
    },
  };

  try {
    const liveSession = (await createLiveSession(payload)) as { sessionToken?: string };
    const raw = liveSession.sessionToken
      ? await pollLiveSession(liveSession.sessionToken)
      : await skyscannerFetch(env.skyscannerIndicativeSearchPath, payload);
    const offers = extractFlightOffers(raw, input);

    return {
      meta: {
        providerEnabled: true,
        providerName: "Skyscanner",
        searchUrl,
      },
      offers,
      raw,
    };
  } catch (error) {
    return {
      meta: {
        providerEnabled: true,
        providerName: "Skyscanner",
        searchUrl,
        error: error instanceof Error ? error.message : "Flight search failed.",
      },
      offers: [],
    };
  }
}
