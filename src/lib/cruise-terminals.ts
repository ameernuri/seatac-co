export type CruiseTerminalGuide = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  terminalName: string;
  terminalAddress: string;
  locationSummary: string;
  routeContext: string;
  airportRouteSlug: string;
  returnRouteSlug: string;
  airportRouteHref: string;
  returnRouteHref: string;
  hotelSlugs: string[];
  cruiseLines: string[];
  facts: Array<{
    label: string;
    value: string;
  }>;
  guidance: Array<{
    title: string;
    body: string;
  }>;
  usefulLinks: Array<{
    label: string;
    href: string;
  }>;
};

export const cruiseTerminalGuides: CruiseTerminalGuide[] = [
  {
    slug: "bell-street-cruise-terminal-pier-66",
    title: "Bell Street Cruise Terminal at Pier 66 | seatac.co",
    description:
      "Bell Street Cruise Terminal at Pier 66 guide with Sea-Tac transfer pricing, nearby hotel links, and direct reserve options.",
    eyebrow: "Cruise terminal guide",
    heroTitle: "Bell Street Cruise Terminal at Pier 66 for Sea-Tac transfers and waterfront stays.",
    heroBody:
      "Use this page to compare Sea-Tac to Pier 66 pricing, nearby waterfront hotel options, return airport rides, and cruise-line details before embarkation day.",
    terminalName: "Bell Street Cruise Terminal at Pier 66",
    terminalAddress: "2225 Alaskan Way, Seattle, WA 98121, USA",
    locationSummary:
      "Pier 66 sits on Seattle’s downtown waterfront, close to Belltown, Pike Place, and several cruise-adjacent hotels.",
    routeContext:
      "Best for same-day embarkation from Sea-Tac, downtown waterfront stays, and return airport rides after the cruise.",
    airportRouteSlug: "seatac-pier-66",
    returnRouteSlug: "pier-66-seatac",
    airportRouteHref: "/seatac-to-pier-66",
    returnRouteHref: "/departures",
    hotelSlugs: ["edgewater-hotel", "fairmont-olympic-hotel", "grand-hyatt-seattle"],
    cruiseLines: ["Norwegian Cruise Line", "Oceania Cruises"],
    facts: [
      { label: "Terminal area", value: "Downtown waterfront" },
      { label: "Cruise lines", value: "Norwegian, Oceania" },
      { label: "Good for", value: "Waterfront hotels and same-day embarkation" },
    ],
    guidance: [
      {
        title: "Close to central Seattle",
        body: "Pier 66 is the better fit if you want to stay near the waterfront, Pike Place, or downtown hotels before or after sailing.",
      },
      {
        title: "Airport-to-ship planning",
        body: "Sea-Tac to Pier 66 works best when flight arrival time, luggage count, and terminal arrival window are lined up ahead of time.",
      },
      {
        title: "Hotel bridge option",
        body: "If you are arriving a day early, downtown and waterfront hotel pages are the easiest next step before booking the final ride to the terminal.",
      },
    ],
    usefulLinks: [
      { label: "Sea-Tac to Pier 66", href: "/seatac-to-pier-66" },
      { label: "Pier 66 vs Pier 91 transfer guide", href: "/pier-66-vs-pier-91-transfer-guide" },
      { label: "Downtown Seattle hotel transfers", href: "/seatac-to-downtown-seattle-hotels" },
      { label: "Waterfront hotel transfers", href: "/seatac-to-waterfront-hotels" },
      { label: "Sea-Tac arrivals guide", href: "/arrivals" },
      { label: "Reserve online", href: "/reserve/seatac-pier-66" },
    ],
  },
  {
    slug: "smith-cove-cruise-terminal-pier-91",
    title: "Smith Cove Cruise Terminal at Pier 91 | seatac.co",
    description:
      "Smith Cove Cruise Terminal at Pier 91 guide with Sea-Tac transfer pricing, hotel links, and direct reserve options.",
    eyebrow: "Cruise terminal guide",
    heroTitle: "Smith Cove Cruise Terminal at Pier 91 for Sea-Tac transfers and cruise embarkation days.",
    heroBody:
      "Use this page to compare Sea-Tac to Pier 91 pricing, nearby hotel options, return airport rides, and cruise-line details before your sailing.",
    terminalName: "Smith Cove Cruise Terminal at Pier 91",
    terminalAddress: "2001 W Garfield St, Seattle, WA 98119, USA",
    locationSummary:
      "Pier 91 is northwest of the downtown core and is built for heavy embarkation traffic with dedicated ground transportation access.",
    routeContext:
      "Best for larger homeport sailings, luggage-heavy groups, and cruise days where direct airport or hotel transfers matter most.",
    airportRouteSlug: "seatac-pier-91",
    returnRouteSlug: "pier-91-seatac",
    airportRouteHref: "/seatac-to-pier-91",
    returnRouteHref: "/departures",
    hotelSlugs: ["edgewater-hotel", "westin-seattle", "fairmont-olympic-hotel"],
    cruiseLines: [
      "Carnival Cruise Line",
      "Celebrity Cruises",
      "Holland America Line",
      "MSC Cruises",
      "Princess Cruises",
      "Royal Caribbean",
      "Virgin Voyages",
    ],
    facts: [
      { label: "Terminal area", value: "Smith Cove / northwest Seattle" },
      { label: "Cruise lines", value: "Carnival, Celebrity, HAL, MSC, Princess, Royal Caribbean, Virgin" },
      { label: "Good for", value: "Major homeport sailings and larger cruise days" },
    ],
    guidance: [
      {
        title: "Built for bigger cruise volume",
        body: "Pier 91 handles a broader group of homeport sailings, so planning the transfer window early helps avoid a tighter cruise-day rush.",
      },
      {
        title: "Leave more room on cruise days",
        body: "Pier 91 is farther from the downtown hotel core than Pier 66, which makes route timing more important when traffic is heavy.",
      },
      {
        title: "Good with direct transfer planning",
        body: "If you already know your hotel or flight timing, the direct route pages and reserve links below are the fastest way to lock in the transfer.",
      },
    ],
    usefulLinks: [
      { label: "Sea-Tac to Pier 91", href: "/seatac-to-pier-91" },
      { label: "Pier 66 vs Pier 91 transfer guide", href: "/pier-66-vs-pier-91-transfer-guide" },
      { label: "Downtown Seattle hotel transfers", href: "/seatac-to-downtown-seattle-hotels" },
      { label: "Sea-Tac arrivals guide", href: "/arrivals" },
      { label: "Sea-Tac departures guide", href: "/departures" },
      { label: "Reserve online", href: "/reserve/seatac-pier-91" },
    ],
  },
];

export function getCruiseTerminalGuide(slug: string) {
  return cruiseTerminalGuides.find((guide) => guide.slug === slug) ?? null;
}

export function getCruiseTerminalGuideSlugs() {
  return cruiseTerminalGuides.map((guide) => guide.slug);
}

export function getCruiseTerminalGuideByLine(lineName: string) {
  return cruiseTerminalGuides.find((guide) => guide.cruiseLines.includes(lineName)) ?? null;
}
