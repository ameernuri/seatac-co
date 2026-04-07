export const SEA_AIRPORT = {
  iata: "SEA",
  name: "Seattle-Tacoma International Airport",
  city: "SeaTac",
  latitude: 47.4502,
  longitude: -122.3088,
};

export const SEATTLE_CORE = {
  name: "Seattle, Washington",
  latitude: 47.6062,
  longitude: -122.3321,
};

export const SEATAC_PARKING = {
  label: "Sea-Tac Airport parking",
  latitude: SEA_AIRPORT.latitude,
  longitude: SEA_AIRPORT.longitude,
};

export const SEATTLE_CRUISE_TERMINALS = [
  {
    slug: "bell-street-cruise-terminal-pier-66",
    name: "Bell Street Cruise Terminal at Pier 66",
  },
  {
    slug: "smith-cove-cruise-terminal-pier-91",
    name: "Smith Cove Cruise Terminal at Pier 91",
  },
] as const;

export function guessSeattleHotelDestination(query?: string | null) {
  const value = query?.trim().toLowerCase() ?? "";

  if (value.includes("bellevue")) {
    return "Bellevue";
  }

  if (value.includes("seatac") || value.includes("sea-tac") || value.includes("airport")) {
    return "SeaTac";
  }

  return "Seattle";
}

export function formatShortDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}
