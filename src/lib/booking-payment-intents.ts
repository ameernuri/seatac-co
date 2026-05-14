import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { env } from "@/env";
import { applyBookingPaymentState, getStripeClient } from "@/lib/stripe";

const paymentIntentBookingColumns = {
  customerEmail: bookings.customerEmail,
  customerName: bookings.customerName,
  customerPhone: bookings.customerPhone,
  id: bookings.id,
  paymentCheckoutSessionId: bookings.paymentCheckoutSessionId,
  paymentIntentId: bookings.paymentIntentId,
  paymentStatus: bookings.paymentStatus,
  reference: bookings.reference,
  status: bookings.status,
  totalCents: bookings.totalCents,
} satisfies Record<string, unknown>;

function canReusePaymentIntent(status: Stripe.PaymentIntent.Status) {
  return [
    "requires_payment_method",
    "requires_confirmation",
    "requires_action",
    "processing",
  ].includes(status);
}

async function expireCheckoutSessionIfOpen(sessionId: string | null | undefined) {
  if (!sessionId) {
    return;
  }

  const stripe = getStripeClient();

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status === "open") {
      await stripe.checkout.sessions.expire(sessionId);
    }
  } catch (error) {
    console.warn("Checkout session could not be expired after card payment.", error);
  }
}

export async function createOrReuseBookingPaymentIntent(bookingId: string) {
  const [booking] = await db
    .select(paymentIntentBookingColumns)
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.paymentStatus === "paid" || booking.status === "confirmed") {
    throw new Error("This booking is already paid.");
  }

  const stripe = getStripeClient();
  let paymentIntent: Stripe.PaymentIntent | null = null;

  if (booking.paymentIntentId) {
    try {
      const existingIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);

      if (existingIntent.status === "succeeded") {
        await applyBookingPaymentState({
          bookingId: booking.id,
          paymentIntentId: existingIntent.id,
          paymentStatus: "paid",
          sessionId: booking.paymentCheckoutSessionId,
        });

        throw new Error("This booking is already paid.");
      }

      if (
        canReusePaymentIntent(existingIntent.status) &&
        existingIntent.client_secret &&
        existingIntent.payment_method_types.includes("card")
      ) {
        paymentIntent = existingIntent;
      }
    } catch (error) {
      if (error instanceof Error && error.message === "This booking is already paid.") {
        throw error;
      }

      console.warn("Existing payment intent could not be reused.", error);
    }
  }

  if (!paymentIntent) {
    paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalCents,
      currency: env.stripeCurrency,
      description: `seatac.co ride ${booking.reference}`,
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.reference,
      },
      payment_method_types: ["card"],
      receipt_email: booking.customerEmail,
    });

    await db
      .update(bookings)
      .set({
        paymentIntentId: paymentIntent.id,
        paymentMethod: "stripe",
        paymentStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));
  }

  if (!paymentIntent.client_secret) {
    throw new Error("Stripe did not return a client secret for this payment.");
  }

  return {
    amountCents: booking.totalCents,
    bookingId: booking.id,
    bookingReference: booking.reference,
    clientSecret: paymentIntent.client_secret,
    customerEmail: booking.customerEmail,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    paymentIntentId: paymentIntent.id,
    paymentStatus: booking.paymentStatus,
  };
}

export async function finalizeBookingStripePayment({
  bookingId,
  paymentIntentId,
}: {
  bookingId: string;
  paymentIntentId: string;
}) {
  const [booking] = await db
    .select(paymentIntentBookingColumns)
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.paymentStatus === "paid" || booking.status === "confirmed") {
    return {
      bookingId: booking.id,
      bookingReference: booking.reference,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
    };
  }

  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.metadata?.bookingId !== booking.id) {
    throw new Error("That payment is not linked to this booking.");
  }

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Stripe has not marked this card payment as successful yet.");
  }

  if (paymentIntent.amount !== booking.totalCents) {
    throw new Error("The payment amount does not match the booking total.");
  }

  await expireCheckoutSessionIfOpen(booking.paymentCheckoutSessionId);

  const updatedBooking = await applyBookingPaymentState({
    bookingId: booking.id,
    paymentIntentId: paymentIntent.id,
    paymentStatus: "paid",
    sessionId: booking.paymentCheckoutSessionId,
  });

  return {
    bookingId: updatedBooking?.id ?? booking.id,
    bookingReference: updatedBooking?.reference ?? booking.reference,
    paymentIntentId: paymentIntent.id,
    paymentStatus: updatedBooking?.paymentStatus ?? "paid",
    status: updatedBooking?.status ?? "confirmed",
  };
}
