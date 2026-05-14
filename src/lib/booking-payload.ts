import { and, asc, eq, gt, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import {
  bookings,
  siteSettings,
  vehicleBlocks,
  vehicleSiteAssignments,
  vehicleUnits,
  vehicles,
} from "@/db/schema";
import {
  defaultDispatchRules,
  getDispatchRulesBySiteId,
  getDispatchRulesBySiteIds,
  normalizeDispatchOverride,
} from "@/lib/dispatch-rules";
import { env } from "@/env";
import { getActiveBookingHoldCutoff } from "@/lib/booking-holds";
import {
  EXTRAS_CATALOG_KEY,
  getDefaultExtrasCatalog,
  getEnabledExtrasCatalog,
} from "@/lib/extras-catalog";
import { getBookingConstraintsBySiteId } from "@/lib/booking-constraints-store";
import { validateBookingWindow } from "@/lib/booking-constraints";
import {
  QuoteGeometryError,
  resolveQuoteGeometry,
} from "@/lib/booking-quote-geometry";
import { quoteReservation, type ServiceMode } from "@/lib/quote";
import { getRequiredSite } from "@/lib/sites";
import { evaluateAvailabilityWindow } from "@/lib/vehicle-schedule";
import { getVehicleAvailabilityScheduleForSiteVehicle } from "@/lib/vehicle-schedule-store";
import {
  hasBlockConflict,
  hasSchedulingConflict,
  resolveOccupiedWindow,
  resolveRequestedServiceEndAt,
  resolveServiceLegWindows,
  type AvailabilityBookingWindow,
} from "@/lib/vehicle-availability";

export const bookingPayloadSchema = z.object({
  serviceMode: z.enum(["airport", "corporate", "hourly", "events"]),
  tripType: z.enum(["flat", "distance", "hourly", "event"]),
  routeId: z.string().uuid().nullable(),
  pickupLabel: z.string().min(2),
  pickupAddress: z.string().min(4),
  dropoffLabel: z.string().nullable(),
  dropoffAddress: z.string().nullable(),
  returnPickupLabel: z.string().nullable().optional(),
  returnPickupAddress: z.string().nullable().optional(),
  returnDropoffLabel: z.string().nullable().optional(),
  returnDropoffAddress: z.string().nullable().optional(),
  routeName: z.string().min(2).nullable(),
  routeDistanceMiles: z.number().min(0).nullable(),
  routeDurationMinutes: z.number().int().min(0).nullable(),
  returnRouteDistanceMiles: z.number().min(0).nullable().optional(),
  returnRouteDurationMinutes: z.number().int().min(0).nullable().optional(),
  pickupAt: z.string(),
  returnAt: z.string().nullable(),
  returnTrip: z.boolean(),
  passengers: z.number().int().min(1).max(12),
  bags: z.number().int().min(0).max(12),
  hoursRequested: z.number().int().min(2).max(12).nullable(),
  vehicleId: z.string().uuid(),
  selectedExtras: z.array(z.string()),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  customerUserId: z.string().optional().nullable(),
  customerSmsOptIn: z.boolean().default(false),
  specialInstructions: z.string().nullable(),
});

export type BookingPayload = z.infer<typeof bookingPayloadSchema>;

export class VehicleAvailabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VehicleAvailabilityError";
  }
}

export class BookingGuardrailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingGuardrailError";
  }
}

