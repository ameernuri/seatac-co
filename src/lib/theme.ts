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
    reservationPhoneLabel: "Reservations: (206) 555-0142",
    reservationPhoneHref: "tel:+12065550142",
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
      contactPhone: "(206) 555-0142",
      contactEmail: "reservations@pierlimo.com",
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
  seatacdrive: {
    slug: "seatacdrive",
    brandName: "seatac.co",
    brandMark: "Sea-Tac rides + local guide",
    topbarText:
      "Sea-Tac pickups, airport hotel transfers, and Seattle arrival planning with direct booking.",
    reservationPhoneLabel: "Reservations: (206) 555-0188",
    reservationPhoneHref: "tel:+12065550188",
    navLinks: [
      { href: "/#routes", label: "Routes" },
      { href: "/#guides", label: "Guides" },
      { href: "/#coverage", label: "Coverage" },
    ],
    footer: {
      eyebrow: "seatac.co Dispatch",
      title: "Airport-first reservations with enough local context to plan the whole trip.",
      body:
        "Built for Sea-Tac pickups, hotel transfers, downtown arrivals, Bellevue rides, and airport planning content that helps visitors move around Seattle faster.",
      contactPhone: "(206) 555-0188",
      contactEmail: "hello@seatac.co",
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
        title: "Sea-Tac pickups and departures with direct booking.",
        body:
          "Airport-first transportation for travelers who want a clean reservation path instead of hunting through directories and shuttle listings.",
      },
      {
        eyebrow: "Hotels",
        title: "Hotel transfers for early departures and late arrivals.",
        body:
          "Useful for visitors staying near Sea-Tac, downtown Seattle, or Bellevue who need one direct ride instead of piecing together airport logistics.",
      },
      {
        eyebrow: "Local guide",
        title: "Travel notes that answer the questions airport riders actually have.",
        body:
          "Built to grow into a Sea-Tac planning resource with route pages, hotel guides, pickup notes, and airport timing advice.",
      },
    ],
    fleetNotes: ["Airport-first booking", "Hotel and downtown coverage", "Shared dispatch backend"],
    homepageMetrics: [
      { value: "SEA", label: "Airport-first booking" },
      { value: "4", label: "Core transfer routes" },
      { value: "24/7", label: "Reservation intake" },
    ],
    extrasCatalog: [
      {
        key: "meet-and-greet",
        label: "Meet and greet",
        detail: "Airport greeting with personalized signage.",
        price: 30,
      },
    ],
  },
};

export function getSiteThemeContent(siteSlug: string) {
  return siteThemes[siteSlug] ?? siteThemes.pierlimo;
}
