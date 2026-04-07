import { env } from "@/env";
import type { ProviderStatus } from "@/lib/travel/types";

export function getTravelProviderStatuses(): ProviderStatus[] {
  return [
    {
      key: "booking_demand",
      name: "Booking.com Demand",
      verticals: ["hotels"],
      enabled: Boolean(env.bookingDemandToken && env.bookingDemandAffiliateId),
      checkoutMode: "redirect",
      notes: "Current hotel-rate enrichment and deeplink provider.",
    },
    {
      key: "skyscanner",
      name: "Skyscanner",
      verticals: ["flights"],
      enabled: Boolean(env.skyscannerApiKey),
      checkoutMode: "redirect",
      notes: "Flight metasearch and partner checkout to avoid ticket servicing inside seatac.co.",
    },
    {
      key: "expedia_rapid",
      name: "Expedia Rapid",
      verticals: ["hotels"],
      enabled: Boolean(env.expediaRapidApiKey && env.expediaRapidSharedSecret),
      checkoutMode: "provider_managed",
      notes: "Hotel content and shopping layer for broader Seattle inventory and future checkout depth.",
    },
    {
      key: "transferz",
      name: "Transferz",
      verticals: ["rides"],
      enabled: Boolean(env.transferzApiKey || (env.transferzEmail && env.transferzPassword)),
      checkoutMode: "provider_managed",
      notes: "Airport transfer availability with fulfillment handled by transfer supply.",
    },
    {
      key: "parkwhiz",
      name: "ParkWhiz",
      verticals: ["parking"],
      enabled: Boolean(env.parkwhizClientId && env.parkwhizClientSecret),
      checkoutMode: "provider_managed",
      notes: "Parking search and reservation supply for Sea-Tac travelers.",
    },
    {
      key: "vesselfinder",
      name: "VesselFinder",
      verticals: ["cruises"],
      enabled: Boolean(env.vesselfinderApiKey),
      checkoutMode: "data_feed",
      notes: "Cruise ship arrival and departure tracking for Seattle cruise terminals.",
    },
  ];
}

export function getProvidersForVertical(vertical: ProviderStatus["verticals"][number]) {
  return getTravelProviderStatuses().filter((provider) => provider.verticals.includes(vertical));
}