function buildReference() {
  return `SC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const availabilityBookingColumns = {
  dispatchOverride: bookings.dispatchOverride,
  dropoffAddress: bookings.dropoffAddress,
  pricing: bookings.pricing,
  pickupAddress: bookings.pickupAddress,
  pickupAt: bookings.pickupAt,
  returnAt: bookings.returnAt,
  serviceEndAt: bookings.serviceEndAt,
  siteId: bookings.siteId,
  vehicleUnitId: bookings.vehicleUnitId,
} satisfies Record<string, unknown>;

const bookingDraftColumns = {
  customerEmail: bookings.customerEmail,
  id: bookings.id,
  paymentCheckoutSessionId: bookings.paymentCheckoutSessionId,
  paymentStatus: bookings.paymentStatus,
  dropoffLabel: bookings.dropoffLabel,
  pickupAt: bookings.pickupAt,
  pickupLabel: bookings.pickupLabel,
  reference: bookings.reference,
  routeName: bookings.routeName,
  siteId: bookings.siteId,
  totalCents: bookings.totalCents,
  vehicleId: bookings.vehicleId,
  vehicleUnitId: bookings.vehicleUnitId,
} satisfies Record<string, unknown>;

async function findAvailableVehicleUnit(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  vehicleId: string,
  candidateWindows: AvailabilityBookingWindow[],
  rules: Awaited<ReturnType<typeof getDispatchRulesBySiteId>>,
) {
  const units = await tx
    .select()
    .from(vehicleUnits)
    .where(and(eq(vehicleUnits.vehicleId, vehicleId), eq(vehicleUnits.active, true)))
    .orderBy(asc(vehicleUnits.label));

  if (units.length === 0) {
    throw new VehicleAvailabilityError("No active vehicles are configured for this vehicle type.");
  }

  const overlappingBookings = await tx
    .select(availabilityBookingColumns)
    .from(bookings)
    .where(
      and(
        inArray(
          bookings.vehicleUnitId,
          units.map((unit) => unit.id),
        ),
        or(
          eq(bookings.paymentStatus, "paid"),
          eq(bookings.status, "confirmed"),
          and(
            eq(bookings.status, "pending"),
            eq(bookings.paymentStatus, "pending"),
            gt(bookings.updatedAt, getActiveBookingHoldCutoff()),
          ),
        ),
      ),
    );
  const overlappingBlocks = await tx
    .select()
    .from(vehicleBlocks)
    .where(
      inArray(
        vehicleBlocks.vehicleUnitId,
        units.map((unit) => unit.id),
      ),
    );
  const bookingRulesBySiteId = await getDispatchRulesBySiteIds(
    overlappingBookings.map((booking) => booking.siteId),
  );

  const bookingsByUnit = overlappingBookings.reduce<Record<string, typeof overlappingBookings>>(
    (acc, booking) => {
      if (!booking.vehicleUnitId) {
        return acc;
      }

      acc[booking.vehicleUnitId] ??= [];
      acc[booking.vehicleUnitId].push(booking);
      return acc;
    },
    {},
  );
  const blocksByUnit = overlappingBlocks.reduce<Record<string, typeof overlappingBlocks>>(
    (acc, block) => {
      acc[block.vehicleUnitId] ??= [];
      acc[block.vehicleUnitId].push(block);
      return acc;
    },
    {},
  );

  for (const unit of units) {
    const existingBookings = bookingsByUnit[unit.id] ?? [];
    const existingBlocks = blocksByUnit[unit.id] ?? [];
    let conflict = false;

    for (const booking of existingBookings) {
      const bookingRules =
        bookingRulesBySiteId.get(booking.siteId) ?? defaultDispatchRules;
      const bookingWindows = resolveServiceLegWindows(
        {
          dispatchOverride: normalizeDispatchOverride(booking.dispatchOverride),
          dropoffAddress: booking.dropoffAddress,
          pickupAddress: booking.pickupAddress,
          pickupAt: new Date(booking.pickupAt),
          returnAt: booking.returnAt ? new Date(booking.returnAt) : null,
          returnDropoffAddress: booking.pickupAddress,
          returnPickupAddress: booking.dropoffAddress,
          returnRouteDurationMinutes:
            typeof booking.pricing === "object" &&
            booking.pricing !== null &&
            "returnRouteDurationMinutes" in booking.pricing &&
            typeof booking.pricing.returnRouteDurationMinutes === "number"
              ? booking.pricing.returnRouteDurationMinutes
              : null,
          routeDurationMinutes:
            typeof booking.pricing === "object" &&
            booking.pricing !== null &&
            "routeDurationMinutes" in booking.pricing &&
            typeof booking.pricing.routeDurationMinutes === "number"
              ? booking.pricing.routeDurationMinutes
              : null,
        },
        bookingRules,
      );

      for (const bookingWindow of bookingWindows) {
        for (const candidateWindow of candidateWindows) {
          if (
            await hasSchedulingConflict(
              bookingWindow,
              candidateWindow,
              bookingRules,
              rules,
            )
          ) {
            conflict = true;
            break;
          }
        }

        if (conflict) {
          break;
        }
      }

      if (conflict) {
        break;
      }
    }

    if (!conflict) {
      for (const block of existingBlocks) {
        for (const candidateWindow of candidateWindows) {
          if (
            hasBlockConflict(
              {
                endAt: new Date(block.endAt),
                startAt: new Date(block.startAt),
              },
              candidateWindow,
              rules,
            )
          ) {
            conflict = true;
            break;
          }
        }

        if (conflict) {
          break;
        }
      }
    }

    if (!conflict) {
      return unit;
    }
  }

  return null;
}

export async function createBookingDraft(
  payload: BookingPayload,
  siteSlug: string = env.siteSlug,
  customerUserId?: string | null,
  adminScheduleOverride = false,
) {
  const site = await getRequiredSite(siteSlug);
  const pickupAt = new Date(payload.pickupAt);
  const returnAt = payload.returnAt ? new Date(payload.returnAt) : null;
  const bookingConstraints = await getBookingConstraintsBySiteId(site.id);
  const validationMessage = validateBookingWindow({
    constraints: bookingConstraints,
    pickupAt,
    returnAt,
  });

  if (validationMessage && !adminScheduleOverride) {
    throw new BookingGuardrailError(validationMessage);
  }

  const selectedRoute = payload.routeId
    ? await db.query.routes.findFirst({
        where: (route) =>
          and(eq(route.id, payload.routeId!), eq(route.siteId, site.id)),
      })
    : null;

  if (payload.tripType === "flat" && !selectedRoute) {
    throw new BookingGuardrailError("Choose a valid flat-rate route.");
  }

  let geometry;

  try {
    geometry = await resolveQuoteGeometry({
      dropoffAddress: payload.dropoffAddress,
      homeBaseAddress:
        bookingConstraints.homeBaseEnabled && bookingConstraints.homeBaseAddress.trim()
          ? bookingConstraints.homeBaseAddress
          : "",
      pickupAddress: payload.pickupAddress,
      returnDropoffAddress: payload.returnDropoffAddress,
      returnPickupAddress: payload.returnPickupAddress,
      returnTrip: payload.returnTrip,
      selectedRoute,
      tripType: payload.tripType,
    });
  } catch (error) {
    if (error instanceof QuoteGeometryError) {
      throw new BookingGuardrailError(error.message);
    }

    throw error;
  }

  const [vehicleRow] = await db
    .select({ vehicle: vehicles })
    .from(vehicles)
    .innerJoin(
      vehicleSiteAssignments,
      eq(vehicleSiteAssignments.vehicleId, vehicles.id),
    )
    .where(
      and(
        eq(vehicles.id, payload.vehicleId),
        eq(vehicles.active, true),
        eq(vehicleSiteAssignments.siteId, site.id),
      ),
    )
    .limit(1);

  const vehicle = vehicleRow?.vehicle;

  if (!vehicle) {
    throw new Error("Vehicle not found.");
  }

  const siteVehicles = await db
    .select({ basePrice: vehicles.basePrice })
    .from(vehicles)
    .innerJoin(
      vehicleSiteAssignments,
      eq(vehicleSiteAssignments.vehicleId, vehicles.id),
    )
    .where(
      and(
        eq(vehicleSiteAssignments.siteId, site.id),
        eq(vehicles.active, true),
      ),
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
  const selectedExtras = payload.selectedExtras.filter((key) =>
    allowedExtraKeys.has(key),
  );

  const pricing = quoteReservation({
    baseVehicleFloor,
    serviceMode: payload.serviceMode as ServiceMode,
    tripType: payload.tripType,
    selectedRoute,
    selectedVehicle: vehicle,
    passengers: payload.passengers,
    bags: payload.bags,
    hoursRequested: payload.hoursRequested,
    routeDistanceMiles: geometry.routeDistanceMiles,
    routeDurationMinutes: geometry.routeDurationMinutes,
    returnRouteDistanceMiles: geometry.returnRouteDistanceMiles,
    returnRouteDurationMinutes: geometry.returnRouteDurationMinutes,
    homeBaseDistanceMiles: geometry.homeBaseDistanceMiles,
    returnHomeBaseDistanceMiles: geometry.returnHomeBaseDistanceMiles,
    returnTrip: payload.returnTrip,
    extrasCatalog,
    selectedExtras,
    bookingConstraints,
  });

  const routeName =
    payload.routeName ??
    selectedRoute?.name ??
    (payload.dropoffLabel
      ? `${payload.pickupLabel} to ${payload.dropoffLabel}`
      : "Custom route");

  const dispatchRules = await getDispatchRulesBySiteId(site.id);
  const serviceEndAt = resolveRequestedServiceEndAt(
    {
      pickupAt: payload.pickupAt,
      returnAt: payload.returnAt,
      returnTrip: payload.returnTrip,
      tripType: payload.tripType,
      routeDurationMinutes: pricing.routeDurationMinutes ?? geometry.routeDurationMinutes,
      defaultRouteDurationMinutes: selectedRoute?.durationMinutes,
      hoursRequested: payload.hoursRequested,
    },
    dispatchRules,
  );
  const candidateWindows = resolveServiceLegWindows(
    {
      dropoffAddress: payload.dropoffAddress,
      pickupAddress: payload.pickupAddress,
      pickupAt,
      returnAt,
      returnDropoffAddress: payload.returnDropoffAddress,
      returnPickupAddress: payload.returnPickupAddress,
      returnRouteDurationMinutes:
        pricing.returnRouteDurationMinutes ?? geometry.returnRouteDurationMinutes,
      routeDurationMinutes: pricing.routeDurationMinutes ?? geometry.routeDurationMinutes,
    },
    dispatchRules,
  );
  const availabilitySchedule = await getVehicleAvailabilityScheduleForSiteVehicle({
    siteId: site.id,
    vehicleId: vehicle.id,
  });
  for (const candidateWindow of candidateWindows) {
    const occupiedWindow = resolveOccupiedWindow(candidateWindow, dispatchRules);
    const scheduleDecision = evaluateAvailabilityWindow({
      exceptions: availabilitySchedule.exceptions,
      rules: availabilitySchedule.rules,
      timeZone: bookingConstraints.timeZone,
      windowEnd: occupiedWindow.endAt,
      windowStart: occupiedWindow.startAt,
    });

    if (!scheduleDecision.allowed && !adminScheduleOverride) {
      throw new VehicleAvailabilityError(
        scheduleDecision.reason ??
          `${vehicle.name} is not scheduled to operate for that time window.`,
      );
    }
  }

  const created = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`vehicle:${vehicle.id}`}))`,
    );

    const vehicleUnit = await findAvailableVehicleUnit(
      tx,
      vehicle.id,
      candidateWindows,
      dispatchRules,
    );

    if (!vehicleUnit) {
      throw new VehicleAvailabilityError(
        `${vehicle.name} is unavailable for that time window. Choose another vehicle or schedule.`,
      );
    }

    const [booking] = await tx
      .insert(bookings)
      .values({
        siteId: site.id,
        reference: buildReference(),
        status: "pending",
        serviceMode: payload.serviceMode,
        tripType: payload.tripType,
        routeName,
        pickupLabel: payload.pickupLabel,
        pickupAddress: payload.pickupAddress,
        dropoffLabel: payload.dropoffLabel,
        dropoffAddress: payload.dropoffAddress,
        pickupAt,
        returnAt,
        passengers: payload.passengers,
        bags: payload.bags,
        hoursRequested: payload.hoursRequested,
        customerUserId: customerUserId ?? null,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        customerSmsOptIn: payload.customerSmsOptIn,
        customerSmsOptInAt: payload.customerSmsOptIn ? new Date() : null,
        specialInstructions: payload.specialInstructions,
        vehicleId: vehicle.id,
        vehicleUnitId: vehicleUnit.id,
        vehicleName: vehicle.name,
        vehicleUnitLabel: vehicleUnit.label,
        dispatchOverride: adminScheduleOverride ? { scheduleOverride: true } : {},
        extras: selectedExtras,
        pricing,
        subtotalCents: Math.round(pricing.subtotal * 100),
        totalCents: Math.round(pricing.total * 100),
        serviceEndAt,
        paymentStatus: "pending",
        paymentMethod: "stripe",
      })
      .returning(bookingDraftColumns);

    return booking;
  });

  return {
    booking: created,
    pricing,
    selectedRoute,
    site,
    vehicle,
  };
}
