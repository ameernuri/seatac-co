import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import {
  BookingGuardrailError,
  bookingPayloadSchema,
  createBookingDraft,
  VehicleAvailabilityError,
} from "@/lib/booking-payload";
import { env } from "@/env";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { getCurrentSite } from "@/lib/sites";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured for the local app yet." },
      { status: 503 },
    );
  }

  const payload = bookingPayloadSchema.parse(await request.json());
  const site = await getCurrentSite();
  let draft;

  try {
    draft = await createBookingDraft(payload);
  } catch (error) {
    if (error instanceof BookingGuardrailError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof VehicleAvailabilityError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }

  const { booking, vehicle } = draft;

  const stripe = getStripeClient();

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      billing_address_collection: "auto",
      customer_email: booking.customerEmail,
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${env.appUrl}/reserve/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.appUrl}/reserve`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: env.stripeCurrency,
            unit_amount: booking.totalCents,
            product_data: {
              name: `${site.name} reservation ${booking.reference}`,
              description: `${vehicle.name} • ${booking.routeName ?? "Custom route"}`,
            },
          },
        },
      ],
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.reference,
      },
      payment_intent_data: {
        metadata: {
          bookingId: booking.id,
          bookingReference: booking.reference,
        },
      },
    });
  } catch {
    await db
      .update(bookings)
      .set({
        paymentStatus: "failed",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));

    return NextResponse.json(
      { error: "Stripe checkout session could not be created." },
      { status: 502 },
    );
  }

  await db
    .update(bookings)
    .set({
      paymentCheckoutSessionId: session.id,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, booking.id));

  return NextResponse.json({
    bookingReference: booking.reference,
    checkoutUrl: session.url,
  });
}
