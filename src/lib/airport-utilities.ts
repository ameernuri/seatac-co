export type AirportUtilityPage = {
  slug: "arrivals" | "departures";
  eyebrow: string;
  title: string;
  description: string;
  heroBody: string;
  seoIntro: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  routeSlugs: string[];
  hotelSlugs: string[];
  airlineCodes: string[];
  guidance: Array<{
    title: string;
    body: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  usefulLinks: Array<{
    label: string;
    href: string;
  }>;
};

export const airportUtilityPages: AirportUtilityPage[] = [
  {
    slug: "arrivals",
    eyebrow: "Sea-Tac arrivals",
    title: "Land at Sea-Tac with your next step already planned.",
    description:
      "Sea-Tac arrivals guide with terminal pickup timing, airport transfer pricing, hotel options, airline pages, and direct reserve links.",
    heroBody:
      "Compare airport rides, nearby hotel transfers, airline guidance, and cruise connections before you leave the terminal.",
    seoIntro:
      "Use this Sea-Tac arrivals guide to plan baggage-claim timing, terminal pickup, nearby hotel transfers, and direct rides from the airport before you land.",
    primaryCta: {
      label: "Search a flight",
      href: "/flight",
    },
    secondaryCta: {
      label: "Browse hotel transfers",
      href: "/seatac-airport-hotels",
    },
    routeSlugs: [
      "seatac-downtown-core",
      "seatac-bellevue-core",
      "seatac-kirkland-core",
      "seatac-pier-66",
      "seatac-pier-91",
    ],
    hotelSlugs: [
      "coast-gateway-hotel",
      "grand-hyatt-seattle",
      "hyatt-regency-bellevue",
      "edgewater-hotel",
    ],
    airlineCodes: ["AS", "DL", "UA", "AA"],
    guidance: [
      {
        title: "Domestic arrivals",
        body: "Most domestic pickups work best 20 to 30 minutes after landing, with a little more room if you are checking bags.",
      },
      {
        title: "International arrivals",
        body: "International arrivals usually need 45 to 60 minutes for immigration, baggage, and curbside timing.",
      },
      {
        title: "Cruise and hotel timing",
        body: "Cruise pier and downtown hotel transfers are easiest when the route, luggage load, and pickup window are confirmed before landing.",
      },
    ],
    faqs: [
      {
        question: "How long after landing should I schedule a Sea-Tac pickup?",
        answer:
          "For most domestic arrivals at Sea-Tac, a pickup window about 20 to 30 minutes after landing is a workable baseline. If you are checking bags or landing internationally, give yourself more room.",
      },
      {
        question: "What is the best ride plan after Sea-Tac arrivals?",
        answer:
          "The best Sea-Tac arrivals plan is to confirm the airport route, hotel transfer, or cruise transfer before landing so the pickup window matches baggage claim and terminal exit timing.",
      },
      {
        question: "Can I compare Sea-Tac arrivals rides, hotels, and airline guidance here?",
        answer:
          "Yes. This page links airport ride pricing, Sea-Tac hotel pages, airline guides, and direct reserve paths so you can choose the next step after landing.",
      },
      {
        question: "How long does baggage claim usually add after Sea-Tac arrivals?",
        answer:
          "Baggage claim can add another 10 to 20 minutes after you reach the terminal on domestic arrivals, and often longer on international arrivals or busy evening banks. If you are checking bags, plan your pickup around terminal exit time rather than wheels-down time.",
      },
      {
        question: "Where should I meet my ride after arriving at Sea-Tac?",
        answer:
          "The best pickup point depends on the terminal flow, baggage status, and how quickly you can reach the curb. Travelers usually want to wait until they are walking out of baggage claim or already at the pickup area before final driver timing is locked in.",
      },
      {
        question: "What if my flight is delayed or lands early at Sea-Tac?",
        answer:
          "Flight timing changes are common, which is why the best Sea-Tac arrivals plan uses the flight number, monitors terminal timing, and keeps enough communication room between landing, baggage, and curbside pickup.",
      },
      {
        question: "Should I book my hotel or cruise transfer before landing at Sea-Tac?",
        answer:
          "Yes. If the airport is only the first step before a downtown hotel, airport hotel, Pier 66, or Pier 91 transfer, booking the route before you land makes the pickup window much easier to manage once you are off the plane.",
      },
    ],
    usefulLinks: [
      { label: "Flight lookup", href: "/flight" },
      { label: "Sea-Tac airport hotels", href: "/seatac-airport-hotels" },
      { label: "Downtown Seattle hotel transfers", href: "/seatac-to-downtown-seattle-hotels" },
      { label: "Sea-Tac to Pier 66", href: "/seatac-to-pier-66" },
      { label: "Sea-Tac to Pier 91", href: "/seatac-to-pier-91" },
      { label: "Sea-Tac parking guide", href: "/seatac-parking-guide" },
    ],
  },
  {
    slug: "departures",
    eyebrow: "Sea-Tac departures",
    title: "Get to Sea-Tac on time without guessing the route.",
    description:
      "Sea-Tac departures guide with airport ride pricing from Seattle and Bellevue, hotel pickup timing, check-in planning, and direct reserve links.",
    heroBody:
      "Check the main airport corridors, compare pickup timing from hotels and neighborhoods, and reserve your ride before the day gets tight.",
    seoIntro:
      "Use this Sea-Tac departures guide to plan when to leave for the airport, compare hotel and neighborhood pickup timing, and book the route before traffic gets tight.",
    primaryCta: {
      label: "Reserve airport ride",
      href: "/reserve",
    },
    secondaryCta: {
      label: "Browse airline guides",
      href: "/airlines/alaska-at-seatac",
    },
    routeSlugs: [
      "downtown-seatac-core",
      "bellevue-seatac-core",
      "kirkland-seatac-core",
      "pier-66-seatac",
      "pier-91-seatac",
    ],
    hotelSlugs: [
      "grand-hyatt-seattle",
      "westin-seattle",
      "hyatt-regency-bellevue",
      "woodmark-hotel-kirkland",
    ],
    airlineCodes: ["AS", "DL", "UA", "AA"],
    guidance: [
      {
        title: "Domestic departures",
        body: "For most domestic departures, arriving at Sea-Tac around two hours before takeoff gives the best margin for traffic, check-in, and security.",
      },
      {
        title: "International departures",
        body: "International departures usually need a larger buffer, especially for bag drop, document checks, and heavier evening traffic.",
      },
      {
        title: "Hotel and pier pickups",
        body: "Downtown hotels, Bellevue mornings, and cruise-terminal pickups all benefit from a confirmed departure window before the day starts.",
      },
    ],
    faqs: [
      {
        question: "How early should I leave for Sea-Tac departures?",
        answer:
          "For most Sea-Tac departures, domestic travelers usually want to arrive around two hours before takeoff, while international travelers usually need a larger buffer.",
      },
      {
        question: "What is the best way to plan a Sea-Tac departure ride from a hotel?",
        answer:
          "The best departure plan is to confirm the hotel pickup window the night before, then match it to check-in timing, baggage load, and the typical traffic pattern for your corridor.",
      },
      {
        question: "Can I compare Sea-Tac departure rides from Bellevue, downtown Seattle, and the waterfront?",
        answer:
          "Yes. This departures page links the main airport routes, hotel transfer pages, airline guides, and direct reserve options for the biggest Sea-Tac departure corridors.",
      },
      {
        question: "How much earlier should I leave for Sea-Tac if I am checking bags?",
        answer:
          "Checked bags usually mean a tighter airport clock because you need bag drop plus security rather than security alone. On busy mornings or evenings, leaving earlier for Sea-Tac departures gives more margin than trying to recover time once you are already on the road.",
      },
      {
        question: "What pickup time makes sense for downtown Seattle departures to Sea-Tac?",
        answer:
          "Downtown Seattle departure timing depends heavily on the hour, hotel loading time, and whether you need bridge or freeway access during rush periods. The safer plan is to choose the airport arrival target first, then back into the pickup time from your corridor.",
      },
      {
        question: "What pickup time makes sense for Bellevue departures to Sea-Tac?",
        answer:
          "Bellevue departures usually need extra room on weekday mornings and late afternoons because bridge traffic can stretch quickly. If you are leaving from Bellevue for Sea-Tac, confirm the pickup window before the day starts instead of waiting until traffic is already building.",
      },
      {
        question: "Should I schedule a Sea-Tac departure ride the night before?",
        answer:
          "Yes. Departure rides work best when the route, pickup address, airline timing, and baggage assumptions are decided the night before, especially for hotel departures, business travel, and early airport calls.",
      },
    ],
    usefulLinks: [
      { label: "Downtown Seattle hotel transfers", href: "/seatac-to-downtown-seattle-hotels" },
      { label: "Bellevue hotel transfers", href: "/seatac-to-bellevue-hotels" },
      { label: "Waterfront hotel transfers", href: "/seatac-to-waterfront-hotels" },
      { label: "Flight lookup", href: "/flight" },
      { label: "Reserve by route", href: "/reserve" },
      { label: "Sea-Tac parking guide", href: "/seatac-parking-guide" },
    ],
  },
];

export function getAirportUtilityPage(slug: string) {
  return airportUtilityPages.find((page) => page.slug === slug) ?? null;
}

export function getAirportUtilityPageSlugs() {
  return airportUtilityPages.map((page) => page.slug);
}
