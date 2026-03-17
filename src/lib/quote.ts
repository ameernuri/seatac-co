import type { Route, Vehicle } from "@/db/schema";
import { extrasCatalog } from "@/lib/site-content";

export type ServiceMode = "airport" | "corporate" | "hourly" | "events";

export type QuoteInput = {
  serviceMode: ServiceMode;
  tripType: "flat" | "distance" | "hourly" | "event";
  selectedRoute?: Route | null;
  selectedVehicle: Vehicle;
  passengers: number;
  bags: number;
  hoursRequested?: number | null;
  routeDistanceMiles?: number | null;
  routeDurationMinutes?: number | null;
  returnTrip: boolean;
  selectedExtras: string[];
};

export function quoteReservation(input: QuoteInput) {
  const vehicleBase = Number(input.selectedVehicle.basePrice);
  const hourlyRate = Number(input.selectedVehicle.hourlyRate);
  const routeBase = input.selectedRoute ? Number(input.selectedRoute.basePrice) : 0;
  const routeMiles = input.selectedRoute ? Number(input.selectedRoute.mileage) : 0;
  const actualRouteMiles = input.routeDistanceMiles ?? routeMiles;
  const mileageCharge = actualRouteMiles * Number(input.selectedVehicle.perMileRate);

  let baseFare = routeBase + vehicleBase + mileageCharge * 0.2;

  if (
    input.tripType === "hourly" ||
    input.tripType === "event" ||
    input.serviceMode === "hourly" ||
    input.serviceMode === "events"
  ) {
    baseFare = hourlyRate * Math.max(input.hoursRequested ?? 3, 2);
  }

  if (input.tripType === "distance") {
    baseFare = vehicleBase + mileageCharge;
  }

  const eventPremium = input.serviceMode === "events" ? 55 : 0;
  const returnPremium = input.returnTrip ? Math.round(baseFare * 0.72) : 0;
  const extrasTotal = input.selectedExtras.reduce((sum, key) => {
    const match = extrasCatalog.find((item) => item.key === key);
    return sum + (match?.price ?? 0);
  }, 0);

  const subtotal = Math.round(baseFare + eventPremium + returnPremium + extrasTotal);
  const total = subtotal;

  return {
    baseFare: Math.round(baseFare),
    routeDistanceMiles: Number(actualRouteMiles.toFixed(1)),
    routeDurationMinutes: input.routeDurationMinutes ?? null,
    eventPremium,
    returnPremium,
    extrasTotal,
    subtotal,
    total,
  };
}
