import { NextResponse } from "next/server";
import { z } from "zod";

import { finalizeBookingStripePayment } from "@/lib/booking-payment-intents";
import {
  getPublicBookingPaymentDetail,
  PublicBookingPaymentAccessError,
} from "@/lib/public-booking-payments";
import { isStripeConfigured } from "@/lib/stripe";

const finalizePaymentSchema = z.object({
  paymentIntentId: z.string().min(1),
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

  const { paymentIntentId, reference, token } = finalizePaymentSchema.parse(
    await request.json(),
  );

  try {
    const detail = await getPublicBookingPaymentDetail({
      reference,
      token: token ?? null,
    });
    return NextResponse.json(
      await finalizeBookingStripePayment({
        bookingId: detail.booking.id,
        paymentIntentId,
      }),
    );
  } catch (error) {
    if (error instanceof PublicBookingPaymentAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

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
