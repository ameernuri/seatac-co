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
  adminScheduleOverride?: boolean;
  payload: BookingPayload;
  siteSlug?: string;
  customerUserId?: string | null;
  priceOverrideDollars?: number | null;
  priceOverrideReason?: string | null;
};

export async function createBookingCheckout({
  adminScheduleOverride,
  payload,
  siteSlug,
  customerUserId,
  priceOverrideDollars,
  priceOverrideReason,
}: CreateBookingCheckoutInput) {
  const checkoutStartedAt = Date.now();
  const draft = await createBookingDraft(
    payload,
    siteSlug,
    customerUserId,
    adminScheduleOverride,
  );
  const draftCreatedAt = Date.now();
  const { booking, vehicle } = draft;
  let bookingForCheckout = booking;
  let checkoutAmountCents = booking.totalCents;
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
  if (typeof priceOverrideDollars === "number" && Number.isFinite(priceOverrideDollars)) {
    const overrideCents = Math.max(Math.round(priceOverrideDollars * 100), 0);

    if (overrideCents > 0 && overrideCents !== booking.totalCents) {
      const overriddenPricing = {
        ...draft.pricing,
        adminOverrideReason: priceOverrideReason?.trim() || null,
        adminOverrideTotal: Math.round((overrideCents / 100) * 100) / 100,
        calculatedTotal: draft.pricing.total,
      };

      await db
        .update(bookings)
        .set({
          pricing: overriddenPricing,
          subtotalCents: overrideCents,
          totalCents: overrideCents,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, booking.id));

      bookingForCheckout = {
        ...booking,
        totalCents: overrideCents,
      };
      checkoutAmountCents = overrideCents;
    }
  }

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
            unit_amount: checkoutAmountCents,
            product_data: {
              name: `${siteName} ride ${bookingForCheckout.reference}`,
              description: checkoutDescription,
            },
          },
        },
      ],
      custom_text: {
        submit: {
          message: `Ride ${bookingForCheckout.reference}: ${pickupTime}. ${routeSummary || booking.routeName || "Custom route"}.`,
        },
      },
      metadata: {
        bookingId: bookingForCheckout.id,
        bookingReference: bookingForCheckout.reference,
        pickupAt: pickupAtDate.toISOString(),
        route: routeSummary || booking.routeName || "Custom route",
      },
      payment_intent_data: {
        description: `${siteName} ride ${bookingForCheckout.reference}`,
        metadata: {
          bookingId: bookingForCheckout.id,
          bookingReference: bookingForCheckout.reference,
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
        ...bookingForCheckout,
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
