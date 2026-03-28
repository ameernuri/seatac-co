export type SiteThemeContent = {
  slug: string;
  brandName: string;
  brandMark: string;
  topbarText: string;
  reservationPhoneLabel: string;
  reservationPhoneHref: string;
  navLinks: { href: string; label: string }[];
  footer: {
    eyebrow: string;
    title: string;
    body: string;
    contactPhone: string;
    contactEmail: string;
    operatingHours?: string;
  };
  coverageAreas: string[];
  serviceCards: {
    eyebrow: string;
    title: string;
    body: string;
  }[];
  fleetNotes: string[];
  homepageMetrics: {
    value: string;
    label: string;
  }[];
  extrasCatalog: {
    key: string;
    label: string;
    detail: string;
    maxQuantity?: number;
    quantityLabel?: string;
    price: number;
  }[];
};

export const siteThemes: Record<string, SiteThemeContent> = {
  pierlimo: {
    slug: "pierlimo",
    brandName: "Pierlimo",
    brandMark: "Seattle Luxury Transport",
    topbarText:
      "Private black car service for Sea-Tac, Seattle cruise terminals, Bellevue, and downtown Seattle.",
    reservationPhoneLabel: "Reservations: (206) 737-0808",
    reservationPhoneHref: "tel:+12067370808",
    navLinks: [
      { href: "/#services", label: "Services" },
      { href: "/#fleet", label: "Vehicle" },
      { href: "/#trust", label: "Why Us" },
      { href: "/#coverage", label: "Coverage" },
    ],
    footer: {
      eyebrow: "Seattle Black Car Booking",
      title: "Airport, cruise, and executive reservations without the dead-end contact form.",
      body:
        "Built for Sea-Tac transfers, Seattle cruise terminal runs, Bellevue and downtown executive rides, and selected hourly bookings with a direct reservation flow.",
      contactPhone: "(206) 737-0808",
      contactEmail: "reservations@pierlimo.com",
      operatingHours: "Dispatch support available daily from 6:00 AM to 11:00 PM.",
    },
    coverageAreas: [
      "Sea-Tac Airport",
      "Downtown Seattle",
      "Bellevue",
      "Redmond",
      "Kirkland",
      "Mercer Island",
      "South Lake Union",
      "Capitol Hill",
      "Waterfront hotels",
    ],
    serviceCards: [
      {
        eyebrow: "Airport",
        title: "Sea-Tac transfers with live dispatch discipline.",
        body:
          "Early-morning departures, delayed arrivals, curbside coordination, and polished pickup timing without the call-center feel.",
      },
      {
        eyebrow: "Cruise",
        title: "Pier 66 and Pier 91 transfers where route intent is clear.",
        body:
          "Focused Seattle cruise terminal transportation for guests who already know they need a private SUV, not a shared shuttle.",
      },
      {
        eyebrow: "Executive",
        title: "Bellevue and downtown Seattle rides that fit a premium SUV offer.",
        body:
          "Hotel pickups, meeting runs, and direct black-car service for travelers who want a premium private ride instead of generic airport transport.",
      },
      {
        eyebrow: "Hourly",
        title: "Hourly black car service where the schedule and margin make sense.",
        body:
          "Held-back availability for private schedules, multi-stop business days, and pre-qualified hourly work instead of broad event demand.",
      },
    ],
    fleetNotes: [
      "On-time airport coordination",
      "Premium black car presentation",
      "Direct online reservation path",
    ],
    homepageMetrics: [
      { value: "24/7", label: "Reservations" },
      { value: "24/7", label: "Reservations" },
      { value: "9", label: "Core coverage zones" },
      { value: "SEA", label: "Airport focus" },
    ],
    extrasCatalog: [
      {
        key: "meet-and-greet",
        label: "Meet and greet",
        detail: "Airport greeting with personalized signage.",
        price: 35,
      },
      {
        key: "child-seat",
        label: "Child seat",
        detail: "Safety seat staged before pickup.",
        maxQuantity: 4,
        quantityLabel: "seat",
        price: 25,
      },
      {
        key: "refreshments",
        label: "Stocked refreshments",
        detail: "Bottled water and executive amenity setup.",
        price: 18,
      },
      {
        key: "priority-dispatch",
        label: "Priority dispatch monitor",
        detail: "Dedicated trip watch for changing schedules.",
        price: 40,
      },
    ],
  },
  seatac_co: {
    slug: "seatac_co",
    brandName: "Seatac Connection",
    brandMark: "Seatac Connection",
    topbarText:
      "Sea-Tac airport planning, hotel guides, route pages, and private ride reservations in one local resource.",
    reservationPhoneLabel: "Reservations: (206) 737-0808",
    reservationPhoneHref: "tel:+12067370808",
    navLinks: [
      { href: "/#routes", label: "Routes" },
      { href: "/#planning", label: "Planning" },
      { href: "/#coverage", label: "Coverage" },
      { href: "/#booking", label: "Book" },
    ],
    footer: {
      eyebrow: "Seatac Connection",
      title: "Plan the airport stay, compare the route options, and reserve when you are ready.",
      body:
        "Browse Sea-Tac hotel areas, downtown and Eastside transfer routes, and practical airport planning notes before opening a private ride reservation.",
      contactPhone: "(206) 737-0808",
      contactEmail: "hello@seatac.co",
      operatingHours: "Live booking support available daily from 6:00 AM to 11:00 PM.",
    },
    coverageAreas: [
      "Sea-Tac Airport",
      "Sea-Tac hotels",
      "Downtown Seattle",
      "Bellevue",
      "Kirkland",
      "Mercer Island",
      "South Lake Union",
    ],
    serviceCards: [
      {
        eyebrow: "Airport",
        title: "Sea-Tac route pages and airport ride access.",
        body:
          "Open the airport transfer page that matches your destination, then reserve from there if you already know the trip.",
      },
      {
        eyebrow: "Hotels",
        title: "Hotel areas, pickup planning, and stay research.",
        body:
          "Useful for travelers deciding where to stay before an early departure, late arrival, or downtown connection.",
      },
      {
        eyebrow: "Local guide",
        title: "Local airport notes that answer the real arrival questions.",
        body:
          "Find neighborhood pages, hotel recommendations, transfer notes, and timing advice for flights, cruises, and Seattle arrivals.",
      },
    ],
    fleetNotes: ["Airport planning", "Hotel and neighborhood coverage", "Ride pages when needed"],
    homepageMetrics: [
      { value: "SEA", label: "Local airport focus" },
      { value: "Guides", label: "Hotels, routes, terminals" },
      { value: "Rides", label: "Direct reservation access" },
    ],
    extrasCatalog: [
      {
        key: "meet-and-greet",
        label: "Meet and greet",
        detail: "Airport greeting with personalized signage.",
        price: 30,
      },
      {
        key: "child-seat",
        label: "Child seat",
        detail: "Safety seat staged before pickup.",
        maxQuantity: 4,
        quantityLabel: "seat",
        price: 25,
      },
    ],
  },
};

export function getSiteThemeContent(siteSlug: string) {
  return siteThemes[siteSlug] ?? siteThemes.pierlimo;
}
