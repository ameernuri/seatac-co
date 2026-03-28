import { getCruiseTerminalGuideByLine } from "@/lib/cruise-terminals";

export type CruiseLineGuide = {
  slug: string;
  name: string;
  title: string;
  description: string;
  terminalSlug: string;
  terminalName: string;
  terminalGuideHref: string;
  airportRouteSlug: string;
  airportRouteHref: string;
  hotelSlugs: string[];
  notes: string[];
};

const baseCruiseLines = [
  {
    slug: "norwegian-cruise-line-seattle-terminal",
    name: "Norwegian Cruise Line",
    terminalSlug: "bell-street-cruise-terminal-pier-66",
    hotelSlugs: ["edgewater-hotel", "grand-hyatt-seattle"],
    notes: [
      "Pier 66 is the key terminal page to review before booking the airport transfer.",
      "Waterfront and central downtown hotel pages are the best match if you are staying overnight before sailing.",
    ],
  },
  {
    slug: "oceania-cruises-seattle-terminal",
    name: "Oceania Cruises",
    terminalSlug: "bell-street-cruise-terminal-pier-66",
    hotelSlugs: ["edgewater-hotel", "fairmont-olympic-hotel"],
    notes: [
      "Pier 66 is close to Seattle’s downtown waterfront, which makes hotel-to-terminal planning easier.",
      "Sea-Tac to terminal timing matters most on same-day embarkation routes.",
    ],
  },
  {
    slug: "carnival-cruise-line-seattle-terminal",
    name: "Carnival Cruise Line",
    terminalSlug: "smith-cove-cruise-terminal-pier-91",
    hotelSlugs: ["westin-seattle", "edgewater-hotel"],
    notes: [
      "Pier 91 is the main page to use when comparing Sea-Tac airport pricing for Carnival departures.",
      "Downtown hotels can still work well, but Pier 91 usually needs a little more transfer margin than Pier 66.",
    ],
  },
  {
    slug: "celebrity-cruises-seattle-terminal",
    name: "Celebrity Cruises",
    terminalSlug: "smith-cove-cruise-terminal-pier-91",
    hotelSlugs: ["westin-seattle", "fairmont-olympic-hotel"],
    notes: [
      "Pier 91 is the terminal guide to check before booking cruise-day transportation.",
      "Hotel and airport timing both matter more on heavier embarkation days at Smith Cove.",
    ],
  },
  {
    slug: "holland-america-line-seattle-terminal",
    name: "Holland America Line",
    terminalSlug: "smith-cove-cruise-terminal-pier-91",
    hotelSlugs: ["fairmont-olympic-hotel", "westin-seattle"],
    notes: [
      "Pier 91 is the core Sea-Tac transfer page for Holland America sailings from Seattle.",
      "Downtown hotel pages are useful if you want to stay in the city before or after the cruise.",
    ],
  },
  {
    slug: "msc-cruises-seattle-terminal",
    name: "MSC Cruises",
    terminalSlug: "smith-cove-cruise-terminal-pier-91",
    hotelSlugs: ["westin-seattle", "edgewater-hotel"],
    notes: [
      "Pier 91 is the terminal guide that matters for Sea-Tac and hotel transfer planning.",
      "Use the airport and return-route cards below to compare both sides of the cruise trip.",
    ],
  },
  {
    slug: "princess-cruises-seattle-terminal",
    name: "Princess Cruises",
    terminalSlug: "smith-cove-cruise-terminal-pier-91",
    hotelSlugs: ["fairmont-olympic-hotel", "grand-hyatt-seattle"],
    notes: [
      "Princess sailings in Seattle are mapped here to Pier 91, with airport and hotel transfer links below.",
      "Downtown hotel pages are usually the best starting point if you are staying in Seattle before embarkation.",
    ],
  },
  {
    slug: "royal-caribbean-seattle-terminal",
    name: "Royal Caribbean",
    terminalSlug: "smith-cove-cruise-terminal-pier-91",
    hotelSlugs: ["westin-seattle", "grand-hyatt-seattle"],
    notes: [
      "Use the Pier 91 terminal guide to compare route facts, hotel pages, and direct reserve links.",
      "This is the stronger page for Sea-Tac transfer planning than a generic Seattle cruise search.",
    ],
  },
  {
    slug: "virgin-voyages-seattle-terminal",
    name: "Virgin Voyages",
    terminalSlug: "smith-cove-cruise-terminal-pier-91",
    hotelSlugs: ["edgewater-hotel", "westin-seattle"],
    notes: [
      "Pier 91 is the terminal page to use when mapping Sea-Tac, hotel, and cruise-day timing.",
      "Waterfront and downtown hotel pages are the natural next step if you want to stay in Seattle around the cruise.",
    ],
  },
] as const;

export const cruiseLineGuides: CruiseLineGuide[] = baseCruiseLines.map((entry) => {
  const terminal = getCruiseTerminalGuideByLine(entry.name);

  if (!terminal) {
    throw new Error(`Missing terminal mapping for cruise line: ${entry.name}`);
  }

  return {
    slug: entry.slug,
    name: entry.name,
    title: `${entry.name} Seattle terminal guide | seatac.co`,
    description: `${entry.name} terminal guide for Seattle with Sea-Tac transfer pricing, terminal mapping, and hotel links.`,
    terminalSlug: terminal.slug,
    terminalName: terminal.terminalName,
    terminalGuideHref: `/${terminal.slug}`,
    airportRouteSlug: terminal.airportRouteSlug,
    airportRouteHref: terminal.airportRouteHref,
    hotelSlugs: [...entry.hotelSlugs],
    notes: [...entry.notes],
  };
});

export function getCruiseLineGuide(slug: string) {
  return cruiseLineGuides.find((guide) => guide.slug === slug) ?? null;
}

export function getCruiseLineGuideByName(name: string) {
  return cruiseLineGuides.find((guide) => guide.name === name) ?? null;
}

export function getCruiseLineGuideSlugs() {
  return cruiseLineGuides.map((guide) => guide.slug);
}
