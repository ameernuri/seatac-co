import type { Hotel, Route, Vehicle } from "@/db/schema";
import { formatCurrency } from "@/lib/format";
import { quoteReservation, type ServiceMode } from "@/lib/quote";

export type RouteReservationDefaults = {
  serviceMode: "airport" | "corporate" | "hourly" | "events";
  tripType: "flat" | "distance" | "hourly" | "event";
  routeSlug?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  pickupDetail?: string;
};

export type RouteFacts = {
  label: string;
  value: string;
}[];

function resolveRouteMode(mode: Route["mode"]): ServiceMode {
  if (mode === "corporate" || mode === "hourly") {
    return mode;
  }

  return "airport";
}

export function getRouteReserveHref(routeSlug?: string | null) {
  return routeSlug ? `/reserve/${routeSlug}` : "/reserve";
}

export function getHotelReserveHref(routeSlug: string, hotelSlug: string) {
  return `/reserve/${routeSlug}?hotel=${encodeURIComponent(hotelSlug)}`;
}

export function deriveRouteReservationDefaults(route: Route): RouteReservationDefaults {
  const serviceMode = resolveRouteMode(route.mode);
  const tripType =
    serviceMode === "hourly"
      ? "hourly"
      : serviceMode === "events"
        ? "event"
        : "flat";

  return {
    serviceMode,
    tripType,
    routeSlug: route.slug,
    pickupAddress: route.origin,
    dropoffAddress: route.destination,
  };
}

export function deriveRouteFacts(
  route: Route | null,
  vehicles: Vehicle[],
  reservationDefaults?: RouteReservationDefaults,
): RouteFacts | undefined {
  if (!route || vehicles.length === 0) {
    return undefined;
  }

  const routeMode = reservationDefaults ?? deriveRouteReservationDefaults(route);
  const baseVehicleFloor = Math.min(
    ...vehicles
      .map((vehicle) => Number(vehicle.basePrice))
      .filter((value) => Number.isFinite(value) && value > 0),
  );
  const bestFit = [...vehicles]
    .map((vehicle) => {
      const quote = quoteReservation({
        baseVehicleFloor,
        serviceMode: routeMode.serviceMode,
        tripType: routeMode.tripType,
        selectedRoute: route,
        selectedVehicle: vehicle,
        passengers: Math.max(vehicle.passengersMin, 1),
        bags: Math.max(vehicle.bagsMin, 0),
        hoursRequested: routeMode.tripType === "hourly" ? 3 : null,
        routeDistanceMiles: Number(route.mileage),
        routeDurationMinutes: route.durationMinutes,
        returnTrip: false,
        selectedExtras: [],
      });

      return { quote, vehicle };
    })
    .sort((a, b) => a.quote.total - b.quote.total)[0];

  if (!bestFit) {
    return undefined;
  }

  return [
    {
      label: routeMode.tripType === "hourly" ? "Starting rate" : "Starting fare",
      value: formatCurrency(bestFit.quote.total),
    },
    {
      label: routeMode.tripType === "hourly" ? "Minimum service" : "Route distance",
      value:
        routeMode.tripType === "hourly" ? "3 hours" : `${Number(route.mileage).toFixed(0)} mi`,
    },
    {
      label: routeMode.tripType === "hourly" ? "Best fit" : "Drive time",
      value:
        routeMode.tripType === "hourly"
          ? bestFit.vehicle.name
          : `${route.durationMinutes} min`,
    },
    {
      label: "Per person",
      value: `${formatCurrency(
        Math.ceil(bestFit.quote.total / Math.max(bestFit.vehicle.passengersMax, 1)),
      )} at ${bestFit.vehicle.passengersMax} riders`,
    },
  ];
}

