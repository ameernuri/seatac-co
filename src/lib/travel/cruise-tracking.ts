import { env } from "@/env";
import { SEATTLE_CRUISE_TERMINALS } from "@/lib/travel/seattle";
import type { CruiseScheduleEntry } from "@/lib/travel/types";

function hasVesselFinderCredentials() {
  return Boolean(env.vesselfinderApiKey);
}

function matchesSeattleTerminal(value: string) {
  const normalized = value.toLowerCase();

  return normalized.includes("seattle") || normalized.includes("pier 66") || normalized.includes("pier 91");
}

function getTerminalFromLabel(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("91")) {
    return SEATTLE_CRUISE_TERMINALS[1];
  }

  return SEATTLE_CRUISE_TERMINALS[0];
}

export async function getSeattleCruiseSchedule() {
  if (!hasVesselFinderCredentials()) {
    return {
      enabled: false,
      entries: [] as CruiseScheduleEntry[],
      error: "VesselFinder credentials are not configured yet.",
    };
  }

  const params = new URLSearchParams({
    api_key: env.vesselfinderApiKey,
    port: "USSEA",
    days: "7",
  });

  try {
    const response = await fetch(
      `${env.vesselfinderBaseUrl}${env.vesselfinderPortCallsPath}?${params.toString()}`,
      {
        next: {
          revalidate: 1_800,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`VesselFinder port-call request failed: ${response.status}`);
    }

    const raw = await response.json();
    const entries = extractCruiseEntries(raw);

    return {
      enabled: true,
      entries,
    };
  } catch (error) {
    return {
      enabled: true,
      entries: [] as CruiseScheduleEntry[],
      error: error instanceof Error ? error.message : "Cruise schedule lookup failed.",
    };
  }
}

function extractCruiseEntries(payload: unknown): CruiseScheduleEntry[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const mappedEntries: Array<CruiseScheduleEntry | null> = payload.map((entry) => {
      const record = (entry && typeof entry === "object" ? entry : {}) as Record<string, unknown>;
      const terminalLabel =
        (typeof record.port_name === "string" && record.port_name) ||
        (typeof record.terminal === "string" && record.terminal) ||
        "Seattle cruise terminal";

      if (!matchesSeattleTerminal(terminalLabel)) {
        return null;
      }

      const terminal = getTerminalFromLabel(terminalLabel);

      return {
        provider: "vesselfinder",
        shipName:
          (typeof record.ship_name === "string" && record.ship_name) ||
          (typeof record.name === "string" && record.name) ||
          "Cruise ship",
        lineName:
          (typeof record.operator === "string" && record.operator) ||
          (typeof record.line_name === "string" && record.line_name) ||
          null,
        terminalName: terminal.name,
        terminalSlug: terminal.slug,
        arrivingAt:
          (typeof record.eta === "string" && record.eta) ||
          (typeof record.arrival_time === "string" && record.arrival_time) ||
          null,
        departingAt:
          (typeof record.etd === "string" && record.etd) ||
          (typeof record.departure_time === "string" && record.departure_time) ||
          null,
        status: typeof record.status === "string" ? record.status : null,
        sourceUrl: typeof record.url === "string" ? record.url : null,
      };
    });

  return mappedEntries.filter((entry): entry is CruiseScheduleEntry => entry !== null);
}
