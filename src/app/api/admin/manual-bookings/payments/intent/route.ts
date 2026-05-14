import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/env";
import { createOrReuseBookingPaymentIntent } from "@/lib/booking-payment-intents";
import { isStripeConfigured } from "@/lib/stripe";

const paymentIntentRequestSchema = z.object({
  bookingId: z.string().uuid(),
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

  const { bookingId } = paymentIntentRequestSchema.parse(await request.json());

  try {
    return NextResponse.json(await createOrReuseBookingPaymentIntent(bookingId));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The payment form could not be opened.";
    const status =
      message === "Booking not found."
        ? 404
        : message === "This booking is already paid."
          ? 409
          : message === "Stripe did not return a client secret for this payment."
            ? 502
            : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
