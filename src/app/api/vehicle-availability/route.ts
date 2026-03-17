import { and, asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import {
  bookings,
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
import { getBookingConstraintsBySiteId } from "@/lib/booking-constraints-store";
import { validateBookingWindow } from "@/lib/booking-constraints";
import { getRequiredSite } from "@/lib/sites";
import { evaluateAvailabilityWindow } from "@/lib/vehicle-schedule";
import { getVehicleAvailabilityScheduleByAssignmentIds } from "@/lib/vehicle-schedule-store";
import {
  hasBlockConflict,
  hasSchedulingConflict,
  resolveOccupiedWindow,
  resolveRequestedServiceEndAt,
  type AvailabilityBookingWindow,
} from "@/lib/vehicle-availability";

const availabilityRequestSchema = z.object({
  pickupAddress: z.string().min(2),
  dropoffAddress: z.string().nullable(),
  pickupAt: z.string(),
  returnAt: z.string().nullable(),
  returnTrip: z.boolean(),
  tripType: z.enum(["flat", "distance", "hourly", "event"]),
  routeDurationMinutes: z.number().int().min(0).nullable(),
  hoursRequested: z.number().int().min(2).max(12).nullable(),
});

type VehicleAvailabilityStatus = {
  availableUnits: number;
  nextAvailablePickupAt: string | null;
  reason: string | null;
  reasonType: "available" | "inventory" | "schedule";
};

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60 * 1000);
}

