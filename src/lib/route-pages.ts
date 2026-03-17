import type { Metadata } from "next";

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
  reservationDefaults?: {
    serviceMode: "airport" | "corporate" | "hourly" | "events";
    tripType: "flat" | "distance" | "hourly" | "event";
    routeSlug?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    pickupDetail?: string;
  };
};

export const routePages: Record<string, RoutePage> = {
  "seatac-airport-car-service": {
    slug: "seatac-airport-car-service",
    title: "Sea-Tac Airport Car Service | seatac.co",
    description:
      "Private Sea-Tac airport car service for Seattle arrivals, hotel transfers, downtown drop-offs, and Eastside airport rides.",
    heroEyebrow: "Sea-Tac airport service",
    heroTitle: "Sea-Tac airport rides built for arrivals, departures, and clean hotel transfers.",
    heroBody:
      "Book direct airport transportation for Sea-Tac pickups, early departures, downtown Seattle hotels, Bellevue arrivals, and return airport runs without a shared shuttle detour.",
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
    ],
    reservationDefaults: {
      serviceMode: "airport",
      tripType: "distance",
      pickupAddress: "Sea-Tac Airport",
      pickupDetail: "Flight number, airline, or pickup notes",
    },
  },
  "seatac-to-downtown-seattle": {
    slug: "seatac-to-downtown-seattle",
    title: "Sea-Tac to Downtown Seattle Car Service | seatac.co",
    description:
      "Private Sea-Tac to downtown Seattle car service for hotel arrivals, convention trips, waterfront stays, and return airport rides.",
    heroEyebrow: "Downtown airport transfer",
    heroTitle: "Sea-Tac to downtown Seattle private car service for hotels, offices, and waterfront arrivals.",
    heroBody:
      "Reserve a direct ride from Sea-Tac to downtown Seattle for hotel check-ins, meetings, convention traffic, return airport rides, and late-night arrivals.",
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
        body: "This page uses one of the seeded airport routes, so the booking form can open with the downtown Seattle route already selected.",
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
        question: "Can I use this for downtown hotel pickups back to Sea-Tac too?",
        answer: "Yes. The route page is airport-first, but return departures from downtown Seattle can be booked as well.",
      },
      {
        question: "Does this cover South Lake Union and the waterfront?",
        answer: "Yes. Riders heading to downtown neighborhoods, hotel clusters, and the waterfront can use this page to start the booking.",
      },
      {
        question: "Is the route already selected in the form?",
        answer: "Yes. The booking form opens with the Sea-Tac to downtown Seattle preset selected.",
      },
    ],
    reservationDefaults: {
      serviceMode: "airport",
      tripType: "flat",
      routeSlug: "seatac-downtown-core",
      pickupAddress: "Sea-Tac Airport",
      dropoffAddress: "Downtown Seattle",
      pickupDetail: "Flight number, hotel, or terminal notes",
    },
  },
  "seatac-to-bellevue": {
    slug: "seatac-to-bellevue",
    title: "Sea-Tac to Bellevue Car Service | seatac.co",
    description:
      "Private Sea-Tac to Bellevue car service for hotel arrivals, office runs, tech travelers, and airport departures from the Eastside.",
    heroEyebrow: "Bellevue airport transfer",
    heroTitle: "Sea-Tac to Bellevue private car service for hotel arrivals, office runs, and return airport trips.",
    heroBody:
      "Book a direct ride between Sea-Tac and Bellevue for business arrivals, hotel check-ins, Eastside departures, and airport pickups that need simple timing.",
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
        body: "Bellevue is one of the main airport transfer corridors, so this page is structured around a seeded route instead of a generic quote form.",
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
        answer: "Yes. The form opens with the Bellevue airport route preset loaded.",
      },
      {
        question: "Does this work for hotels and office towers?",
        answer: "Yes. The route is meant for both Bellevue hotel traffic and office or residential pickups.",
      },
    ],
    reservationDefaults: {
      serviceMode: "airport",
      tripType: "flat",
      routeSlug: "seatac-bellevue-core",
      pickupAddress: "Sea-Tac Airport",
      dropoffAddress: "Bellevue",
      pickupDetail: "Flight number, hotel, or office pickup notes",
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
        question: "Is the route preset in the form?",
        answer: "Yes. The Sea-Tac to Kirkland route is preselected when this page loads.",
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
      pickupAddress: "Sea-Tac Airport",
      dropoffAddress: "Kirkland",
      pickupDetail: "Flight number, address, or pickup notes",
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
        body: "You can start with the hourly preset and send the broad itinerary notes directly through the same reservation flow.",
      },
    ],
    faqs: [
      {
        question: "When should I use hourly instead of a flat route?",
        answer: "Use hourly when the trip includes multiple stops, extended waiting time, or a full airport-day schedule instead of one direct transfer.",
      },
      {
        question: "Is the hourly mode already selected?",
        answer: "Yes. The booking form opens on the hourly charter preset from this page.",
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
      pickupAddress: "Sea-Tac Airport",
      pickupDetail: "Arrival details and hourly itinerary notes",
    },
  },
};

export function getRoutePage(slug: string) {
  return routePages[slug];
}

export function getRouteMetadata(page: RoutePage): Metadata {
  return {
    title: page.title,
    description: page.description,
  };
}
