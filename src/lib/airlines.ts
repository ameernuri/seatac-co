export type AirlineGuide = {
  code: string;
  slug: string;
  name: string;
  title: string;
  description: string;
  concourse: string;
  checkInNotes?: string;
  baggageNotes?: string;
  airportUpgradeNotes?: string;
  pickupNotes: string;
  bestFor: string[];
  routeSlugs: string[];
  hotelSlugs: string[];
  faq?: { question: string; answer: string }[];
  relatedLinks: { href: string; label: string }[];
  sourceLinks?: { href: string; label: string }[];
};

export const airlineGuides: AirlineGuide[] = [
  {
    code: "AS",
    slug: "alaska-at-seatac",
    name: "Alaska Airlines",
    title: "Alaska Airlines at Sea-Tac",
    description:
      "Alaska Airlines at Sea-Tac guide with SEA Gateway check-in notes, N and C gate planning, baggage timing, arrivals pickup guidance, and airport transfer links.",
    concourse: "Primarily North Satellite and C gates, with day-of-flight gate assignments subject to change",
    checkInNotes:
      "Alaska passengers use the SEA Gateway lobby experience at Sea-Tac, where the airport and airline added expanded check-in, bag-drop, ticketing, and passenger processing space. Use Alaska's day-of-travel tools and Sea-Tac signs for the exact counter, kiosk, and gate assignment.",
    baggageNotes:
      "Checked-bag timing matters for Alaska arrivals and departures because Alaska handles a large share of SEA traffic. Build in extra time during peak morning, afternoon, holiday, and cruise-season travel periods, especially if you are traveling with family bags, ski gear, or cruise luggage.",
    airportUpgradeNotes:
      "The Port of Seattle and Alaska Airlines completed the SEA Gateway project to modernize the front-end Alaska passenger journey at SEA. For travelers, the practical takeaway is better check-in and bag-drop flow, but not a reason to cut arrival time too close during busy banks.",
    pickupNotes:
      "For Alaska domestic arrivals, wait until the aircraft is at the gate and baggage status is clear before tightening the pickup window. If bags are checked, plan a wider buffer before meeting your ride at Sea-Tac because baggage claim and curb access can be the slowest part of the trip.",
    bestFor: ["SEA Gateway check-in", "Domestic arrivals", "West Coast flights", "Frequent Seattle visitors"],
    routeSlugs: ["seatac-downtown-core", "seatac-pier-66", "seatac-pier-91"],
    hotelSlugs: ["edgewater-hotel", "inn-at-the-market", "coast-gateway-hotel"],
    faq: [
      {
        question: "Where does Alaska Airlines check in at Sea-Tac?",
        answer:
          "Alaska travelers should follow Sea-Tac and Alaska signage for the SEA Gateway check-in and bag-drop area. The exact counter, kiosk, and bag-drop flow can vary by service need, so use Alaska's airport tools and day-of-travel airport signs before heading to security.",
      },
      {
        question: "Which concourse does Alaska Airlines use at SEA?",
        answer:
          "Alaska commonly uses North Satellite and C gates at Sea-Tac, but SEA gate assignments can change. Treat the concourse guidance as a planning baseline and confirm the exact gate in Alaska's app, the airport monitors, or the Sea-Tac flight status page.",
      },
      {
        question: "How early should Alaska passengers arrive at Sea-Tac?",
        answer:
          "Use Alaska and Sea-Tac day-of-travel guidance for the final arrival time. As a practical planning rule, give yourself more time when checking bags, traveling during holiday or cruise periods, or using airport parking before an Alaska departure.",
      },
      {
        question: "When should I schedule pickup after an Alaska arrival?",
        answer:
          "Do not schedule the car for the published landing minute. For carry-on-only domestic Alaska arrivals, use a moderate post-gate buffer. For checked bags, family travel, ski gear, or cruise luggage, add more time so the pickup happens after baggage claim is realistic.",
      },
      {
        question: "What pages should Alaska passengers open next?",
        answer:
          "Most Alaska passengers need the Sea-Tac arrivals page, departures page, flight lookup, airport transfer guide, or a route page such as Sea-Tac to downtown Seattle, Pier 66, or Pier 91.",
      },
    ],
    relatedLinks: [
      { href: "/arrivals", label: "Sea-Tac arrivals guide" },
      { href: "/departures", label: "Sea-Tac departures guide" },
      { href: "/flight", label: "Alaska flight lookup" },
      { href: "/seatac-airport-transfer-guide", label: "Airport transfer guide" },
      { href: "/seatac-to-downtown-seattle", label: "Sea-Tac to downtown Seattle" },
      { href: "/seatac-to-pier-66", label: "Sea-Tac to Pier 66" },
      { href: "/seatac-to-pier-91", label: "Sea-Tac to Pier 91" },
      { href: "/seatac-airport-hotels", label: "Sea-Tac airport hotels" },
    ],
    sourceLinks: [
      { href: "https://www.portseattle.org/projects/sea-gateway-project", label: "Port of Seattle SEA Gateway project" },
      { href: "https://www.alaskaair.com/content/airports", label: "Alaska Airlines airport information" },
      { href: "https://www.portseattle.org/sea-tac/airlines-destinations", label: "Sea-Tac airlines and destinations" },
      { href: "https://www.portseattle.org/sea-tac/maps", label: "Sea-Tac airport maps" },
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
