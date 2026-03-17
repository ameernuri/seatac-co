import { NextResponse } from "next/server";
import Stripe from "stripe";

import { env } from "@/env";
import { getStripeClient, isStripeConfigured, syncStripeCheckoutSession } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !env.stripeWebhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripeWebhookSecret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await syncStripeCheckoutSession(session.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
