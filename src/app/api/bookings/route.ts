import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import {
  BookingGuardrailError,
  bookingPayloadSchema,
  VehicleAvailabilityError,
} from "@/lib/booking-payload";
import { createBookingCheckout } from "@/lib/checkout";
import { getServerSession } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe";
import { db } from "@/db/client";
import { clientProfiles, users } from "@/db/schema";
import { normalizePhoneNumber } from "@/lib/sms";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured for the local app yet." },
      { status: 503 },
    );
  }

  const payload = bookingPayloadSchema.parse(await request.json());
  const session = await getServerSession();
  let customerUserId = session?.user?.id ?? null;

  if (!customerUserId && payload.customerUserId) {
    const normalizedPhone = normalizePhoneNumber(payload.customerPhone);

    const [matchedUser] = await db
      .select({ id: users.id })
      .from(users)
      .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
      .where(
        and(
          eq(users.id, payload.customerUserId),
          eq(users.email, payload.customerEmail.trim().toLowerCase()),
          eq(clientProfiles.phoneNormalized, normalizedPhone ?? payload.customerPhone),
        ),
      )
      .limit(1);

    customerUserId = matchedUser?.id ?? null;
  }

  try {
    const result = await createBookingCheckout({
      payload,
      customerUserId,
    });

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

    console.error("Booking checkout failed.", error);

    return NextResponse.json(
      { error: "Stripe checkout session could not be created." },
      { status: 502 },
    );
  }
}
