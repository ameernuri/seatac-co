import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import {
  BookingGuardrailError,
  bookingPayloadSchema,
  VehicleAvailabilityError,
} from "@/lib/booking-payload";
import { createBookingCheckout } from "@/lib/checkout";
import { env } from "@/env";
import { isStripeConfigured } from "@/lib/stripe";
import { buildCustomerPaymentRequestEmail } from "@/lib/email-templates";
import {
  getNotificationSiteContext,
  isEmailConfigured,
  sendEmail,
} from "@/lib/email";
import { getPublicBookingPaymentUrl } from "@/lib/public-booking-payments";
import { buildCustomerPaymentRequestSms } from "@/lib/sms-templates";
import { isSmsConfigured, sendTextMessage } from "@/lib/sms";
import { eq } from "drizzle-orm";

const manualBookingRequestSchema = z.object({
  payload: bookingPayloadSchema,
  priceOverrideDollars: z.number().min(0).nullable().optional(),
  priceOverrideReason: z.string().trim().max(240).nullable().optional(),
  adminScheduleOverride: z.boolean().default(false),
  sendPaymentEmail: z.boolean().default(true),
  sendPaymentSms: z.boolean().default(false),
  siteSlug: z.string().min(1).optional(),
});

function isAuthorized(request: Request) {
  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${env.adminInternalToken}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured for the booking app yet." },
      { status: 503 },
    );
  }

  const body = manualBookingRequestSchema.parse(await request.json());

  try {
    const result = await createBookingCheckout({
      adminScheduleOverride: body.adminScheduleOverride,
      priceOverrideDollars: body.priceOverrideDollars ?? null,
      priceOverrideReason: body.priceOverrideReason ?? null,
      payload: body.payload,
      siteSlug: body.siteSlug,
    });

    if (!result.checkoutUrl) {
      return NextResponse.json(
        { error: "Stripe checkout session was created without a payment URL." },
        { status: 502 },
      );
    }

    const summaryUrl = await getPublicBookingPaymentUrl({
      bookingId: result.booking.id,
      bookingReference: result.booking.reference,
    });

    let paymentEmailSent = false;
    let paymentEmailError: string | null = null;

    if (body.sendPaymentEmail) {
      if (!isEmailConfigured()) {
        paymentEmailError = "Email is not configured for the booking app.";
      } else {
        try {
          const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, result.booking.id),
          });

          if (!booking) {
            throw new Error("Booking could not be loaded for the payment email.");
          }

          const siteContext = await getNotificationSiteContext(
            body.siteSlug ?? env.siteSlug,
          );
          const message = buildCustomerPaymentRequestEmail({
            booking,
            site: siteContext,
            summaryUrl,
          });

          await sendEmail({
            html: message.html,
            replyTo: siteContext.dispatchEmail,
            subject: message.subject,
            text: message.text,
            to: result.booking.customerEmail,
          });
          paymentEmailSent = true;
        } catch (error) {
          paymentEmailError =
            error instanceof Error ? error.message : "Payment email could not be sent.";
        }
      }
    }

    let paymentSmsSent = false;
    let paymentSmsError: string | null = null;

    if (body.sendPaymentSms) {
      if (!isSmsConfigured()) {
        paymentSmsError = "SMS is not configured for the booking app.";
      } else {
        try {
          const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, result.booking.id),
          });

          if (!booking) {
            throw new Error("Booking could not be loaded for the payment SMS.");
          }

          const siteContext = await getNotificationSiteContext(
            body.siteSlug ?? env.siteSlug,
          );

          await sendTextMessage({
            body: buildCustomerPaymentRequestSms({
              booking,
              siteName: siteContext.companyName,
              summaryUrl,
            }),
            to: booking.customerPhone,
          });
          paymentSmsSent = true;
        } catch (error) {
          paymentSmsError =
            error instanceof Error ? error.message : "Payment SMS could not be sent.";
        }
      }
    }

    return NextResponse.json({
      bookingId: result.booking.id,
      bookingReference: result.booking.reference,
      checkoutUrl: result.checkoutUrl,
      paymentStatus: result.booking.paymentStatus,
      paymentEmailError,
      paymentEmailSent,
      paymentSmsError,
      paymentSmsSent,
      summaryUrl,
      totalCents: result.booking.totalCents,
    });
  } catch (error) {
    if (error instanceof BookingGuardrailError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof VehicleAvailabilityError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Admin manual booking failed.", error);

    return NextResponse.json(
      { error: "Stripe checkout session could not be created." },
      { status: 502 },
    );
  }
}
