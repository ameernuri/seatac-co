import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/env";
import { finalizeBookingStripePayment } from "@/lib/booking-payment-intents";
import { isStripeConfigured } from "@/lib/stripe";

const finalizePaymentSchema = z.object({
  bookingId: z.string().uuid(),
  paymentIntentId: z.string().min(1),
});

function isAuthorized(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${env.adminInternalToken}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured for the booking app yet." },
      { status: 503 },
    );
  }

  const { bookingId, paymentIntentId } = finalizePaymentSchema.parse(await request.json());

  try {
    return NextResponse.json(
      await finalizeBookingStripePayment({ bookingId, paymentIntentId }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The booking could not be marked paid.";
    const status =
      message === "Booking not found."
        ? 404
        : message === "Stripe has not marked this card payment as successful yet." ||
            message === "The payment amount does not match the booking total."
          ? 409
          : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
