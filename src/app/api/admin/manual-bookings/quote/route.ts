import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { routes, siteSettings, vehicleSiteAssignments, vehicles } from "@/db/schema";
import { env } from "@/env";
import { getRequiredSite } from "@/lib/sites";
import { getBookingConstraintsBySiteId } from "@/lib/booking-constraints-store";
import {
  QuoteGeometryError,
  resolveQuoteGeometry,
} from "@/lib/booking-quote-geometry";
import { quoteReservation } from "@/lib/quote";
import {
  EXTRAS_CATALOG_KEY,
  getDefaultExtrasCatalog,
  getEnabledExtrasCatalog,
} from "@/lib/extras-catalog";
const quoteRequestSchema = z.object({
  bags: z.number().int().min(0).max(12).default(0),
  passengers: z.number().int().min(1).max(12).default(1),
  pickupAddress: z.string().trim().optional(),
  dropoffAddress: z.string().trim().optional(),
  returnPickupAddress: z.string().trim().optional(),
  returnDropoffAddress: z.string().trim().optional(),
  returnTrip: z.boolean().default(false),
  routeId: z.string().uuid().nullable().optional(),
  selectedExtras: z.array(z.string()).default([]),
  siteSlug: z.string().min(1),
  tripType: z.enum(["flat", "distance"]),
  vehicleId: z.string().uuid(),
});

function isAuthorized(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${env.adminInternalToken}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const input = quoteRequestSchema.parse(await request.json());

  try {
    const site = await getRequiredSite(input.siteSlug);
    const bookingConstraints = await getBookingConstraintsBySiteId(site.id);
    const [routeRow] =
      input.tripType === "flat" && input.routeId
        ? await db
            .select()
            .from(routes)
            .where(
              and(
                eq(routes.id, input.routeId),
                eq(routes.siteId, site.id),
                eq(routes.active, true),
              ),
            )
            .limit(1)
        : [];
    const [vehicleRow] = await db
      .select({ vehicle: vehicles })
      .from(vehicles)
      .innerJoin(vehicleSiteAssignments, eq(vehicleSiteAssignments.vehicleId, vehicles.id))
      .where(
        and(
          eq(vehicles.id, input.vehicleId),
          eq(vehicles.active, true),
          eq(vehicleSiteAssignments.siteId, site.id),
        ),
      )
      .limit(1);
    const vehicle = vehicleRow?.vehicle;

    if (!vehicle) {
      return NextResponse.json({ error: "Route or vehicle not found." }, { status: 404 });
    }

    if (input.tripType === "flat" && !routeRow) {
      return NextResponse.json({ error: "Route or vehicle not found." }, { status: 404 });
    }

    const siteVehicles = await db
      .select({ basePrice: vehicles.basePrice })
      .from(vehicles)
      .innerJoin(vehicleSiteAssignments, eq(vehicleSiteAssignments.vehicleId, vehicles.id))
      .where(
        and(eq(vehicleSiteAssignments.siteId, site.id), eq(vehicles.active, true)),
      );
    const baseVehicleFloor = siteVehicles.reduce<number | null>((lowest, current) => {
      const value = Number(current.basePrice);

      if (!Number.isFinite(value) || value <= 0) {
        return lowest;
      }

      if (lowest === null || value < lowest) {
        return value;
      }

      return lowest;
    }, null);
    const extrasCatalogRow = await db.query.siteSettings.findFirst({
      where: and(
        eq(siteSettings.siteId, site.id),
        eq(siteSettings.key, EXTRAS_CATALOG_KEY),
      ),
    });
    const extrasCatalog = getEnabledExtrasCatalog(
      extrasCatalogRow?.value,
      getDefaultExtrasCatalog(site.slug),
    );
    const allowedExtraKeys = new Set(extrasCatalog.map((extra) => extra.key));
    const selectedExtras = input.selectedExtras.filter((key) => allowedExtraKeys.has(key));
    let geometry;

    try {
      geometry = await resolveQuoteGeometry({
        dropoffAddress: input.dropoffAddress,
        homeBaseAddress:
          bookingConstraints.homeBaseEnabled && bookingConstraints.homeBaseAddress.trim()
            ? bookingConstraints.homeBaseAddress
            : "",
        pickupAddress: input.pickupAddress?.trim() ?? routeRow?.origin ?? "",
        returnDropoffAddress: input.returnDropoffAddress,
        returnPickupAddress: input.returnPickupAddress,
        returnTrip: input.returnTrip,
        selectedRoute: input.tripType === "flat" ? routeRow : null,
        tripType: input.tripType,
      });
    } catch (error) {
      if (error instanceof QuoteGeometryError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      throw error;
    }

    const pricing = quoteReservation({
      baseVehicleFloor,
      bags: input.bags,
      bookingConstraints,
      extrasCatalog,
      homeBaseDistanceMiles: geometry.homeBaseDistanceMiles,
      hoursRequested: null,
      passengers: input.passengers,
      returnRouteDistanceMiles: geometry.returnRouteDistanceMiles,
      returnRouteDurationMinutes: geometry.returnRouteDurationMinutes,
      returnHomeBaseDistanceMiles: geometry.returnHomeBaseDistanceMiles,
      returnTrip: input.returnTrip,
      routeDistanceMiles: geometry.routeDistanceMiles,
      routeDurationMinutes: geometry.routeDurationMinutes,
      selectedExtras,
      selectedRoute: input.tripType === "flat" ? routeRow : null,
      selectedVehicle: vehicle,
      serviceMode: routeRow?.mode === "corporate" ? "corporate" : "airport",
      tripType: input.tripType,
    });

    return NextResponse.json({
      pricing,
      route: {
        destination: geometry.dropoffAddress,
        mileage: geometry.routeDistanceMiles,
        name:
          routeRow?.name ??
          `${geometry.pickupAddress.split(",")[0]?.trim() ?? geometry.pickupAddress} to ${geometry.dropoffAddress.split(",")[0]?.trim() ?? geometry.dropoffAddress}`,
        origin: geometry.pickupAddress,
      },
      vehicle: {
        bagsMax: vehicle.bagsMax,
        id: vehicle.id,
        name: vehicle.name,
        passengersMax: vehicle.passengersMax,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Quote could not be calculated." },
      { status: 400 },
    );
  }
}
