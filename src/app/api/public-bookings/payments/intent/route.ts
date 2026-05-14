import { NextResponse } from "next/server";
import { z } from "zod";

import { createOrReuseBookingPaymentIntent } from "@/lib/booking-payment-intents";
import {
  getPublicBookingPaymentDetail,
  PublicBookingPaymentAccessError,
} from "@/lib/public-booking-payments";
import { isStripeConfigured } from "@/lib/stripe";

const paymentIntentRequestSchema = z.object({
  reference: z.string().min(1),
  token: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured for the booking app yet." },
      { status: 503 },
    );
  }

  const { reference, token } = paymentIntentRequestSchema.parse(await request.json());

  try {
    const detail = await getPublicBookingPaymentDetail({
      reference,
      token: token ?? null,
    });
    return NextResponse.json(await createOrReuseBookingPaymentIntent(detail.booking.id));
  } catch (error) {
    if (error instanceof PublicBookingPaymentAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

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
