import { NextResponse } from "next/server";
import { z } from "zod";

import {
  BookingGuardrailError,
  bookingPayloadSchema,
  createBookingDraft,
  VehicleAvailabilityError,
} from "@/lib/booking-payload";
import { env } from "@/env";

const proofRequestSchema = z.object({
  siteSlug: z.string().min(2).optional(),
  booking: bookingPayloadSchema,
});

function readProofSecret() {
  return process.env.PROOF_RUNNER_SECRET?.trim() || env.betterAuthSecret;
}

export async function POST(request: Request) {
  const expectedSecret = readProofSecret();
  const providedSecret = request.headers.get("x-proof-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized proof request." }, { status: 401 });
  }

  const payload = proofRequestSchema.parse(await request.json());

  try {
    const result = await createBookingDraft(payload.booking, payload.siteSlug);

    return NextResponse.json({
      booking: {
        id: result.booking.id,
        paymentStatus: result.booking.paymentStatus,
        reference: result.booking.reference,
        vehicleId: result.booking.vehicleId,
        vehicleUnitId: result.booking.vehicleUnitId,
      },
      pricing: result.pricing,
      vehicle: {
        id: result.vehicle.id,
        name: result.vehicle.name,
      },
    });
  } catch (error) {
    if (error instanceof BookingGuardrailError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof VehicleAvailabilityError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }
}
