import type { Hotel, Route } from "@/db/schema";
import type { RouteReservationDefaults } from "@/lib/route-booking";

export function getHotelArt(area: string) {
  switch (area) {
    case "seatac-hotels":
      return "/scene-airport.svg";
    case "bellevue":
      return "/downtown.night.jpeg";
    case "waterfront":
    case "downtown-seattle":
      return "/seattle.water.night.webp";
    case "kirkland":
      return "/scene-city.svg";
    default:
      return "/scene-airport.svg";
  }
}

export function getHotelAreaLabel(area: string) {
  switch (area) {
    case "seatac-hotels":
      return "Sea-Tac hotels";
    case "downtown-seattle":
      return "Downtown Seattle";
    case "waterfront":
      return "Seattle waterfront";
    case "bellevue":
      return "Bellevue";
    case "kirkland":
      return "Kirkland";
    default:
      return area;
  }
}

export function getHotelAreaGuideHref(area: string) {
  switch (area) {
    case "seatac-hotels":
      return "/seatac-airport-hotels";
    case "downtown-seattle":
      return "/seatac-to-downtown-seattle-hotels";
    case "waterfront":
      return "/seatac-to-waterfront-hotels";
    case "bellevue":
      return "/seatac-to-bellevue-hotels";
    default:
      return "/seatac-airport-hotels";
  }
}

export function deriveHotelReservationDefaults(
  hotel: Hotel,
  route: Route | null,
): RouteReservationDefaults {
  return {
    serviceMode: "airport",
    tripType: "flat",
    routeSlug: route?.slug ?? hotel.airportRouteSlug,
    pickupAddress: route?.origin ?? "Sea-Tac Airport",
    dropoffAddress: hotel.name,
  };
}

export function getHotelRouteName(hotel: Hotel) {
  return `Sea-Tac to ${hotel.name}`;
}

export function getHotelPageDescription(hotel: Hotel) {
  return `Private Sea-Tac to ${hotel.name} car service with direct airport pickup, hotel transfer timing, and online reservation.`;
}

export function getHotelFaqs(
  hotel: Hotel,
  snapshot: {
    fare: number;
    distanceMiles: number;
    durationMinutes: number;
  },
  staySnapshot?: {
    nightlyRateLabel: string;
  },
) {
  return [
    {
      question: `How far is ${hotel.name} from Sea-Tac?`,
      answer: `${hotel.name} is about ${snapshot.distanceMiles.toFixed(1)} miles from Sea-Tac. Most rides take around ${snapshot.durationMinutes} minutes, depending on traffic and pickup timing.`,
    },
    {
      question: `What is the starting price from Sea-Tac to ${hotel.name}?`,
      answer: `The starting fare shown for ${hotel.name} is $${snapshot.fare.toFixed(0)} before any trip-specific changes like vehicle choice, timing, or special requests.`,
    },
    {
      question: `Can I reserve a ride to ${hotel.name} online?`,
      answer: `Yes. This page links directly into an online reservation flow with ${hotel.name} already selected as the destination so you can enter your timing and complete the booking.`,
    },
    ...(staySnapshot
      ? [
          {
            question: `What does ${hotel.name} usually cost per night?`,
            answer: `${hotel.name} usually lands around ${staySnapshot.nightlyRateLabel}, depending on dates, demand, and the room type you book.`,
          },
        ]
      : []),
  ];
}
