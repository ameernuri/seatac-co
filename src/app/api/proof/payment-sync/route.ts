import { NextResponse } from "next/server";
import { z } from "zod";

import { applyBookingPaymentState } from "@/lib/stripe";
import { env } from "@/env";

const paymentSyncSchema = z.object({
  bookingId: z.string().uuid(),
  paymentIntentId: z.string().optional(),
  paymentStatus: z.enum(["paid", "pending", "expired"]).default("paid"),
  sessionId: z.string().optional(),
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

  const payload = paymentSyncSchema.parse(await request.json());
  const booking = await applyBookingPaymentState({
    bookingId: payload.bookingId,
    paymentIntentId: payload.paymentIntentId ?? "pi_proof_manual",
    paymentStatus: payload.paymentStatus,
    sessionId: payload.sessionId ?? "cs_proof_manual",
  });

  return NextResponse.json({
    booking: booking
      ? {
          id: booking.id,
          paymentCollectedAt: booking.paymentCollectedAt,
          paymentStatus: booking.paymentStatus,
          reference: booking.reference,
          status: booking.status,
        }
      : null,
  });
}
