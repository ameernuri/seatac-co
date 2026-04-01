import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { bookingPayloadSchema, createBookingDraft } from "@/lib/booking-payload";
import { env } from "@/env";
import { getStripeClient } from "@/lib/stripe";

type BookingPayload = z.infer<typeof bookingPayloadSchema>;

type CreateBookingCheckoutInput = {
  payload: BookingPayload;
  siteSlug?: string;
  customerUserId?: string | null;
};

export async function createBookingCheckout({
  payload,
  siteSlug,
  customerUserId,
}: CreateBookingCheckoutInput) {
  const draft = await createBookingDraft(payload, siteSlug, customerUserId);
  const { booking, vehicle } = draft;
  const site = await db.query.sites.findFirst({
    where: (table, { eq }) => eq(table.id, booking.siteId),
  });

  const stripe = getStripeClient();

  try {
    const session = await stripe.checkout.sessions.create({
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
              name: `${site?.name ?? "seatac.co"} reservation ${booking.reference}`,
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

    await db
      .update(bookings)
      .set({
        paymentCheckoutSessionId: session.id,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));

    return {
      booking: {
        ...booking,
        paymentCheckoutSessionId: session.id,
      },
      checkoutSessionId: session.id,
      checkoutUrl: session.url,
      draft,
      session,
      vehicle,
    };
  } catch (error) {
    await db
      .update(bookings)
      .set({
        paymentStatus: "failed",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));

    throw error;
  }
}
