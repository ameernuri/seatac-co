import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { env } from "@/env";
import { applyBookingPaymentState, getStripeClient, isStripeConfigured } from "@/lib/stripe";

const proofRequestSchema = z.object({
  paymentStatus: z.enum(["paid", "pending", "expired"]).default("paid"),
  sessionId: z.string().min(8),
});

function readProofSecret() {
  return process.env.PROOF_RUNNER_SECRET?.trim() || env.betterAuthSecret;
}

function resolvePaymentIntentId(value: unknown, sessionId: string) {
  if (typeof value === "string" && value) {
    return value;
  }

  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") {
    return value.id;
  }

  return `pi_proof_${sessionId}`;
}

export async function POST(request: Request) {
  const expectedSecret = readProofSecret();
  const providedSecret = request.headers.get("x-proof-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized proof request." }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured for checkout settlement proofs." },
      { status: 503 },
    );
  }

  const payload = proofRequestSchema.parse(await request.json());
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(payload.sessionId, {
    expand: ["payment_intent"],
  });

  const bookingId =
    session.metadata?.bookingId ??
    (
      await db.query.bookings.findFirst({
        where: (table, { eq }) => eq(table.paymentCheckoutSessionId, payload.sessionId),
        columns: {
          id: true,
        },
      })
    )?.id;

  if (!bookingId) {
    return NextResponse.json({ error: "No booking is linked to that checkout session." }, { status: 404 });
  }

  const booking = await applyBookingPaymentState({
    bookingId,
    paymentIntentId: resolvePaymentIntentId(session.payment_intent, payload.sessionId),
    paymentStatus: payload.paymentStatus,
    sessionId: session.id,
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking could not be updated." }, { status: 404 });
  }

  return NextResponse.json({
    booking: {
      id: booking.id,
      paymentCheckoutSessionId: booking.paymentCheckoutSessionId,
      paymentCollectedAt: booking.paymentCollectedAt,
      paymentStatus: booking.paymentStatus,
      reference: booking.reference,
      status: booking.status,
    },
  });
}