export function deriveRoutePriceSnapshot(
  route: Route | null,
  vehicles: Vehicle[],
  reservationDefaults?: RouteReservationDefaults,
) {
  if (!route || vehicles.length === 0) {
    return null;
  }

  const routeMode = reservationDefaults ?? deriveRouteReservationDefaults(route);
  const baseVehicleFloor = Math.min(
    ...vehicles
      .map((vehicle) => Number(vehicle.basePrice))
      .filter((value) => Number.isFinite(value) && value > 0),
  );
  const bestFit = [...vehicles]
    .map((vehicle) => {
      const quote = quoteReservation({
        baseVehicleFloor,
        serviceMode: routeMode.serviceMode,
        tripType: routeMode.tripType,
        selectedRoute: route,
        selectedVehicle: vehicle,
        passengers: Math.max(vehicle.passengersMin, 1),
        bags: Math.max(vehicle.bagsMin, 0),
        hoursRequested: routeMode.tripType === "hourly" ? 3 : null,
        routeDistanceMiles: Number(route.mileage),
        routeDurationMinutes: route.durationMinutes,
        returnTrip: false,
        selectedExtras: [],
      });

      return { quote, vehicle };
    })
    .sort((a, b) => a.quote.total - b.quote.total)[0];

  if (!bestFit) {
    return null;
  }

  return {
    fare: bestFit.quote.total,
    perPerson: Math.ceil(bestFit.quote.total / Math.max(bestFit.vehicle.passengersMax, 1)),
    riders: bestFit.vehicle.passengersMax,
    distanceMiles: Number(route.mileage),
    durationMinutes: route.durationMinutes,
    vehicleName: bestFit.vehicle.name,
  };
}

export function deriveHotelFacts(
  hotel: Hotel,
  route: Route | null,
  vehicles: Vehicle[],
  reservationDefaults: RouteReservationDefaults,
): RouteFacts | undefined {
  if (!route || vehicles.length === 0) {
    return undefined;
  }

  const baseVehicleFloor = Math.min(
    ...vehicles
      .map((vehicle) => Number(vehicle.basePrice))
      .filter((value) => Number.isFinite(value) && value > 0),
  );
  const bestFit = [...vehicles]
    .map((vehicle) => {
      const quote = quoteReservation({
        baseVehicleFloor,
        serviceMode: reservationDefaults.serviceMode,
        tripType: reservationDefaults.tripType,
        selectedRoute: route,
        selectedVehicle: vehicle,
        passengers: Math.max(vehicle.passengersMin, 1),
        bags: Math.max(vehicle.bagsMin, 0),
        hoursRequested: reservationDefaults.tripType === "hourly" ? 3 : null,
        routeDistanceMiles: Number(hotel.distanceMiles),
        routeDurationMinutes: hotel.durationMinutes,
        returnTrip: false,
        selectedExtras: [],
      });

      return { quote, vehicle };
    })
    .sort((a, b) => a.quote.total - b.quote.total)[0];

  if (!bestFit) {
    return undefined;
  }

  return [
    { label: "Starting fare", value: formatCurrency(bestFit.quote.total) },
    { label: "Hotel area", value: hotel.neighborhood },
    { label: "Route distance", value: `${Number(hotel.distanceMiles).toFixed(1)} mi` },
    { label: "Drive time", value: `${hotel.durationMinutes} min` },
    {
      label: "Per person",
      value: `${formatCurrency(
        Math.ceil(bestFit.quote.total / Math.max(bestFit.vehicle.passengersMax, 1)),
      )} at ${bestFit.vehicle.passengersMax} riders`,
    },
  ];
}

export function deriveHotelPriceSnapshot(
  hotel: Hotel,
  route: Route | null,
  vehicles: Vehicle[],
  reservationDefaults: RouteReservationDefaults,
) {
  if (!route || vehicles.length === 0) {
    return null;
  }

  const baseVehicleFloor = Math.min(
    ...vehicles
      .map((vehicle) => Number(vehicle.basePrice))
      .filter((value) => Number.isFinite(value) && value > 0),
  );
  const bestFit = [...vehicles]
    .map((vehicle) => {
      const quote = quoteReservation({
        baseVehicleFloor,
        serviceMode: reservationDefaults.serviceMode,
        tripType: reservationDefaults.tripType,
        selectedRoute: route,
        selectedVehicle: vehicle,
        passengers: Math.max(vehicle.passengersMin, 1),
        bags: Math.max(vehicle.bagsMin, 0),
        hoursRequested: reservationDefaults.tripType === "hourly" ? 3 : null,
        routeDistanceMiles: Number(hotel.distanceMiles),
        routeDurationMinutes: hotel.durationMinutes,
        returnTrip: false,
        selectedExtras: [],
      });

      return { quote, vehicle };
    })
    .sort((a, b) => a.quote.total - b.quote.total)[0];

  if (!bestFit) {
    return null;
  }

  return {
    fare: bestFit.quote.total,
    perPerson: Math.ceil(bestFit.quote.total / Math.max(bestFit.vehicle.passengersMax, 1)),
    riders: bestFit.vehicle.passengersMax,
    distanceMiles: Number(hotel.distanceMiles),
    durationMinutes: hotel.durationMinutes,
  };
}
