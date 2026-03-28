import type { Hotel } from "@/db/schema";

type StayCategory =
  | "airport-practical"
  | "airport-upscale"
  | "downtown-business"
  | "downtown-luxury"
  | "waterfront-premium"
  | "waterfront-luxury"
  | "bellevue-business"
  | "bellevue-upscale"
  | "kirkland-upscale";

type StayTemplate = {
  styleLabel: string;
  rateLow: number;
  rateHigh: number;
  bestFor: string[];
  planningNote: string;
};

export type HotelStaySnapshot = {
  provider: "manual";
  styleLabel: string;
  rateLow: number;
  rateHigh: number;
  bestFor: string[];
  planningNote: string;
  nightlyRateLabel: string;
  priceRangeLabel: string;
};

const stayTemplates: Record<StayCategory, StayTemplate> = {
  "airport-practical": {
    styleLabel: "Airport overnight stay",
    rateLow: 165,
    rateHigh: 265,
    bestFor: ["Late arrivals", "Early departures", "One-night airport stays"],
    planningNote:
      "Useful when the priority is a short ride after landing and an easy trip back to the terminal the next day.",
  },
  "airport-upscale": {
    styleLabel: "Airport premium stay",
    rateLow: 255,
    rateHigh: 395,
    bestFor: ["Long layovers", "Quieter airport stays", "Premium overnight plans"],
    planningNote:
      "A better fit when you still want the airport nearby but do not want the stay to feel like a basic overnight stop.",
  },
  "downtown-business": {
    styleLabel: "Downtown city stay",
    rateLow: 235,
    rateHigh: 395,
    bestFor: ["Business trips", "Convention stays", "Walkable downtown plans"],
    planningNote:
      "Strong for central Seattle trips where hotel location matters as much as the airport ride.",
  },
  "downtown-luxury": {
    styleLabel: "Downtown luxury stay",
    rateLow: 345,
    rateHigh: 595,
    bestFor: ["Premium city stays", "Long-haul arrivals", "High-touch travel days"],
    planningNote:
      "Best when the airport transfer is part of a higher-end downtown stay rather than just a simple arrival ride.",
  },
  "waterfront-premium": {
    styleLabel: "Waterfront stay",
    rateLow: 295,
    rateHigh: 495,
    bestFor: ["Cruise pre-stays", "Pike Place access", "Waterfront weekends"],
    planningNote:
      "Good when you want the waterfront, Pike Place, or Pier 66 access to be part of the same plan as the airport ride.",
  },
  "waterfront-luxury": {
    styleLabel: "Waterfront luxury stay",
    rateLow: 425,
    rateHigh: 775,
    bestFor: ["Luxury waterfront stays", "Cruise extensions", "Celebration travel"],
    planningNote:
      "Most useful when the hotel stay itself is a major part of the trip and the airport transfer needs to stay smooth.",
  },
  "bellevue-business": {
    styleLabel: "Bellevue business stay",
    rateLow: 215,
    rateHigh: 355,
    bestFor: ["Office visits", "Eastside meetings", "Conference stays"],
    planningNote:
      "Useful for Bellevue trips where the airport ride is tied to meetings, office visits, or a quieter stay outside downtown Seattle.",
  },
  "bellevue-upscale": {
    styleLabel: "Bellevue premium stay",
    rateLow: 295,
    rateHigh: 495,
    bestFor: ["Executive travel", "Longer Eastside stays", "Premium Bellevue hotels"],
    planningNote:
      "A better fit for Bellevue stays where hotel quality and meeting access matter more than simply reaching the Eastside fast.",
  },
  "kirkland-upscale": {
    styleLabel: "Kirkland waterfront stay",
    rateLow: 315,
    rateHigh: 535,
    bestFor: ["Lakefront stays", "Quiet premium trips", "Eastside weekend plans"],
    planningNote:
      "Works well when the airport ride feeds into a more residential Eastside stay instead of a downtown or Bellevue hotel.",
  },
};

