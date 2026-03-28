export type AirlineGuide = {
  code: string;
  slug: string;
  name: string;
  title: string;
  description: string;
  concourse: string;
  pickupNotes: string;
  bestFor: string[];
  routeSlugs: string[];
  hotelSlugs: string[];
  relatedLinks: { href: string; label: string }[];
};

export const airlineGuides: AirlineGuide[] = [
  {
    code: "AS",
    slug: "alaska-at-seatac",
    name: "Alaska Airlines",
    title: "Alaska Airlines at Sea-Tac",
    description:
      "Alaska at Sea-Tac guide with terminal and concourse notes, arrivals pickup timing, departures planning, and airport transfer options.",
    concourse: "Mostly N and C gates",
    pickupNotes:
      "Give baggage claim a little more time on busy domestic banks, especially if you are traveling with checked bags or ski gear.",
    bestFor: ["Domestic arrivals", "West Coast flights", "Frequent Seattle visitors"],
    routeSlugs: ["seatac-downtown-core", "seatac-pier-66", "seatac-pier-91"],
    hotelSlugs: ["edgewater-hotel", "inn-at-the-market", "coast-gateway-hotel"],
    relatedLinks: [
      { href: "/seatac-to-waterfront-hotels", label: "Seattle waterfront hotels" },
      { href: "/seatac-to-cruise-pre-stay-hotels", label: "Cruise pre-stay hotels" },
      { href: "/bell-street-cruise-terminal-pier-66", label: "Pier 66 guide" },
      { href: "/seatac-to-downtown-seattle", label: "Sea-Tac to downtown Seattle" },
    ],
  },
  {
    code: "DL",
    slug: "delta-at-seatac",
    name: "Delta Air Lines",
    title: "Delta Air Lines at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for Delta travelers arriving at Sea-Tac.",
    concourse: "Mostly A and B gates",
    pickupNotes:
      "For domestic arrivals, plan on a standard post-landing walk plus baggage time before heading to the pickup level.",
    bestFor: ["Domestic and hub connections", "Business travel", "East Coast arrivals"],
    routeSlugs: ["seatac-downtown-core", "seatac-bellevue-core", "seatac-airport-hotels-core"],
    hotelSlugs: ["grand-hyatt-seattle", "hyatt-regency-bellevue", "coast-gateway-hotel"],
    relatedLinks: [
      { href: "/seatac-airport-overnight-hotels", label: "Overnight airport hotels" },
      { href: "/seatac-to-bellevue-hotels", label: "Bellevue hotel transfers" },
      { href: "/seatac-to-bellevue", label: "Sea-Tac to Bellevue" },
      { href: "/departures", label: "Sea-Tac departures guide" },
    ],
  },
  {
    code: "UA",
    slug: "united-at-seatac",
    name: "United Airlines",
    title: "United Airlines at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for United travelers at Sea-Tac.",
    concourse: "Mostly A gates",
    pickupNotes:
      "If you are connecting through Sea-Tac, keep terminal walking time and checked-bag timing in mind before choosing the pickup window.",
    bestFor: ["Hub connections", "Domestic arrivals", "Corporate travel"],
    routeSlugs: ["seatac-downtown-core", "seatac-bellevue-core", "seatac-kirkland-core"],
    hotelSlugs: ["grand-hyatt-seattle", "westin-bellevue", "woodmark-hotel-kirkland"],
    relatedLinks: [
      { href: "/seatac-to-bellevue-hotels", label: "Bellevue hotel transfers" },
      { href: "/seatac-to-bellevue", label: "Sea-Tac to Bellevue" },
      { href: "/seatac-to-kirkland", label: "Sea-Tac to Kirkland" },
      { href: "/arrivals", label: "Sea-Tac arrivals guide" },
    ],
  },
  {
    code: "AA",
    slug: "american-at-seatac",
    name: "American Airlines",
    title: "American Airlines at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for American Airlines travelers arriving at Sea-Tac.",
    concourse: "Mostly D gates",
    pickupNotes:
      "Use a slightly wider pickup window if you are checking bags or landing during the busier afternoon arrival bank.",
    bestFor: ["Domestic arrivals", "East Coast travel", "Connections"],
    routeSlugs: ["seatac-downtown-core", "seatac-bellevue-core", "seatac-pier-66"],
    hotelSlugs: ["fairmont-olympic-hotel", "hyatt-regency-bellevue", "edgewater-hotel"],
    relatedLinks: [
      { href: "/seatac-to-downtown-seattle-hotels", label: "Downtown Seattle hotels" },
      { href: "/seatac-to-bellevue-hotels", label: "Bellevue hotel transfers" },
      { href: "/bell-street-cruise-terminal-pier-66", label: "Pier 66 guide" },
      { href: "/seatac-to-pier-66", label: "Sea-Tac to Pier 66" },
    ],
  },
  {
    code: "WN",
    slug: "southwest-at-seatac",
    name: "Southwest Airlines",
    title: "Southwest Airlines at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for Southwest travelers moving through Sea-Tac.",
    concourse: "Mostly C gates",
    pickupNotes:
      "Southwest arrival banks can bunch up with checked bags, so give your pickup window a little room during busy morning and evening periods.",
    bestFor: ["Domestic arrivals", "Family travel", "Flexible leisure trips"],
    routeSlugs: ["seatac-downtown-core", "seatac-airport-hotels-core", "seatac-pier-66"],
    hotelSlugs: ["doubletree-seatac", "grand-hyatt-seattle", "seattle-marriott-waterfront"],
    relatedLinks: [
      { href: "/seatac-airport-hotels", label: "Sea-Tac airport hotels" },
      { href: "/seatac-to-downtown-seattle-hotels", label: "Downtown Seattle hotels" },
      { href: "/seatac-to-pier-66", label: "Sea-Tac to Pier 66" },
      { href: "/departures", label: "Sea-Tac departures guide" },
    ],
  },
  {
    code: "B6",
    slug: "jetblue-at-seatac",
    name: "JetBlue",
    title: "JetBlue at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for JetBlue travelers arriving at Sea-Tac.",
    concourse: "Mostly A gates",
    pickupNotes:
      "If you are arriving on a transcontinental flight, allow a standard post-landing buffer for baggage and terminal exit before setting pickup.",
    bestFor: ["Transcontinental arrivals", "Leisure trips", "East Coast travelers"],
    routeSlugs: ["seatac-downtown-core", "seatac-pier-66", "seatac-airport-hotels-core"],
    hotelSlugs: ["lotte-hotel-seattle", "four-seasons-hotel-seattle", "coast-gateway-hotel"],
    relatedLinks: [
      { href: "/seatac-airport-overnight-hotels", label: "Overnight airport hotels" },
      { href: "/seatac-to-downtown-seattle-luxury-hotels", label: "Luxury downtown hotels" },
      { href: "/seatac-to-pier-66", label: "Sea-Tac to Pier 66" },
      { href: "/arrivals", label: "Sea-Tac arrivals guide" },
    ],
  },
  {
    code: "AC",
    slug: "air-canada-at-seatac",
    name: "Air Canada",
    title: "Air Canada at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for Air Canada travelers at Sea-Tac.",
    concourse: "Mostly A and S gates",
    pickupNotes:
      "Cross-border arrivals and baggage timing can vary, so keep a wider pickup buffer than a simple domestic arrival.",
    bestFor: ["Canada flights", "Cross-border arrivals", "Business travel"],
    routeSlugs: ["seatac-downtown-core", "seatac-bellevue-core", "seatac-airport-hotels-core"],
    hotelSlugs: ["fairmont-olympic-hotel", "hyatt-regency-bellevue", "hilton-seattle-airport-conference-center"],
    relatedLinks: [
      { href: "/seatac-airport-hotels", label: "Sea-Tac airport hotels" },
      { href: "/seatac-to-bellevue-hotels", label: "Bellevue hotel transfers" },
      { href: "/seatac-to-bellevue", label: "Sea-Tac to Bellevue" },
      { href: "/departures", label: "Sea-Tac departures guide" },
    ],
  },
  {
    code: "BA",
    slug: "british-airways-at-seatac",
    name: "British Airways",
    title: "British Airways at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for British Airways travelers arriving at Sea-Tac.",
    concourse: "Mostly S gates",
    pickupNotes:
      "International arrivals need extra time for immigration, baggage, and curb access, especially on long-haul evening landings.",
    bestFor: ["International arrivals", "Long-haul travel", "Luxury stays"],
    routeSlugs: ["seatac-downtown-core", "seatac-pier-66", "seatac-pier-91"],
    hotelSlugs: ["fairmont-olympic-hotel", "four-seasons-hotel-seattle", "edgewater-hotel"],
    relatedLinks: [
      { href: "/seatac-to-downtown-seattle-luxury-hotels", label: "Luxury downtown hotels" },
      { href: "/seatac-to-waterfront-hotels", label: "Waterfront hotel transfers" },
      { href: "/seatac-to-pier-91", label: "Sea-Tac to Pier 91" },
      { href: "/smith-cove-cruise-terminal-pier-91", label: "Pier 91 guide" },
    ],
  },
  {
    code: "LH",
    slug: "lufthansa-at-seatac",
    name: "Lufthansa",
    title: "Lufthansa at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for Lufthansa travelers landing at Sea-Tac.",
    concourse: "Mostly S gates",
    pickupNotes:
      "Treat international arrivals as longer pickups, with extra time for immigration, baggage, and terminal exit before meeting the car.",
    bestFor: ["International arrivals", "Corporate travel", "Europe connections"],
    routeSlugs: ["seatac-downtown-core", "seatac-bellevue-core", "seatac-pier-91"],
    hotelSlugs: ["hotel-1000-seattle", "westin-bellevue", "seattle-marriott-waterfront"],
    relatedLinks: [
      { href: "/seatac-to-downtown-seattle-hotels", label: "Downtown Seattle hotels" },
      { href: "/seatac-to-bellevue-hotels", label: "Bellevue hotel transfers" },
      { href: "/seatac-to-pier-91", label: "Sea-Tac to Pier 91" },
      { href: "/smith-cove-cruise-terminal-pier-91", label: "Pier 91 guide" },
    ],
  },
  {
    code: "HA",
    slug: "hawaiian-airlines-at-seatac",
    name: "Hawaiian Airlines",
    title: "Hawaiian Airlines at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for Hawaiian Airlines travelers arriving at Sea-Tac.",
    concourse: "Mostly S gates",
    pickupNotes:
      "Island arrivals often mean checked bags and longer terminal time, so it helps to leave extra room before pickup.",
    bestFor: ["Hawaii arrivals", "Family travel", "Longer stays"],
    routeSlugs: ["seatac-downtown-core", "seatac-airport-hotels-core", "seatac-pier-66"],
    hotelSlugs: ["four-seasons-hotel-seattle", "seattle-airport-marriott", "seattle-marriott-waterfront"],
    relatedLinks: [
      { href: "/seatac-airport-overnight-hotels", label: "Overnight airport hotels" },
      { href: "/seatac-to-waterfront-hotels", label: "Waterfront hotel transfers" },
      { href: "/seatac-to-pier-66", label: "Sea-Tac to Pier 66" },
      { href: "/arrivals", label: "Sea-Tac arrivals guide" },
    ],
  },
  {
    code: "F9",
    slug: "frontier-at-seatac",
    name: "Frontier Airlines",
    title: "Frontier Airlines at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for Frontier travelers moving through Sea-Tac.",
    concourse: "Mostly B and C gates",
    pickupNotes:
      "Budget carriers can cluster arrivals, so checked bags and curb timing can take a little longer than expected.",
    bestFor: ["Domestic leisure travel", "Flexible trips", "Airport hotel stays"],
    routeSlugs: ["seatac-airport-hotels-core", "seatac-downtown-core", "seatac-pier-66"],
    hotelSlugs: ["red-lion-hotel-seattle-airport", "motif-seattle", "inn-at-the-market"],
    relatedLinks: [
      { href: "/seatac-airport-hotels", label: "Sea-Tac airport hotels" },
      { href: "/seatac-to-downtown-seattle-hotels", label: "Downtown Seattle hotels" },
      { href: "/seatac-to-pier-66", label: "Sea-Tac to Pier 66" },
      { href: "/departures", label: "Sea-Tac departures guide" },
    ],
  },
  {
    code: "NK",
    slug: "spirit-airlines-at-seatac",
    name: "Spirit Airlines",
    title: "Spirit Airlines at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for Spirit Airlines travelers arriving at Sea-Tac.",
    concourse: "Mostly A and B gates",
    pickupNotes:
      "Allow a little more room if you expect checked bags or are arriving during one of the busier evening banks.",
    bestFor: ["Domestic arrivals", "Budget-conscious travel", "Overnight stays"],
    routeSlugs: ["seatac-airport-hotels-core", "seatac-downtown-core", "seatac-bellevue-core"],
    hotelSlugs: ["hampton-inn-suites-seatac-28th-ave", "doubletree-seatac", "hyatt-regency-bellevue"],
    relatedLinks: [
      { href: "/seatac-airport-overnight-hotels", label: "Overnight airport hotels" },
      { href: "/seatac-to-bellevue-hotels", label: "Bellevue hotel transfers" },
      { href: "/seatac-to-bellevue", label: "Sea-Tac to Bellevue" },
      { href: "/arrivals", label: "Sea-Tac arrivals guide" },
    ],
  },
  {
    code: "KE",
    slug: "korean-air-at-seatac",
    name: "Korean Air",
    title: "Korean Air at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for Korean Air travelers arriving at Sea-Tac.",
    concourse: "Mostly S gates",
    pickupNotes:
      "International arrivals through Sea-Tac usually need extra margin for immigration, baggage, and terminal exit before meeting the car.",
    bestFor: ["International arrivals", "Long-haul travel", "Downtown stays"],
    routeSlugs: ["seatac-downtown-core", "seatac-pier-91", "seatac-airport-hotels-core"],
    hotelSlugs: ["lotte-hotel-seattle", "fairmont-olympic-hotel", "hilton-seattle-airport-conference-center"],
    relatedLinks: [
      { href: "/seatac-to-downtown-seattle-luxury-hotels", label: "Luxury downtown hotels" },
      { href: "/seatac-airport-hotels", label: "Sea-Tac airport hotels" },
      { href: "/seatac-to-pier-91", label: "Sea-Tac to Pier 91" },
      { href: "/smith-cove-cruise-terminal-pier-91", label: "Pier 91 guide" },
    ],
  },
  {
    code: "AF",
    slug: "air-france-at-seatac",
    name: "Air France",
    title: "Air France at Sea-Tac",
    description:
      "Pickup guidance, concourse notes, and airport transfer options for Air France travelers arriving at Sea-Tac.",
    concourse: "Mostly S gates",
    pickupNotes:
      "International evening arrivals usually need a wider pickup window, especially if you are meeting bags and heading straight into downtown Seattle.",
    bestFor: ["International arrivals", "Premium stays", "Cruise extensions"],
    routeSlugs: ["seatac-downtown-core", "seatac-pier-66", "seatac-pier-91"],
    hotelSlugs: ["thompson-seattle", "four-seasons-hotel-seattle", "edgewater-hotel"],
    relatedLinks: [
      { href: "/seatac-to-downtown-seattle-luxury-hotels", label: "Luxury downtown hotels" },
      { href: "/seatac-to-waterfront-hotels", label: "Waterfront hotel transfers" },
      { href: "/bell-street-cruise-terminal-pier-66", label: "Pier 66 guide" },
      { href: "/smith-cove-cruise-terminal-pier-91", label: "Pier 91 guide" },
    ],
  },
];

export function getAirlineGuideByCode(code?: string | null) {
  if (!code) {
    return null;
  }

  return airlineGuides.find((airline) => airline.code === code) ?? null;
}

export function getAirlineGuideBySlug(slug: string) {
  return airlineGuides.find((airline) => airline.slug === slug) ?? null;
}

export function getAirlineGuideHref(slug: string) {
  return `/airlines/${slug}`;
}

export function getAirlineGuideSlugs() {
  return airlineGuides.map((airline) => airline.slug);
}
