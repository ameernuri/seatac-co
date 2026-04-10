import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { getStripeCheckoutExpiresAt } from "@/lib/booking-holds";
import { bookingPayloadSchema, createBookingDraft } from "@/lib/booking-payload";
import { env } from "@/env";
import { formatDateTime } from "@/lib/format";
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
  const checkoutStartedAt = Date.now();
  const draft = await createBookingDraft(payload, siteSlug, customerUserId);
  const draftCreatedAt = Date.now();
  const { booking, vehicle } = draft;
  const site = await db.query.sites.findFirst({
    where: (table, { eq }) => eq(table.id, booking.siteId),
  });

  const stripe = getStripeClient();
  const siteName = site?.name ?? "Seatac Connection";
  const pickupAtDate =
    booking.pickupAt instanceof Date ? booking.pickupAt : new Date(booking.pickupAt);
  const pickupTime = formatDateTime(pickupAtDate);
  const routeSummary = [booking.pickupLabel, booking.dropoffLabel]
    .filter((value): value is string => Boolean(value))
    .join(" to ");
  const checkoutDescription = [
    `${vehicle.name} ride`,
    pickupTime,
    routeSummary || booking.routeName || "Custom route",
  ].join(" • ");

  try {
    const stripeStartedAt = Date.now();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      billing_address_collection: "auto",
      customer_email: booking.customerEmail,
      expires_at: getStripeCheckoutExpiresAt(),
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
              name: `${siteName} ride ${booking.reference}`,
              description: checkoutDescription,
            },
          },
        },
      ],
      custom_text: {
        submit: {
          message: `Ride ${booking.reference}: ${pickupTime}. ${routeSummary || booking.routeName || "Custom route"}.`,
        },
      },
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.reference,
        pickupAt: pickupAtDate.toISOString(),
        route: routeSummary || booking.routeName || "Custom route",
      },
      payment_intent_data: {
        description: `${siteName} ride ${booking.reference}`,
        metadata: {
          bookingId: booking.id,
          bookingReference: booking.reference,
          pickupAt: pickupAtDate.toISOString(),
          route: routeSummary || booking.routeName || "Custom route",
        },
      },
    });
    const stripeCreatedAt = Date.now();

    await db
      .update(bookings)
      .set({
        paymentCheckoutSessionId: session.id,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));
    const bookingUpdatedAt = Date.now();

    console.info("[booking-checkout] checkout session created", {
      bookingReference: booking.reference,
      draftMs: draftCreatedAt - checkoutStartedAt,
      stripeMs: stripeCreatedAt - stripeStartedAt,
      updateMs: bookingUpdatedAt - stripeCreatedAt,
      totalMs: bookingUpdatedAt - checkoutStartedAt,
    });

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