const categoryByHotelSlug: Record<string, StayCategory> = {
  "coast-gateway-hotel": "airport-practical",
  "cedarbrook-lodge": "airport-upscale",
  "doubletree-seatac": "airport-practical",
  "hilton-seattle-airport-conference-center": "airport-practical",
  "seattle-airport-marriott": "airport-practical",
  "crowne-plaza-seattle-airport": "airport-practical",
  "radisson-hotel-seattle-airport": "airport-practical",
  "red-lion-hotel-seattle-airport": "airport-practical",
  "hampton-inn-suites-seatac-28th-ave": "airport-practical",
  "hilton-garden-inn-seattle-airport": "airport-practical",
  "aloft-seattle-seatac-airport": "airport-practical",
  "residence-inn-seatac-airport": "airport-practical",
  "fairmont-olympic-hotel": "downtown-luxury",
  "grand-hyatt-seattle": "downtown-business",
  "westin-seattle": "downtown-business",
  "lotte-hotel-seattle": "downtown-luxury",
  "hotel-1000-seattle": "downtown-luxury",
  "hyatt-at-olive-8": "downtown-business",
  "sheraton-grand-seattle": "downtown-business",
  "motif-seattle": "downtown-business",
  "renaissance-seattle-hotel": "downtown-business",
  "kimpton-hotel-monaco-seattle": "downtown-business",
  "alexis-royal-sonesta-hotel-seattle": "downtown-business",
  "edgewater-hotel": "waterfront-premium",
  "four-seasons-hotel-seattle": "waterfront-luxury",
  "inn-at-the-market": "waterfront-premium",
  "seattle-marriott-waterfront": "waterfront-premium",
  "thompson-seattle": "waterfront-premium",
  "state-hotel-seattle": "waterfront-premium",
  "kimpton-palladian-hotel": "waterfront-premium",
  "charter-hotel-seattle": "waterfront-premium",
  "hyatt-regency-bellevue": "bellevue-business",
  "westin-bellevue": "bellevue-business",
  "w-bellevue": "bellevue-upscale",
  "ac-hotel-bellevue": "bellevue-business",
  "bellevue-club-hotel": "bellevue-upscale",
  "hilton-bellevue": "bellevue-business",
  "seattle-marriott-bellevue": "bellevue-business",
  "residence-inn-bellevue-downtown": "bellevue-business",
  "embassy-suites-bellevue": "bellevue-business",
  "hotel-116-bellevue": "bellevue-business",
  "woodmark-hotel-kirkland": "kirkland-upscale",
};

const stayTemplateByArea: Record<string, StayCategory> = {
  "seatac-hotels": "airport-practical",
  "downtown-seattle": "downtown-business",
  waterfront: "waterfront-premium",
  bellevue: "bellevue-business",
  kirkland: "kirkland-upscale",
};

function formatRateRange(rateLow: number, rateHigh: number) {
  return `$${rateLow}-$${rateHigh} / night`;
}

export function getHotelStaySnapshot(hotel: Hotel): HotelStaySnapshot {
  const category =
    categoryByHotelSlug[hotel.slug] ?? stayTemplateByArea[hotel.area] ?? "downtown-business";
  const template = stayTemplates[category];

  return {
    provider: "manual",
    ...template,
    nightlyRateLabel: formatRateRange(template.rateLow, template.rateHigh),
    priceRangeLabel: `${template.rateLow}-${template.rateHigh} USD per night`,
  };
}

export function getHotelClusterStayRangeLabel(hotels: Hotel[]) {
  const snapshots = hotels.map(getHotelStaySnapshot);
  const low = Math.min(...snapshots.map((snapshot) => snapshot.rateLow));
  const high = Math.max(...snapshots.map((snapshot) => snapshot.rateHigh));
  return formatRateRange(low, high);
}
