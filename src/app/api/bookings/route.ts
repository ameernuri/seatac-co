import { NextResponse } from "next/server";

import {
  BookingGuardrailError,
  bookingPayloadSchema,
  VehicleAvailabilityError,
} from "@/lib/booking-payload";
import { createBookingCheckout } from "@/lib/checkout";
import { isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured for the local app yet." },
      { status: 503 },
    );
  }

  const payload = bookingPayloadSchema.parse(await request.json());

  try {
    const result = await createBookingCheckout({ payload });

    return NextResponse.json({
      bookingReference: result.booking.reference,
      checkoutUrl: result.checkoutUrl,
    });
  } catch (error) {
    if (error instanceof BookingGuardrailError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof VehicleAvailabilityError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Stripe checkout session could not be created." },
      { status: 502 },
    );
  }
}