export async function POST(request: Request) {
  const payload = availabilityRequestSchema.parse(await request.json());
  const site = await getRequiredSite(env.siteSlug);
  const pickupAt = new Date(payload.pickupAt);
  const returnAt = payload.returnAt ? new Date(payload.returnAt) : null;
  const bookingConstraints = await getBookingConstraintsBySiteId(site.id);
  const validationMessage = validateBookingWindow({
    constraints: bookingConstraints,
    pickupAt,
    returnAt,
  });

  if (validationMessage) {
    return NextResponse.json({ error: validationMessage }, { status: 400 });
  }

  const dispatchRules = await getDispatchRulesBySiteId(site.id);
  const serviceEndAt = resolveRequestedServiceEndAt(payload, dispatchRules);

  const rows = await db
    .select({
      assignmentId: vehicleSiteAssignments.id,
      vehicleId: vehicles.id,
      unitId: vehicleUnits.id,
    })
    .from(vehicles)
    .innerJoin(
      vehicleSiteAssignments,
      eq(vehicleSiteAssignments.vehicleId, vehicles.id),
    )
    .innerJoin(vehicleUnits, eq(vehicleUnits.vehicleId, vehicles.id))
    .where(
      and(
        eq(vehicleSiteAssignments.siteId, site.id),
        eq(vehicles.active, true),
        eq(vehicleUnits.active, true),
      ),
    )
    .orderBy(asc(vehicles.displayOrder), asc(vehicles.name), asc(vehicleUnits.label));
  const availabilityRulesByAssignmentId =
    await getVehicleAvailabilityScheduleByAssignmentIds(
      Array.from(new Set(rows.map((row) => row.assignmentId))),
    );

  const unitIds = rows.map((row) => row.unitId);

  if (unitIds.length === 0) {
    return NextResponse.json({
      availableCounts: {},
      availableVehicleIds: [],
    });
  }

  const overlapping = await db
    .select()
    .from(bookings)
    .where(
      and(
        inArray(bookings.status, ["pending", "confirmed", "paid"]),
        inArray(bookings.vehicleUnitId, unitIds),
      ),
    );
  const blockRows = await db
    .select()
    .from(vehicleBlocks)
    .where(inArray(vehicleBlocks.vehicleUnitId, unitIds));
  const bookingRulesBySiteId = await getDispatchRulesBySiteIds(
    overlapping.map((booking) => booking.siteId),
  );

  const unitsByVehicle = rows.reduce<Record<string, typeof rows>>((acc, row) => {
    acc[row.vehicleId] ??= [];
    acc[row.vehicleId].push(row);
    return acc;
  }, {});
  const bookingsByUnit = overlapping.reduce<Record<string, typeof overlapping>>((acc, booking) => {
    if (!booking.vehicleUnitId) {
      return acc;
    }

    acc[booking.vehicleUnitId] ??= [];
    acc[booking.vehicleUnitId].push(booking);
    return acc;
  }, {});
  const blocksByUnit = blockRows.reduce<Record<string, typeof blockRows>>((acc, block) => {
    acc[block.vehicleUnitId] ??= [];
    acc[block.vehicleUnitId].push(block);
    return acc;
  }, {});

  const serviceDurationMinutes = Math.max(
    Math.round((serviceEndAt.getTime() - pickupAt.getTime()) / 60000),
    15,
  );

  async function countAvailableUnitsForVehicle(
    units: (typeof rows),
    pickupTime: Date,
  ) {
    const candidate: AvailabilityBookingWindow = {
      dropoffAddress: payload.dropoffAddress,
      pickupAddress: payload.pickupAddress,
      pickupAt: pickupTime,
      serviceEndAt: addMinutes(pickupTime, serviceDurationMinutes),
    };
    const candidateOccupiedWindow = resolveOccupiedWindow(candidate, dispatchRules);
    const assignmentSchedule = availabilityRulesByAssignmentId.get(
      units[0]?.assignmentId ?? "",
    ) ?? {
      exceptions: [],
      rules: [],
    };
    const scheduleDecision = evaluateAvailabilityWindow({
      exceptions: assignmentSchedule.exceptions,
      rules: assignmentSchedule.rules,
      timeZone: bookingConstraints.timeZone,
      windowEnd: candidateOccupiedWindow.endAt,
      windowStart: candidateOccupiedWindow.startAt,
    });

    if (!scheduleDecision.allowed) {
      return { availableUnits: 0, scheduleDecision };
    }

    let availableUnits = 0;

    for (const unit of units) {
      const existingBookings = bookingsByUnit[unit.unitId] ?? [];
      const existingBlocks = blocksByUnit[unit.unitId] ?? [];
      let conflict = false;

      for (const booking of existingBookings) {
        const bookingWindow: AvailabilityBookingWindow = {
          dispatchOverride: normalizeDispatchOverride(booking.dispatchOverride),
          pickupAt: new Date(booking.pickupAt),
          serviceEndAt: new Date(booking.serviceEndAt ?? booking.returnAt ?? booking.pickupAt),
          pickupAddress: booking.pickupAddress,
          dropoffAddress: booking.dropoffAddress,
        };
        const bookingRules =
          bookingRulesBySiteId.get(booking.siteId) ?? defaultDispatchRules;

        if (
          await hasSchedulingConflict(
            bookingWindow,
            candidate,
            bookingRules,
            dispatchRules,
          )
        ) {
          conflict = true;
          break;
        }
      }

      if (!conflict) {
        for (const block of existingBlocks) {
          if (
            hasBlockConflict(
              {
                endAt: new Date(block.endAt),
                startAt: new Date(block.startAt),
              },
              candidate,
              dispatchRules,
            )
          ) {
            conflict = true;
            break;
          }
        }
      }

      if (!conflict) {
        availableUnits += 1;
      }
    }

    return { availableUnits, scheduleDecision };
  }

  async function findNextAvailablePickupAt(units: (typeof rows)) {
    for (let offset = 1; offset <= 96; offset += 1) {
      const candidatePickupAt = addMinutes(pickupAt, offset * 30);
      const result = await countAvailableUnitsForVehicle(units, candidatePickupAt);

      if (result.availableUnits > 0) {
        return candidatePickupAt.toISOString();
      }
    }

    return null;
  }

  const vehicleStatuses = Object.fromEntries(
    await Promise.all(
      Object.entries(unitsByVehicle).map(async ([vehicleId, units]) => {
        const result = await countAvailableUnitsForVehicle(units, pickupAt);

        if (result.availableUnits > 0) {
          return [
            vehicleId,
            {
              availableUnits: result.availableUnits,
              nextAvailablePickupAt: null,
              reason: null,
              reasonType: "available",
            } satisfies VehicleAvailabilityStatus,
          ];
        }

        const reasonType = result.scheduleDecision.allowed ? "inventory" : "schedule";
        const nextAvailablePickupAt = await findNextAvailablePickupAt(units);

        return [
          vehicleId,
          {
            availableUnits: 0,
            nextAvailablePickupAt,
            reason:
              reasonType === "schedule"
                ? result.scheduleDecision.reason ??
                  "Outside this vehicle's scheduled operating window."
                : "All assigned units are already booked or blocked for that window.",
            reasonType,
          } satisfies VehicleAvailabilityStatus,
        ];
      }),
    ),
  ) as Record<string, VehicleAvailabilityStatus>;
  const availableCounts = Object.fromEntries(
    Object.entries(vehicleStatuses).map(([vehicleId, status]) => [
      vehicleId,
      status.availableUnits,
    ]),
  );

  return NextResponse.json({
    availableCounts,
    availableVehicleIds: Object.entries(availableCounts)
      .filter(([, count]) => Number(count) > 0)
      .map(([vehicleId]) => vehicleId),
    vehicleStatuses,
  });
}
