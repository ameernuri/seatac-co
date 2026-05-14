import type { Route } from "@/db/schema";
import { fetchGoogleRoutePreview } from "@/lib/route-preview";

export class QuoteGeometryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteGeometryError";
  }
}

function normalizeRouteKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

type ResolveQuoteGeometryInput = {
  dropoffAddress: string | null | undefined;
  homeBaseAddress?: string | null;
  pickupAddress: string;
  returnDropoffAddress?: string | null;
  returnPickupAddress?: string | null;
  returnTrip: boolean;
  selectedRoute?: Route | null;
  tripType: "flat" | "distance" | "hourly" | "event";
};

export type ResolvedQuoteGeometry = {
  dropoffAddress: string;
  homeBaseDistanceMiles: number | null;
  pickupAddress: string;
  returnDropoffAddress: string;
  returnHomeBaseDistanceMiles: number | null;
  returnPickupAddress: string;
  returnRouteDistanceMiles: number | null;
  returnRouteDurationMinutes: number | null;
  routeDistanceMiles: number | null;
  routeDurationMinutes: number | null;
};

export async function resolveQuoteGeometry({
  dropoffAddress,
  homeBaseAddress,
  pickupAddress,
  returnDropoffAddress,
  returnPickupAddress,
  returnTrip,
  selectedRoute,
  tripType,
}: ResolveQuoteGeometryInput): Promise<ResolvedQuoteGeometry> {
  let resolvedPickupAddress =
    tripType === "flat" ? selectedRoute?.origin ?? "" : pickupAddress.trim();
  let resolvedDropoffAddress =
    tripType === "flat"
      ? selectedRoute?.destination ?? ""
      : dropoffAddress?.trim() ?? "";
  let resolvedReturnPickupAddress =
    returnPickupAddress?.trim() ||
    (returnTrip ? resolvedDropoffAddress : "");
  let resolvedReturnDropoffAddress =
    returnDropoffAddress?.trim() ||
    (returnTrip ? resolvedPickupAddress : "");
  let routeDistanceMiles =
    tripType === "flat" && selectedRoute ? Number(selectedRoute.mileage) : null;
  let routeDurationMinutes =
    tripType === "flat" && selectedRoute ? selectedRoute.durationMinutes : null;
  let returnRouteDistanceMiles: number | null = null;
  let returnRouteDurationMinutes: number | null = null;
  let homeBaseDistanceMiles: number | null = null;
  let returnHomeBaseDistanceMiles: number | null = null;

  if (tripType === "distance") {
    if (!resolvedPickupAddress || !resolvedDropoffAddress) {
      throw new QuoteGeometryError("Pickup and dropoff addresses are required.");
    }

    const previewResult = await fetchGoogleRoutePreview(
      resolvedPickupAddress,
      resolvedDropoffAddress,
    );

    if (!previewResult.preview) {
      throw new QuoteGeometryError("Route distance could not be confirmed.");
    }

    routeDistanceMiles = previewResult.preview.distanceMiles;
    routeDurationMinutes = previewResult.preview.durationMinutes;
    resolvedPickupAddress = previewResult.preview.startAddress || resolvedPickupAddress;
    resolvedDropoffAddress = previewResult.preview.endAddress || resolvedDropoffAddress;

    if (returnTrip) {
      resolvedReturnPickupAddress =
        returnPickupAddress?.trim() || resolvedDropoffAddress;
      resolvedReturnDropoffAddress =
        returnDropoffAddress?.trim() || resolvedPickupAddress;

      if (!resolvedReturnPickupAddress || !resolvedReturnDropoffAddress) {
        throw new QuoteGeometryError(
          "Return pickup and dropoff addresses are required.",
        );
      }

      let returnPreviewResult = await fetchGoogleRoutePreview(
        resolvedReturnPickupAddress,
        resolvedReturnDropoffAddress,
      );

      if (
        !returnPreviewResult.preview &&
        (resolvedReturnPickupAddress !== resolvedDropoffAddress ||
          resolvedReturnDropoffAddress !== resolvedPickupAddress)
      ) {
        returnPreviewResult = await fetchGoogleRoutePreview(
          resolvedDropoffAddress,
          resolvedPickupAddress,
        );
      }

      if (!returnPreviewResult.preview) {
        const isReverseOfOutbound =
          normalizeRouteKey(resolvedReturnPickupAddress) ===
            normalizeRouteKey(resolvedDropoffAddress) &&
          normalizeRouteKey(resolvedReturnDropoffAddress) ===
            normalizeRouteKey(resolvedPickupAddress);

        if (!isReverseOfOutbound) {
          throw new QuoteGeometryError(
            "Return route distance could not be confirmed.",
          );
        }

        resolvedReturnPickupAddress = resolvedDropoffAddress;
        resolvedReturnDropoffAddress = resolvedPickupAddress;
        returnRouteDistanceMiles = routeDistanceMiles;
        returnRouteDurationMinutes = routeDurationMinutes;
      } else {
        resolvedReturnPickupAddress =
          returnPreviewResult.preview.startAddress || resolvedReturnPickupAddress;
        resolvedReturnDropoffAddress =
          returnPreviewResult.preview.endAddress || resolvedReturnDropoffAddress;
        returnRouteDistanceMiles = returnPreviewResult.preview.distanceMiles;
        returnRouteDurationMinutes = returnPreviewResult.preview.durationMinutes;
      }
    }
  }

  if (homeBaseAddress?.trim()) {
    const outboundHomeBasePreview = await fetchGoogleRoutePreview(
      homeBaseAddress,
      resolvedPickupAddress,
    );

    if (!outboundHomeBasePreview.preview) {
      throw new QuoteGeometryError(
        "Pickup distance from home base must be confirmed before checkout.",
      );
    }

    homeBaseDistanceMiles = outboundHomeBasePreview.preview.distanceMiles;

    if (returnTrip) {
      const returnHomeBasePreview = await fetchGoogleRoutePreview(
        homeBaseAddress,
        resolvedReturnPickupAddress || resolvedDropoffAddress,
      );

      if (!returnHomeBasePreview.preview) {
        throw new QuoteGeometryError(
          "Return pickup distance from home base must be confirmed before checkout.",
        );
      }

      returnHomeBaseDistanceMiles = returnHomeBasePreview.preview.distanceMiles;
    }
  }

  return {
    dropoffAddress: resolvedDropoffAddress,
    homeBaseDistanceMiles,
    pickupAddress: resolvedPickupAddress,
    returnDropoffAddress: resolvedReturnDropoffAddress,
    returnHomeBaseDistanceMiles,
    returnPickupAddress: resolvedReturnPickupAddress,
    returnRouteDistanceMiles,
    returnRouteDurationMinutes,
    routeDistanceMiles,
    routeDurationMinutes,
  };
}
