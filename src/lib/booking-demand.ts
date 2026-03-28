import type { Hotel } from "@/db/schema";
import { env } from "@/env";
import type { StayWindow } from "@/lib/stay-dates";

type BookingDemandCity = {
  id: number;
  name: string;
};

type BookingDemandHotelRate = {
  provider: "booking_demand";
  accommodationId: number;
  currency: string;
  totalPrice: number;
  nightlyRate: number;
  checkin: string;
  checkout: string;
  deeplinkUrl: string | null;
};

const cityIdCache = new Map<string, number | null>();

function hasBookingDemandCredentials() {
  return Boolean(env.bookingDemandToken && env.bookingDemandAffiliateId);
}

function normalizeHotelName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s]/g, " ")
    .replace(/\b(hotel|the|seattle|seatac|sea tac|airport|downtown|and)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreHotelNameMatch(hotelName: string, candidateName: string) {
  const hotelTokens = new Set(normalizeHotelName(hotelName).split(" ").filter(Boolean));
  const candidateTokens = new Set(normalizeHotelName(candidateName).split(" ").filter(Boolean));

  let score = 0;

  for (const token of hotelTokens) {
    if (candidateTokens.has(token)) {
      score += 2;
    }
  }

  if (normalizeHotelName(candidateName).includes(normalizeHotelName(hotelName))) {
    score += 4;
  }

  return score;
}

function getHotelSearchArea(hotel: Hotel) {
  switch (hotel.area) {
    case "seatac-hotels":
      return { airport: "SEA" };
    case "bellevue":
      return { cityName: "Bellevue" };
    case "kirkland":
      return { cityName: "Kirkland" };
    case "waterfront":
    case "downtown-seattle":
    default:
      return { cityName: "Seattle" };
  }
}

async function bookingDemandFetch(path: string, body: unknown) {
  const response = await fetch(`${env.bookingDemandBaseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.bookingDemandToken}`,
      "X-Affiliate-Id": env.bookingDemandAffiliateId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    next: {
      revalidate: 21_600,
    },
  });

  if (!response.ok) {
    throw new Error(`Booking Demand API failed: ${response.status}`);
  }

  return response.json();
}

function parseCities(payload: unknown): BookingDemandCity[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = (payload as { data?: unknown[] }).data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const object = entry as { id?: number; name?: string };

      return typeof object.id === "number" && typeof object.name === "string"
        ? { id: object.id, name: object.name }
        : null;
    })
    .filter((entry): entry is BookingDemandCity => Boolean(entry));
}

async function getBookingDemandCityId(cityName: string) {
  const key = cityName.toLowerCase();

  if (cityIdCache.has(key)) {
    return cityIdCache.get(key) ?? null;
  }

  const payload = await bookingDemandFetch("/common/locations/cities", {
    country: "us",
  });

  const cities = parseCities(payload);
  const match =
    cities.find((city) => city.name.toLowerCase() === key) ??
    cities.find((city) => city.name.toLowerCase().includes(key)) ??
    null;

  cityIdCache.set(key, match?.id ?? null);
  return match?.id ?? null;
}

function readFirstNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = readFirstNumber(entry);
      if (nested !== null) {
        return nested;
      }
    }
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      const nested = readFirstNumber(nestedValue);
      if (nested !== null) {
        return nested;
      }
    }
  }

  return null;
}

function parseAccommodationRows(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = (payload as { data?: unknown[] }).data;

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const object = entry as Record<string, unknown>;
      const id = typeof object.id === "number" ? object.id : null;
      const name = typeof object.name === "string" ? object.name : null;
      const urlCandidates = [
        object.url,
        object.deep_link_url,
        object.link,
        object.checkout_url,
      ];
      const deeplinkUrl =
        urlCandidates.find((candidate) => typeof candidate === "string")?.toString() ?? null;
      const currency =
        (typeof object.currency === "string" ? object.currency : null) ??
        (typeof object.currency_code === "string" ? object.currency_code : null) ??
        "USD";

      const totalPrice =
        readFirstNumber(object.price) ??
        readFirstNumber(object.cheapest_product_price) ??
        readFirstNumber(object.composite_price_breakdown);

      return id && name && totalPrice
        ? {
            id,
            name,
            currency,
            totalPrice,
            deeplinkUrl,
          }
        : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        id: number;
        name: string;
        currency: string;
        totalPrice: number;
        deeplinkUrl: string | null;
      } => Boolean(entry),
    );
}

export async function getLiveHotelRate(
  hotel: Hotel,
  stayWindow: StayWindow,
): Promise<BookingDemandHotelRate | null> {
  if (!hasBookingDemandCredentials()) {
    return null;
  }

  const area = getHotelSearchArea(hotel);
  let selector: Record<string, unknown>;

  if ("airport" in area) {
    selector = { airport: area.airport };
  } else {
    const cityId = await getBookingDemandCityId(area.cityName);

    if (!cityId) {
      return null;
    }

    selector = { city: cityId };
  }

  const payload = await bookingDemandFetch("/accommodations/search", {
    ...selector,
    checkin: stayWindow.checkin,
    checkout: stayWindow.checkout,
    guests: {
      number_of_adults: 2,
      number_of_rooms: 1,
    },
    booker: {
      country: "us",
      platform: "desktop",
    },
    currency: "USD",
    extras: ["products"],
    rows: 25,
  });

  const rows = parseAccommodationRows(payload)
    .map((row) => ({
      ...row,
      score: scoreHotelNameMatch(hotel.name, row.name),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.totalPrice - b.totalPrice);

  const match = rows[0];

  if (!match) {
    return null;
  }

  return {
    provider: "booking_demand",
    accommodationId: match.id,
    currency: match.currency,
    totalPrice: match.totalPrice,
    nightlyRate: Math.round(match.totalPrice / stayWindow.nights),
    checkin: stayWindow.checkin,
    checkout: stayWindow.checkout,
    deeplinkUrl: match.deeplinkUrl,
  };
}
