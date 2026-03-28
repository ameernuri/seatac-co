import { airlineGuides } from "@/lib/airlines";

type KnownAirline = {
  code: string;
  name: string;
};

const airlines: KnownAirline[] = [
  ...airlineGuides.map(({ code, name }) => ({ code, name })),
  { code: "WN", name: "Southwest Airlines" },
  { code: "B6", name: "JetBlue" },
  { code: "HA", name: "Hawaiian Airlines" },
  { code: "AC", name: "Air Canada" },
  { code: "BA", name: "British Airways" },
  { code: "LH", name: "Lufthansa" },
  { code: "AF", name: "Air France" },
  { code: "KL", name: "KLM" },
];

function normalizeFlightInput(raw?: string) {
  return raw?.trim().replace(/\s+/g, " ") ?? "";
}

function compactFlightInput(raw: string) {
  return raw.toUpperCase().replace(/[\s-]+/g, "");
}

function findAirlineByName(raw: string) {
  const upper = raw.toUpperCase();
  return airlines.find((airline) => upper.includes(airline.name.toUpperCase()));
}

export function parseFlightQuery(raw?: string) {
  const query = normalizeFlightInput(raw);

  if (!query) {
    return null;
  }

  const compact = compactFlightInput(query);
  const knownCodeMatch = [...airlines]
    .sort((a, b) => b.code.length - a.code.length)
    .find((airline) => compact.startsWith(airline.code));

  if (knownCodeMatch) {
    const flightNumber = compact.slice(knownCodeMatch.code.length);

    if (/^\d{1,4}[A-Z]?$/.test(flightNumber)) {
      return {
        query,
        compact,
        airline: knownCodeMatch,
        airlineCode: knownCodeMatch.code,
        flightNumber,
        displayName: `${knownCodeMatch.name} ${flightNumber}`,
        isSpecificFlight: true,
      };
    }
  }

  const flightMatch = compact.match(/^([A-Z0-9]{2,3})(\d{1,4}[A-Z]?)$/);

  if (flightMatch) {
    const airlineCode = flightMatch[1];
    const flightNumber = flightMatch[2];
    const airline = airlines.find((entry) => entry.code === airlineCode) ?? null;

    return {
      query,
      compact,
      airline,
      airlineCode,
      flightNumber,
      displayName: airline ? `${airline.name} ${flightNumber}` : `${airlineCode} ${flightNumber}`,
      isSpecificFlight: true,
    };
  }

  const namedAirline = findAirlineByName(query);

  if (namedAirline) {
    return {
      query,
      compact,
      airline: namedAirline,
      airlineCode: namedAirline.code,
      flightNumber: null,
      displayName: namedAirline.name,
      isSpecificFlight: false,
    };
  }

  return {
    query,
    compact,
    airline: null,
    airlineCode: null,
    flightNumber: null,
    displayName: query.toUpperCase(),
    isSpecificFlight: false,
  };
}

export function getFlightExamples() {
  return ["DL117", "AS332", "United 2301", "Alaska Airlines"];
}
