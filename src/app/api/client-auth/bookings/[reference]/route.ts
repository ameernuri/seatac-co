import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { getBookingForUser } from "@/lib/account-bookings";
import { getServerSession } from "@/lib/session";

const patchBodySchema = z.object({
  customerSmsOptIn: z.boolean().optional(),
  specialInstructions: z.string().trim().max(1500).nullable().optional(),
});

type Props = {
  params: Promise<{
    reference: string;
  }>;
};

export async function PATCH(request: Request, { params }: Props) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { reference } = await params;
  const payload = patchBodySchema.parse(await request.json());

  const booking = await getBookingForUser(session.user.id, reference);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const [updated] = await db
    .update(bookings)
    .set({
      customerSmsOptIn:
        payload.customerSmsOptIn ?? booking.customerSmsOptIn,
      specialInstructions:
        payload.specialInstructions === undefined
          ? booking.specialInstructions
          : payload.specialInstructions,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, booking.id))
    .returning({
      customerSmsOptIn: bookings.customerSmsOptIn,
      id: bookings.id,
      reference: bookings.reference,
      specialInstructions: bookings.specialInstructions,
      updatedAt: bookings.updatedAt,
    });

  return NextResponse.json({ booking: updated });
}
