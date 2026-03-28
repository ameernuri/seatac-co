export type HotelClusterPage = {
  slug: string;
  title: string;
  description: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  sectionKicker: string;
  sectionTitle: string;
  sectionBody: string;
  areas: string[];
  hotelSlugs?: string[];
  fallbackRouteSlug: string;
  art: string;
  reasons: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
};

export const hotelClusterPages: Record<string, HotelClusterPage> = {
  "seatac-airport-hotels": {
    slug: "seatac-airport-hotels",
    title: "Sea-Tac Airport Hotel Transfers | seatac.co",
    description:
      "Compare Sea-Tac airport hotels and hotel transfers with real travel times, starting fares, overnight-stay planning, and direct booking links for nearby stays.",
    heroEyebrow: "Airport hotel transfers",
    heroTitle: "Sea-Tac hotel rides for late arrivals, overnight stays, and early departures.",
    heroBody:
      "Browse nearby Sea-Tac airport hotels, compare ride details, and reserve a direct transfer from Sea-Tac without switching between hotel and airport tabs.",
    sectionKicker: "Airport hotel options",
    sectionTitle: "Hotels closest to the terminal and easy to book.",
    sectionBody:
      "These airport-area hotel pages show direct transfer details so you can compare short rides, overnight stays, and early-morning departure options in one place.",
    areas: ["seatac-hotels"],
    fallbackRouteSlug: "seatac-airport-hotels-core",
    art: "/scene-airport.svg",
    reasons: [
      {
        title: "Useful after a late landing",
        body: "Sea-Tac airport hotel transfers are often short, luggage-heavy rides where travelers want a clear price and an immediate pickup plan.",
      },
      {
        title: "Good for early departures",
        body: "This cluster helps compare the closest hotel options when the next morning starts with another Sea-Tac trip.",
      },
      {
        title: "Direct booking paths",
        body: "Each hotel card links to its own page and reserve flow, so you do not need to re-enter the destination after choosing the property.",
      },
    ],
    faqs: [
      {
        question: "Are these hotels all near Sea-Tac Airport?",
        answer: "Yes. This page is focused on Sea-Tac airport hotels that work well for overnight stays, flight connections, and early departures.",
      },
      {
        question: "Can I compare Sea-Tac airport hotels before booking a ride?",
        answer: "Yes. Each hotel card shows transfer timing, distance, and fare so you can compare Sea-Tac airport hotels before choosing the property and booking the ride.",
      },
      {
        question: "Do the prices change by hotel?",
        answer: "Yes. Each hotel page shows the route facts tied to that specific property, including travel time and starting fare.",
      },
    ],
  },
  "seatac-to-downtown-seattle-hotels": {
    slug: "seatac-to-downtown-seattle-hotels",
    title: "Sea-Tac to Downtown Seattle Hotels | seatac.co",
    description:
      "Compare Sea-Tac to downtown Seattle hotel transfers with direct pricing, travel times, and hotel-specific booking pages.",
    heroEyebrow: "Downtown hotel transfers",
    heroTitle: "Sea-Tac to downtown Seattle hotels, with the route details already worked out.",
    heroBody:
      "Use this page to compare major downtown Seattle hotel transfers before you choose the property, the route, or the ride timing.",
    sectionKicker: "Downtown hotel options",
    sectionTitle: "Hotel transfers for central Seattle stays.",
    sectionBody:
      "These downtown Seattle hotel pages cover convention stays, business trips, shopping weekends, and central Seattle arrivals from Sea-Tac.",
    areas: ["downtown-seattle"],
    fallbackRouteSlug: "seatac-downtown-core",
    art: "/seattle.water.night.webp",
    reasons: [
      {
        title: "Good for hotel comparisons",
        body: "You can compare the main downtown hotel options before deciding which property makes the most sense for your stay.",
      },
      {
        title: "Built for arrival planning",
        body: "Downtown traffic, check-in timing, and luggage all matter more when the airport ride is part of the hotel decision.",
      },
      {
        title: "Direct links into booking",
        body: "Once you choose the hotel, the page sends you into a hotel-specific booking flow instead of a blank reservation form.",
      },
    ],
    faqs: [
      {
        question: "Does this cover major downtown Seattle hotels?",
        answer: "Yes. This page is focused on core downtown hotel stays and direct Sea-Tac transfers into central Seattle.",
      },
      {
        question: "Can I compare hotels before booking a ride?",
        answer: "Yes. The cards on this page show route facts so you can compare distance, drive time, and fare before choosing a hotel.",
      },
      {
        question: "Can I use the same route for the trip back to Sea-Tac?",
        answer: "Yes. Once you know the hotel, the same property page can help with the return airport ride too.",
      },
    ],
  },
  "seatac-to-waterfront-hotels": {
    slug: "seatac-to-waterfront-hotels",
    title: "Sea-Tac to Seattle Waterfront Hotels | seatac.co",
    description:
      "Waterfront hotel transfers from Sea-Tac with direct ride details, hotel pages, and booking links for Pier 66 and downtown stays.",
    heroEyebrow: "Waterfront hotel transfers",
    heroTitle: "Sea-Tac to Seattle waterfront hotels for cruise stays and downtown arrivals.",
    heroBody:
      "Compare waterfront hotel transfers near the cruise terminal and central Seattle, then open the hotel page that matches your stay.",
    sectionKicker: "Waterfront hotel options",
    sectionTitle: "Useful for cruise stays, waterfront plans, and downtown arrivals.",
    sectionBody:
      "Waterfront hotels often connect airport arrivals with cruise departures, central Seattle plans, or a shorter stay near the terminal.",
    areas: ["waterfront"],
    fallbackRouteSlug: "seatac-downtown-core",
    art: "/seattle.water.night.webp",
    reasons: [
      {
        title: "Helpful before a cruise",
        body: "Waterfront hotel stays are common before or after sailings, so the airport transfer and hotel location usually need to be planned together.",
      },
      {
        title: "Closer to Pier 66",
        body: "These properties are useful when you want to stay near the waterfront before moving on to the cruise terminal.",
      },
      {
        title: "One page for the hotel search",
        body: "This cluster keeps the main waterfront hotel options and direct booking links together on one page.",
      },
    ],
    faqs: [
      {
        question: "Is this page mainly for cruise travelers?",
        answer: "It works well for cruise stays, but it also helps anyone staying on the Seattle waterfront after arriving at Sea-Tac.",
      },
      {
        question: "Do these pages connect to cruise routes too?",
        answer: "Yes. The waterfront area overlaps with popular cruise and downtown transfer planning.",
      },
      {
        question: "Can I book as soon as I pick a hotel?",
        answer: "Yes. Each hotel page links straight into a prefilled reserve flow.",
      },
    ],
  },
  "seatac-to-bellevue-hotels": {
    slug: "seatac-to-bellevue-hotels",
    title: "Sea-Tac to Bellevue Hotels | seatac.co",
    description:
      "Compare Sea-Tac to Bellevue hotel transfers with travel time, distance, and hotel-specific booking pages for Eastside stays.",
    heroEyebrow: "Bellevue hotel transfers",
    heroTitle: "Sea-Tac to Bellevue hotels for Eastside business trips and overnight stays.",
    heroBody:
      "Compare the main Bellevue hotel transfer options, then open the property page that matches your stay, meeting schedule, or return airport ride.",
    sectionKicker: "Bellevue hotel options",
    sectionTitle: "Hotel transfers for the Bellevue core and nearby Eastside stays.",
    sectionBody:
      "These Bellevue hotel pages are useful for business travel, conferences, and airport rides that need to end near the Eastside core.",
    areas: ["bellevue"],
    fallbackRouteSlug: "seatac-bellevue-core",
    art: "/downtown.night.jpeg",
    reasons: [
      {
        title: "Built for Eastside hotel demand",
        body: "Bellevue hotels are a major airport-transfer use case for business travelers and visitors staying outside downtown Seattle.",
      },
      {
        title: "Easy to compare properties",
        body: "Each hotel card shows route details so you can compare the Bellevue options before choosing the property.",
      },
      {
        title: "Simple return planning",
        body: "Once you know the hotel, the same page gives you a clean path back into a return airport reservation.",
      },
    ],
    faqs: [
      {
        question: "Is this page only for Bellevue hotel guests?",
        answer: "It is mainly for Bellevue hotels, but it also helps when you want to compare Eastside hotel transfer options before booking.",
      },
      {
        question: "Do these pages work for business travel?",
        answer: "Yes. Bellevue hotel transfers are often tied to office visits, meetings, and conference stays.",
      },
      {
        question: "Can I reserve the trip right from a hotel card?",
        answer: "Yes. Each hotel links to its own page and reserve flow.",
      },
    ],
  },
  "seatac-airport-overnight-hotels": {
    slug: "seatac-airport-overnight-hotels",
    title: "Sea-Tac Overnight Hotels | seatac.co",
    description:
      "Airport overnight hotel pages near Sea-Tac with short transfer times, starting fares, and direct booking links.",
    heroEyebrow: "Overnight airport stays",
    heroTitle: "Airport hotels that make late arrivals and early departures easier.",
    heroBody:
      "Compare Sea-Tac hotel stays built for overnight stopovers, red-eye arrivals, and early morning departures without bouncing between hotel tabs and airport searches.",
    sectionKicker: "Overnight hotel options",
    sectionTitle: "Short airport rides for overnight stays.",
    sectionBody:
      "These hotel pages focus on the airport district properties travelers use most when the main goal is a clean overnight stop and an easy ride back to the terminal.",
    areas: ["seatac-hotels"],
    hotelSlugs: [
      "coast-gateway-hotel",
      "doubletree-seatac",
      "hilton-seattle-airport-conference-center",
      "seattle-airport-marriott",
      "crowne-plaza-seattle-airport",
      "radisson-hotel-seattle-airport",
      "red-lion-hotel-seattle-airport",
      "hampton-inn-suites-seatac-28th-ave",
      "hilton-garden-inn-seattle-airport",
      "aloft-seattle-seatac-airport",
    ],
    fallbackRouteSlug: "seatac-airport-hotels-core",
    art: "/scene-airport.svg",
    reasons: [
      {
        title: "Less guesswork after landing",
        body: "These properties are all practical when you land late, want a short ride, and need a hotel that keeps the airport close the next morning.",
      },
      {
        title: "Useful for red-eyes and layovers",
        body: "Overnight airport stays are usually about speed, luggage handling, and keeping the next departure simple.",
      },
      {
        title: "Easy return planning",
        body: "Each hotel page connects directly into the airport return ride, so the next leg is just as easy to reserve.",
      },
    ],
    faqs: [
      {
        question: "Are these the best hotels for a one-night airport stay?",
        answer: "They are some of the most practical Sea-Tac hotel options when your priority is a short transfer and an easy return to the terminal.",
      },
      {
        question: "Can I reserve the ride to the hotel from this page?",
        answer: "Yes. Each hotel card links to a hotel-specific page and a prefilled reserve flow.",
      },
      {
        question: "Can I use these pages for an early morning departure too?",
        answer: "Yes. These overnight hotel pages work well for both late arrivals and next-morning airport returns.",
      },
    ],
  },
  "seatac-to-downtown-seattle-luxury-hotels": {
    slug: "seatac-to-downtown-seattle-luxury-hotels",
    title: "Sea-Tac to Downtown Seattle Luxury Hotels | seatac.co",
    description:
      "Luxury downtown Seattle hotel transfers from Sea-Tac with fare, timing, and hotel-specific booking links.",
    heroEyebrow: "Luxury downtown stays",
    heroTitle: "Sea-Tac to luxury downtown Seattle hotels, already mapped out.",
    heroBody:
      "Compare higher-end downtown Seattle hotels when you want a central stay, polished service, and a direct airport ride already tied to the property.",
    sectionKicker: "Luxury hotel options",
    sectionTitle: "Premium downtown and waterfront hotel transfers.",
    sectionBody:
      "These hotel pages focus on central Seattle luxury stays used for executive travel, special occasions, and travelers who want a stronger hotel experience on arrival.",
    areas: ["downtown-seattle", "waterfront"],
    hotelSlugs: [
      "fairmont-olympic-hotel",
      "lotte-hotel-seattle",
      "hotel-1000-seattle",
      "four-seasons-hotel-seattle",
      "grand-hyatt-seattle",
      "thompson-seattle",
      "alexis-royal-sonesta-hotel-seattle",
    ],
    fallbackRouteSlug: "seatac-downtown-core",
    art: "/seattle.water.night.webp",
    reasons: [
      {
        title: "Better for executive arrivals",
        body: "Luxury downtown stays are usually tied to business travel, central meetings, or guests who want a direct arrival into the city core.",
      },
      {
        title: "Simple property comparison",
        body: "You can compare the main premium hotel options without losing the airport timing and fare details that matter on arrival day.",
      },
      {
        title: "Direct reserve paths",
        body: "Once you choose the hotel, the reserve link already carries the property into the booking flow.",
      },
    ],
    faqs: [
      {
        question: "Does this page cover downtown luxury hotels only?",
        answer: "It focuses on the premium downtown and waterfront properties travelers most often compare after landing at Sea-Tac.",
      },
      {
        question: "Can I compare the transfer details before picking a hotel?",
        answer: "Yes. Each hotel card shows fare, drive time, and distance so you can compare the airport side of the decision too.",
      },
      {
        question: "Can I book the ride straight from the hotel card?",
        answer: "Yes. Every card links into a hotel-specific transfer page and reserve URL.",
      },
    ],
  },
  "seatac-to-cruise-pre-stay-hotels": {
    slug: "seatac-to-cruise-pre-stay-hotels",
    title: "Sea-Tac to Seattle Cruise Pre-Stay Hotels | seatac.co",
    description:
      "Seattle cruise pre-stay hotel pages with Sea-Tac transfer pricing, timing, and links toward Pier 66 and Pier 91 planning.",
    heroEyebrow: "Cruise pre-stay hotels",
    heroTitle: "Hotels that work well before a Seattle cruise departure.",
    heroBody:
      "Compare downtown and waterfront hotel stays that make the airport arrival easier before moving on to Pier 66 or Pier 91.",
    sectionKicker: "Cruise-friendly hotel options",
    sectionTitle: "Airport hotel transfers that line up well with cruise departures.",
    sectionBody:
      "These pages are useful when you want a hotel before sailing and need the airport ride, hotel stay, and cruise-terminal move to fit together cleanly.",
    areas: ["waterfront", "downtown-seattle"],
    hotelSlugs: [
      "edgewater-hotel",
      "seattle-marriott-waterfront",
      "inn-at-the-market",
      "four-seasons-hotel-seattle",
      "fairmont-olympic-hotel",
      "charter-hotel-seattle",
      "state-hotel-seattle",
      "thompson-seattle",
    ],
    fallbackRouteSlug: "seatac-pier-66",
    art: "/seattle.water.night.webp",
    reasons: [
      {
        title: "Useful before embarkation day",
        body: "These hotels keep you closer to the cruise side of Seattle after your airport transfer is finished.",
      },
      {
        title: "Better for luggage-heavy travel",
        body: "Cruise stays often mean more luggage, tighter timing, and a stronger need to understand both the hotel transfer and the terminal move.",
      },
      {
        title: "Easy next-step planning",
        body: "The hotel and cruise pages connect, so you can move from the airport ride into the terminal plan without starting over.",
      },
    ],
    faqs: [
      {
        question: "Are these hotels near the cruise terminals?",
        answer: "These are the Seattle hotel pages most useful for travelers staying overnight before heading to Pier 66 or Pier 91.",
      },
      {
        question: "Can I still use these pages if I am not taking a cruise?",
        answer: "Yes. They are also good waterfront and downtown stays, but they are especially useful for cruise-related planning.",
      },
      {
        question: "Do these pages connect to the cruise terminal guides?",
        answer: "Yes. They are built to sit alongside the Pier 66 and Pier 91 planning pages.",
      },
    ],
  },
};

export function getHotelClusterPage(slug: string) {
  return hotelClusterPages[slug];
}

export function getHotelClusterPageSlugs() {
  return Object.keys(hotelClusterPages);
}
