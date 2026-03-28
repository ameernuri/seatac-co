import type { Route, Vehicle } from "@/db/schema";
import {
  getPricingComponentFee,
  shouldChargeComponent,
  type BookingConstraints,
} from "@/lib/booking-constraints";
import { extrasCatalog } from "@/lib/site-content";

export type ServiceMode = "airport" | "corporate" | "hourly" | "events";

export type QuoteInput = {
  serviceMode: ServiceMode;
  tripType: "flat" | "distance" | "hourly" | "event";
  selectedRoute?: Route | null;
  selectedVehicle: Vehicle;
  baseVehicleFloor?: number | null;
  passengers: number;
  bags: number;
  hoursRequested?: number | null;
  routeDistanceMiles?: number | null;
  routeDurationMinutes?: number | null;
  returnTrip: boolean;
  selectedExtras: string[];
  bookingConstraints?: BookingConstraints | null;
};

export function quoteReservation(input: QuoteInput) {
  const vehicleBase = Number(input.selectedVehicle.basePrice);
  const hourlyRate = Number(input.selectedVehicle.hourlyRate);
  const routeBase = input.selectedRoute ? Number(input.selectedRoute.basePrice) : 0;
  const routeMiles = input.selectedRoute ? Number(input.selectedRoute.mileage) : 0;
  const actualRouteMiles = input.routeDistanceMiles ?? routeMiles;
  const baseVehicleFloor = Math.max(
    0,
    input.baseVehicleFloor ?? vehicleBase,
  );
  const mileageFee = Number(
    input.selectedVehicle.mileageFee ??
      (input.bookingConstraints
        ? getPricingComponentFee(input.bookingConstraints, input.tripType, "mileage")
        : 0) ??
      0,
  );
  const mileageCharge =
    input.bookingConstraints &&
    shouldChargeComponent(input.bookingConstraints, input.tripType, "mileage")
      ? actualRouteMiles * mileageFee
      : 0;
  const baseVehicleFare = vehicleBase;
  const vehicleUpgradePremium = Math.max(0, vehicleBase - baseVehicleFloor);
  const minimumHourlyHours = Math.max(
    input.bookingConstraints?.hourlyMinimumHours ?? 3,
    1,
  );
  const hourlyServiceFee = Number(input.bookingConstraints?.hourlyServiceFee ?? 0);
  let baseFare = baseVehicleFare;

  if (
    input.tripType === "hourly" ||
    input.tripType === "event" ||
    input.serviceMode === "hourly" ||
    input.serviceMode === "events"
  ) {
    baseFare =
      hourlyRate * Math.max(input.hoursRequested ?? minimumHourlyHours, minimumHourlyHours);
  }

  if (input.tripType === "distance") {
    baseFare = baseVehicleFare;
  }

  if (input.tripType === "flat" && input.selectedRoute) {
    baseFare =
      (Number.isFinite(routeBase) && routeBase > 0 ? routeBase : baseVehicleFare) +
      vehicleUpgradePremium;
  }

  const eventPremium = input.serviceMode === "events" ? 55 : 0;
  const hourlyCharge =
    input.tripType === "hourly" ||
    input.tripType === "event" ||
    input.serviceMode === "hourly" ||
    input.serviceMode === "events"
      ? hourlyServiceFee
      : 0;
  const returnPremium = input.returnTrip ? Math.round(baseFare * 0.72) : 0;
  const passengerFee = Number(
    input.selectedVehicle.passengerFee ??
      (input.bookingConstraints
        ? getPricingComponentFee(
            input.bookingConstraints,
            input.tripType,
            "passengers",
          )
        : 0) ??
      0,
  );
  const bagFee = Number(
    input.selectedVehicle.bagFee ??
      (input.bookingConstraints
        ? getPricingComponentFee(input.bookingConstraints, input.tripType, "bags")
        : 0) ??
      0,
  );
  const passengerTotal =
    input.bookingConstraints &&
    shouldChargeComponent(input.bookingConstraints, input.tripType, "passengers")
      ? input.passengers * passengerFee
      : 0;
  const bagTotal =
    input.bookingConstraints &&
    shouldChargeComponent(input.bookingConstraints, input.tripType, "bags")
      ? input.bags * bagFee
      : 0;
  const extrasTotal = input.selectedExtras.reduce((sum, key) => {
    const match = extrasCatalog.find((item) => item.key === key);
    return sum + (match?.price ?? 0);
  }, 0);

  const subtotal = Math.round(
      baseFare +
      mileageCharge +
      hourlyCharge +
      eventPremium +
      returnPremium +
      passengerTotal +
      bagTotal +
      extrasTotal,
  );
  const total = subtotal;

  return {
    bagFee: Math.round(bagFee * 100) / 100,
    bagTotal: Math.round(bagTotal),
    baseFare: Math.round(baseFare),
    baseVehicleFare: Math.round(baseVehicleFare),
    vehicleUpgradePremium: Math.round(vehicleUpgradePremium),
    mileageCharge: Math.round(mileageCharge),
    mileageFee: Math.round(mileageFee * 100) / 100,
    hourlyCharge: Math.round(hourlyCharge),
    hourlyMinimumHours: minimumHourlyHours,
    passengerFee: Math.round(passengerFee * 100) / 100,
    passengerTotal: Math.round(passengerTotal),
    routeDistanceMiles: Number(actualRouteMiles.toFixed(1)),
    routeDurationMinutes: input.routeDurationMinutes ?? null,
    eventPremium,
    returnPremium,
    extrasTotal,
    subtotal,
    total,
  };
}
