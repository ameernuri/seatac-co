import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { env } from "@/env";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(env.stripeSecretKey);
}

export function getStripeClient() {
  if (!env.stripeSecretKey) {
    throw new Error("Stripe is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }

  return stripeClient;
}

function resolvePaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null,
) {
  if (!paymentIntent) {
    return null;
  }

  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

export async function syncStripeCheckoutSession(sessionId: string) {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });

  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    return { booking: null, session };
  }

  const paymentIntentId = resolvePaymentIntentId(session.payment_intent);
  const paymentStatus =
    session.payment_status === "paid"
      ? "paid"
      : session.status === "expired"
        ? "expired"
        : "pending";
  const bookingStatus = paymentStatus === "paid" ? "confirmed" : "pending";

  const [booking] = await db
    .update(bookings)
    .set({
      status: bookingStatus,
      paymentStatus,
      paymentMethod: "stripe",
      paymentCheckoutSessionId: session.id,
      paymentIntentId,
      paymentCollectedAt:
        paymentStatus === "paid" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning();

  return { booking, session };
}
