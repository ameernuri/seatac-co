import type { Metadata } from "next";

import type { RouteReservationDefaults } from "@/lib/route-booking";
import { buildSeatacMetadata } from "@/lib/seo";

export type RoutePage = {
  slug: string;
  title: string;
  description: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  art: string;
  primaryRoute: string;
  routeNote: string;
  idealFor: string[];
  highlights: { label: string; value: string }[];
  reasons: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
  relatedLinks?: { href: string; label: string; title: string }[];
  reservationDefaults?: RouteReservationDefaults;
};

export const routePages: Record<string, RoutePage> = {
  "seatac-airport-car-service": {
    slug: "seatac-airport-car-service",
    title: "Sea-Tac Airport Car Service | seatac.co",
    description:
      "Private Sea-Tac airport car service for Seattle arrivals, Bellevue transfers, downtown Seattle drop-offs, Sea-Tac hotel rides, and direct airport departures.",
    heroEyebrow: "Sea-Tac airport service",
    heroTitle: "Sea-Tac airport rides built for arrivals, departures, and clean hotel transfers.",
    heroBody:
      "Book direct Sea-Tac airport car service for airport pickups, early departures, downtown Seattle hotels, Bellevue arrivals, and return airport rides without a shared shuttle detour.",
    art: "/scene-airport.svg",
    primaryRoute: "Sea-Tac Airport to downtown Seattle, Bellevue, Kirkland, hotels, and nearby business districts",
    routeNote:
      "Best for visitors flying into Seattle, early morning departures, hotel transfers, and airport rides that need a direct reservation path.",
    idealFor: ["Airport pickups", "Hotel transfers", "Return departures"],
    highlights: [
      { label: "Coverage", value: "Seattle, Bellevue, Kirkland, Sea-Tac hotels" },
      { label: "Booking", value: "Direct online reservation" },
      { label: "Use", value: "Arrivals and departures" },
    ],
    reasons: [
      {
        title: "Airport-first flow",
        body: "The booking flow is tuned for flight arrivals, pickup notes, and direct drop-offs instead of generic town-car quoting.",
      },
      {
        title: "Useful for visitors",
        body: "It works well when you need one ride from Sea-Tac to your hotel, office, or home without extra transfer stops.",
      },
      {
        title: "Seattle-local coverage",
        body: "The main airport service zones are the ones riders ask for most often: downtown Seattle, Bellevue, Kirkland, and Sea-Tac hotel corridors.",
      },
    ],
    faqs: [
      {
        question: "Can I use this for both arrivals and departures?",
        answer: "Yes. The same reservation flow works for Sea-Tac pickups, departure runs, and return rides back to the airport.",
      },
      {
        question: "Do you cover nearby airport hotels?",
        answer: "Yes. Sea-Tac hotel pickups and drop-offs fit the same booking flow as airport terminal rides.",
      },
      {
        question: "Do I need to request a quote manually?",
        answer: "No. You can choose the route and submit the booking details directly from the site.",
      },
      {
        question: "Is this the main Sea-Tac airport car service page for private rides?",
        answer: "Yes. This is the main airport car service page for direct Sea-Tac pickups, departures, hotel transfers, and linked route pages for Bellevue, downtown Seattle, and the cruise terminals.",
      },
    ],
    relatedLinks: [
      { href: "/seatac-to-bellevue", label: "Eastside route", title: "Sea-Tac to Bellevue" },
      {
        href: "/seatac-to-downtown-seattle",
        label: "Downtown route",
        title: "Sea-Tac to downtown Seattle",
      },
      { href: "/seatac-to-pier-66", label: "Cruise route", title: "Sea-Tac to Pier 66" },
    ],
    reservationDefaults: {
      serviceMode: "airport",
      tripType: "distance",
      pickupAddress:
        "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158, USA",
    },
  },
  "seatac-to-downtown-seattle": {
    slug: "seatac-to-downtown-seattle",
    title: "Sea-Tac to Downtown Seattle Car Service | seatac.co",
    description:
      "Private Sea-Tac to downtown Seattle car service for hotel arrivals, convention trips, waterfront stays, office drop-offs, and return airport rides into the downtown core.",
    heroEyebrow: "Downtown airport transfer",
    heroTitle: "Sea-Tac to downtown Seattle private car service for hotels, offices, and waterfront arrivals.",
    heroBody:
      "Reserve a direct Sea-Tac to downtown Seattle car service for hotel check-ins, meetings, convention traffic, return airport rides, and late-night arrivals.",
    art: "/seattle.water.night.webp",
    primaryRoute: "Sea-Tac Airport to downtown Seattle hotels, offices, Pike Place, Belltown, and the waterfront",
    routeNote:
      "Best for visitors staying downtown, convention guests, waterfront hotel arrivals, and airport runs that need clean timing.",
    idealFor: ["Downtown hotels", "Convention travel", "Waterfront arrivals"],
    highlights: [
      { label: "Route", value: "Sea-Tac to downtown Seattle" },
      { label: "Preset", value: "Flat-rate airport route" },
      { label: "Best fit", value: "Hotel and office drop-offs" },
    ],
    reasons: [
      {
        title: "Preset for a core route",
        body: "This page uses one of the seeded airport routes, so the booking form can open with the Sea-Tac to downtown Seattle route already selected.",
      },
      {
        title: "Good downtown coverage",
        body: "Useful for Belltown, Pike Place, South Lake Union, and hotel or office arrivals throughout the downtown core.",
      },
      {
        title: "Cleaner than shuttle routing",
        body: "A direct ride is simpler when you are carrying luggage, landing late, or heading straight to a meeting or hotel check-in.",
      },
    ],
    faqs: [
      {
        question: "Can I use this for downtown Seattle hotel pickups back to Sea-Tac too?",
        answer: "Yes. The route page is airport-first, but return departures from downtown Seattle hotels and offices can be booked as well.",
      },
      {
        question: "Does this cover South Lake Union and the waterfront?",
        answer: "Yes. Riders heading to downtown Seattle neighborhoods, hotel clusters, and the waterfront can use this page to start the booking.",
      },
      {
        question: "Is the Sea-Tac to downtown Seattle route already selected in the form?",
        answer: "Yes. The booking form opens with Sea-Tac to downtown Seattle already selected.",
      },
      {
        question: "Does this page work for downtown Seattle hotels and office towers?",
        answer: "Yes. The route is meant for direct Sea-Tac to downtown Seattle hotel transfers, office drop-offs, convention travel, and return airport departures from the downtown core.",
      },
    ],
    relatedLinks: [
      { href: "/seatac-airport-hotels", label: "Hotel planning", title: "Sea-Tac airport hotels" },
      { href: "/seatac-to-bellevue", label: "Eastside route", title: "Sea-Tac to Bellevue" },
      { href: "/departures", label: "Airport guide", title: "Sea-Tac departures guide" },
    ],
    reservationDefaults: {
      serviceMode: "airport",
      tripType: "flat",
      routeSlug: "seatac-downtown-core",
      pickupAddress:
        "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158, USA",
      dropoffAddress: "Downtown Seattle, Seattle, WA, USA",
    },
  },
  "seatac-to-bellevue": {
    slug: "seatac-to-bellevue",
    title: "Sea-Tac to Bellevue Car Service | seatac.co",
    description:
      "Private Sea-Tac to Bellevue car service for hotel arrivals, office runs, tech travelers, Bellevue departures, and direct Eastside airport transfers.",
    heroEyebrow: "Bellevue airport transfer",
    heroTitle: "Sea-Tac to Bellevue private car service for hotel arrivals, office runs, and return airport trips.",
    heroBody:
      "Book a direct Sea-Tac to Bellevue car service for business arrivals, hotel check-ins, Eastside departures, and airport pickups that need simple timing.",
    art: "/downtown.night.jpeg",
    primaryRoute: "Sea-Tac Airport to Bellevue hotels, office towers, residential towers, and nearby Eastside corridors",
    routeNote:
      "Best for business travelers, Bellevue hotel stays, Eastside airport pickups, and direct transfers between the terminal and the office corridor.",
    idealFor: ["Bellevue hotels", "Business travel", "Eastside pickups"],
    highlights: [
      { label: "Route", value: "Sea-Tac to Bellevue" },
      { label: "Preset", value: "Flat-rate airport route" },
      { label: "Use", value: "Business and hotel transfers" },
    ],
    reasons: [
      {
        title: "Built for Eastside demand",
        body: "Bellevue is one of the main airport transfer routes, so this page opens with the trip details already in place.",
      },
      {
        title: "Good for hotels and offices",
        body: "Useful for Bellevue tower arrivals, hotel check-ins, campus visits, and scheduled airport departures back to Sea-Tac.",
      },
      {
        title: "Direct ride planning",
        body: "You can send airport details and pickup notes without switching to a separate contact flow.",
      },
    ],
    faqs: [
      {
        question: "Can I use this for Bellevue to Sea-Tac departures too?",
        answer: "Yes. The page is centered on Sea-Tac arrivals, but return airport departures from Bellevue can also be booked.",
      },
      {
        question: "Is Bellevue already selected in the form?",
        answer: "Yes. The form opens with the Bellevue airport route already selected.",
      },
      {
        question: "Does this work for hotels and office towers?",
        answer: "Yes. The route is meant for both Bellevue hotel traffic and office or residential pickups.",
      },
      {
        question: "Is this the main page for Sea-Tac to Bellevue car service?",
        answer: "Yes. This page is the direct booking page for Sea-Tac to Bellevue airport transfers, with hotel, office, and return-airport use cases built into the route copy and booking defaults.",
      },
    ],
    relatedLinks: [
      {
        href: "/eastside-airport-transfer-guide",
        label: "Support guide",
        title: "Eastside airport transfer guide",
      },
      {
        href: "/seatac-to/hyatt-regency-bellevue",
        label: "Hotel transfer",
        title: "Sea-Tac to Hyatt Regency Bellevue",
      },
      { href: "/seatac-airport-car-service", label: "Airport hub", title: "Sea-Tac airport car service" },
    ],
    reservationDefaults: {
      serviceMode: "airport",
      tripType: "flat",
      routeSlug: "seatac-bellevue-core",
      pickupAddress:
        "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158, USA",
      dropoffAddress: "Downtown Bellevue, Bellevue, WA, USA",
    },
  },
  "seatac-to-kirkland": {
    slug: "seatac-to-kirkland",
    title: "Sea-Tac to Kirkland Car Service | seatac.co",
    description:
      "Private Sea-Tac to Kirkland car service for Eastside hotel stays, waterfront neighborhoods, and airport rides to and from Kirkland.",
    heroEyebrow: "Kirkland airport transfer",
    heroTitle: "Sea-Tac to Kirkland private car service for Eastside arrivals and return airport rides.",
    heroBody:
      "Reserve direct airport transportation between Sea-Tac and Kirkland for waterfront hotels, residential pickups, tech travel, and return trips back to the airport.",
    art: "/scene-city.svg",
    primaryRoute: "Sea-Tac Airport to Kirkland neighborhoods, waterfront stays, and Eastside pickup points",
    routeNote:
      "Best for travelers staying north of Bellevue who still want a direct airport ride instead of stitching together Eastside transfers.",
    idealFor: ["Kirkland arrivals", "Residential pickups", "Eastside airport rides"],
    highlights: [
      { label: "Route", value: "Sea-Tac to Kirkland" },
      { label: "Preset", value: "Flat-rate airport route" },
      { label: "Best fit", value: "Longer Eastside transfers" },
    ],
    reasons: [
      {
        title: "Useful north of Bellevue",
        body: "Kirkland airport transfers often get lumped into generic Eastside pages. This one gives the route its own booking surface.",
      },
      {
        title: "Good for residential travel",
        body: "Works well for home pickups, waterfront stays, and airport runs that do not fit hotel-shuttle style routing.",
      },
      {
        title: "Direct trip setup",
        body: "The form can open with the Kirkland route already selected, which cuts out manual route clarification.",
      },
    ],
    faqs: [
      {
        question: "Can I book Kirkland back to Sea-Tac from this page?",
        answer: "Yes. Return departures from Kirkland can be scheduled from the same booking flow.",
      },
      {
        question: "Is the route already selected in the form?",
        answer: "Yes. The Sea-Tac to Kirkland route is already selected when this page loads.",
      },
      {
        question: "Does this work for residential pickups?",
        answer: "Yes. Kirkland home pickups and Eastside neighborhood drop-offs fit this route well.",
      },
    ],
    reservationDefaults: {
      serviceMode: "airport",
      tripType: "flat",
      routeSlug: "seatac-kirkland-core",
      pickupAddress:
        "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158, USA",
      dropoffAddress: "Kirkland, WA, USA",
    },
  },
  "seatac-to-pier-66": {
    slug: "seatac-to-pier-66",
    title: "Sea-Tac to Pier 66 Car Service | seatac.co",
    description:
      "Private Sea-Tac to Pier 66 transportation for Seattle cruise departures, Bell Street Cruise Terminal transfers, waterfront hotel stays, and direct cruise-port planning near downtown Seattle.",
    heroEyebrow: "Cruise terminal transfer",
    heroTitle: "Sea-Tac to Pier 66 car service for Bell Street cruise departures and waterfront hotel stays.",
    heroBody:
      "Reserve direct Sea-Tac to Pier 66 transportation from the airport to Bell Street Cruise Terminal for cruise embarkation days, waterfront hotel stays, and luggage-heavy port transfers.",
    art: "/seattle.water.night.webp",
    primaryRoute: "Sea-Tac Airport to Bell Street Cruise Terminal at Pier 66, waterfront hotels, and downtown Seattle cruise stays",
    routeNote:
      "Best for direct airport-to-cruise transfers, same-day embarkation, and hotel stays near Pier 66 before or after a sailing.",
    idealFor: ["Pier 66 departures", "Cruise luggage", "Waterfront hotel stays"],
    highlights: [
      { label: "Route", value: "Sea-Tac to Pier 66" },
      { label: "Terminal", value: "Bell Street Cruise Terminal" },
      { label: "Best fit", value: "Embarkation day transfers" },
    ],
    reasons: [
      {
        title: "Built for cruise timing",
        body: "This route is meant for travelers going straight from Sea-Tac to Bell Street Cruise Terminal at Pier 66 without relying on hotel shuttles or rideshare staging.",
      },
      {
        title: "Useful for waterfront stays",
        body: "It also works well for travelers staying near the waterfront before or after a cruise, where the airport and terminal timing still drive the day.",
      },
      {
        title: "Direct route booking",
        body: "The route opens with the cruise transfer already selected so you can book without starting over on a generic form.",
      },
    ],
    faqs: [
      {
        question: "Is Bell Street Cruise Terminal at Pier 66 already loaded in the booking form?",
        answer: "Yes. The reservation flow opens with the Sea-Tac to Pier 66 route already selected so you do not have to rebuild the cruise transfer manually.",
      },
      {
        question: "Can I use this if I am staying at a Seattle waterfront hotel first?",
        answer: "Yes. This page is still useful if your trip includes a nearby Seattle waterfront hotel before boarding at Pier 66.",
      },
      {
        question: "Is this page only for Seattle cruise departures?",
        answer: "No. It can also be used for post-cruise airport returns if the route timing is the same corridor in reverse on your travel day.",
      },
      {
        question: "Is this the correct route for Bell Street Cruise Terminal at Pier 66?",
        answer: "Yes. This route is specifically for Sea-Tac to Bell Street Cruise Terminal at Pier 66, not Smith Cove Cruise Terminal at Pier 91.",
      },
    ],
    relatedLinks: [
      { href: "/seatac-to-pier-91", label: "Other cruise terminal", title: "Sea-Tac to Pier 91" },
      {
        href: "/pier-66-vs-pier-91-transfer-guide",
        label: "Terminal comparison",
        title: "Pier 66 vs Pier 91 transfer guide",
      },
      { href: "/seatac-to-cruise-pre-stay-hotels", label: "Cruise hotels", title: "Cruise pre-stay hotels" },
      { href: "/bell-street-cruise-terminal-pier-66", label: "Terminal guide", title: "Bell Street Cruise Terminal guide" },
    ],
    reservationDefaults: {
      serviceMode: "airport",
      tripType: "flat",
      routeSlug: "seatac-pier-66",
      pickupAddress:
        "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158, USA",
      dropoffAddress:
        "Bell Street Cruise Terminal at Pier 66, 2225 Alaskan Way, Seattle, WA 98121, USA",
    },
  },
  "seatac-to-pier-91": {
    slug: "seatac-to-pier-91",
    title: "Sea-Tac to Pier 91 Car Service | seatac.co",
    description:
      "Private Sea-Tac to Pier 91 transportation for Smith Cove Cruise Terminal departures, luggage-heavy Seattle cruise transfers, family embarkation days, and direct port arrivals from the airport.",
    heroEyebrow: "Smith Cove transfer",
    heroTitle: "Sea-Tac to Pier 91 car service for cruise departures, family luggage, and direct port arrivals.",
    heroBody:
      "Book direct Sea-Tac to Pier 91 transportation from the airport to Smith Cove Cruise Terminal for cruise embarkation, hotel-to-port planning, and Seattle cruise logistics.",
    art: "/seattle.water.night.webp",
    primaryRoute: "Sea-Tac Airport to Smith Cove Cruise Terminal at Pier 91, cruise hotels, and Seattle pre-sailing stays",
    routeNote:
      "Best for travelers boarding from Smith Cove who need a direct airport transfer with luggage, timing, and terminal context already built into the reservation.",
    idealFor: ["Pier 91 departures", "Family luggage", "Cruise embarkation days"],
    highlights: [
      { label: "Route", value: "Sea-Tac to Pier 91" },
      { label: "Terminal", value: "Smith Cove Cruise Terminal" },
      { label: "Use", value: "Embarkation day transfer" },
    ],
    reasons: [
      {
        title: "Terminal-specific transfer",
        body: "Pier 91 is a different terminal from Bell Street, so this page gives Smith Cove Cruise Terminal its own route and booking surface instead of lumping Seattle cruise traffic together.",
      },
      {
        title: "Better for larger luggage loads",
        body: "Pier 91 trips often involve family luggage, pre-cruise bags, and same-day timing, which makes a direct airport transfer more useful than a generic ride request.",
      },
      {
        title: "Direct booking handoff",
        body: "The route is already selected so you can finish the reservation with the right terminal details in place.",
      },
    ],
    faqs: [
      {
        question: "Is Smith Cove Cruise Terminal at Pier 91 preselected in the booking form?",
        answer: "Yes. The reservation flow opens with the Sea-Tac to Pier 91 route already selected so you can move straight into the cruise transfer booking.",
      },
      {
        question: "Is this the same as Pier 66?",
        answer: "No. Pier 91 and Pier 66 are separate Seattle cruise terminals and should be booked as separate transfer routes.",
      },
      {
        question: "Can I use this for return airport service after the cruise too?",
        answer: "Yes. This page is focused on airport-to-port transfers, but the same corridor matters for return service after the cruise as well.",
      },
      {
        question: "Is this the right page for Smith Cove Cruise Terminal at Pier 91?",
        answer: "Yes. This route is specifically for Sea-Tac to Smith Cove Cruise Terminal at Pier 91 and should be used instead of the Pier 66 route when your sailing departs from Smith Cove.",
      },
    ],
    relatedLinks: [
      { href: "/seatac-to-pier-66", label: "Other cruise terminal", title: "Sea-Tac to Pier 66" },
      {
        href: "/pier-66-vs-pier-91-transfer-guide",
        label: "Terminal comparison",
        title: "Pier 66 vs Pier 91 transfer guide",
      },
      { href: "/seatac-to-cruise-pre-stay-hotels", label: "Cruise hotels", title: "Cruise pre-stay hotels" },
      { href: "/smith-cove-cruise-terminal-pier-91", label: "Terminal guide", title: "Smith Cove Cruise Terminal guide" },
    ],
    reservationDefaults: {
      serviceMode: "airport",
      tripType: "flat",
      routeSlug: "seatac-pier-91",
      pickupAddress:
        "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158, USA",
      dropoffAddress:
        "Smith Cove Cruise Terminal at Pier 91, 2001 W Garfield St, Seattle, WA 98119, USA",
    },
  },
  "seatac-hourly-charter": {
    slug: "seatac-hourly-charter",
    title: "Sea-Tac Hourly Car Service | seatac.co",
    description:
      "Hourly private car service for Seattle airport travel, multi-stop visitor schedules, meetings, and same-day Sea-Tac transportation.",
    heroEyebrow: "Hourly airport support",
    heroTitle: "Hourly car service for airport days that need more than one stop.",
    heroBody:
      "Use hourly service when the trip starts at Sea-Tac but continues through hotels, meetings, lunch stops, or multiple Seattle-area pickups before the day is done.",
    art: "/seattle.water.night.webp",
    primaryRoute: "Sea-Tac pickups with flexible same-day routing across Seattle and the Eastside",
    routeNote:
      "Best for executives, hosts meeting arriving guests, and visitors who need the airport ride plus a scheduled block of local transportation.",
    idealFor: ["Multi-stop airport days", "Meeting schedules", "Hosted arrivals"],
    highlights: [
      { label: "Mode", value: "Hourly booking" },
      { label: "Coverage", value: "Seattle and Eastside" },
      { label: "Use", value: "Flexible airport-day planning" },
    ],
    reasons: [
      {
        title: "Useful beyond one transfer",
        body: "Hourly service is a better fit when a Sea-Tac arrival turns into a full day of meetings, site visits, or hosted guest movement.",
      },
      {
        title: "Keeps the airport context",
        body: "This page still fits the seatac.co brand because the ride starts with the airport, then expands into local transportation.",
      },
      {
        title: "Fast booking handoff",
        body: "You can start with the hourly option and add your itinerary notes in the same reservation flow.",
      },
    ],
    faqs: [
      {
        question: "When should I use hourly instead of a flat route?",
        answer: "Use hourly when the trip includes multiple stops, extended waiting time, or a full airport-day schedule instead of one direct transfer.",
      },
      {
        question: "Is the hourly mode already selected?",
        answer: "Yes. The booking form opens on the hourly charter option from this page.",
      },
      {
        question: "Can I still include airport pickup notes?",
        answer: "Yes. You can add flight details and same-day itinerary notes in the booking flow.",
      },
    ],
    reservationDefaults: {
      serviceMode: "hourly",
      tripType: "hourly",
      routeSlug: "seatac-hourly-charter",
      pickupAddress:
        "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158, USA",
    },
  },
};

export function getRoutePage(slug: string) {
  return routePages[slug];
}

export function getRoutePageSlugs() {
  return Object.keys(routePages);
}

export function getRouteMetadata(page: RoutePage): Metadata {
  return buildSeatacMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
  });
}
