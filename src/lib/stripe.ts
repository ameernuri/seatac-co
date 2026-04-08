import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { env } from "@/env";
import {
  buildCustomerBookingConfirmationEmail,
  buildDispatchBookingAlertEmail,
} from "@/lib/email-templates";
import {
  getDispatchEmailRecipients,
  getNotificationSiteContext,
  isEmailConfigured,
  sendEmail,
} from "@/lib/email";
import {
  buildCustomerBookingConfirmationSms,
  buildDispatchBookingAlertSms,
} from "@/lib/sms-templates";
import { getBookingManageUrl } from "@/lib/account-bookings";
import {
  getDispatchSmsRecipients,
  isSmsConfigured,
  sendTextMessage,
} from "@/lib/sms";

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

async function sendBookingSmsNotifications(
  booking: typeof bookings.$inferSelect | undefined,
) {
  if (!booking || booking.paymentStatus !== "paid") {
    return;
  }

  const site = await db.query.sites.findFirst({
    where: (site, { eq }) => eq(site.id, booking.siteId),
  });
  const siteName = site?.name ?? "seatac.co";
  const siteSlug = site?.slug ?? env.siteSlug;
  const siteContext = await getNotificationSiteContext(siteSlug);
  const bookingUrl = getBookingManageUrl(booking.reference, env.appUrl);

  if (isEmailConfigured()) {
    if (!booking.customerEmailConfirmationSentAt) {
      try {
        const message = buildCustomerBookingConfirmationEmail({
          booking,
          site: siteContext,
        });

        await sendEmail({
          html: message.html,
          replyTo: siteContext.dispatchEmail,
          subject: message.subject,
          text: message.text,
          to: booking.customerEmail,
        });

        await db
          .update(bookings)
          .set({
            customerEmailConfirmationSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, booking.id));
      } catch (error) {
        console.error("Customer booking confirmation email failed.", error);
      }
    }

    const dispatchEmailRecipients = getDispatchEmailRecipients();

    if (dispatchEmailRecipients.length > 0 && !booking.dispatchEmailSentAt) {
      try {
        const message = buildDispatchBookingAlertEmail({
          booking,
          site: siteContext,
        });

        await sendEmail({
          html: message.html,
          replyTo: siteContext.dispatchEmail,
          subject: message.subject,
          text: message.text,
          to: dispatchEmailRecipients,
        });

        await db
          .update(bookings)
          .set({
            dispatchEmailSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, booking.id));
      } catch (error) {
        console.error("Dispatch booking alert email failed.", error);
      }
    }
  }

  if (!isSmsConfigured()) {
    return;
  }

  if (booking.customerSmsOptIn && !booking.customerSmsConfirmationSentAt) {
    try {
      await sendTextMessage({
        body: buildCustomerBookingConfirmationSms({ booking, bookingUrl, siteName }),
        to: booking.customerPhone,
      });

      await db
        .update(bookings)
        .set({
          customerSmsConfirmationSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, booking.id));
    } catch (error) {
      console.error("Customer booking confirmation SMS failed.", error);
    }
  }

  const dispatchRecipients = getDispatchSmsRecipients();

  if (dispatchRecipients.length > 0 && !booking.dispatchSmsSentAt) {
    try {
      await Promise.all(
        dispatchRecipients.map((to) =>
          sendTextMessage({
            body: buildDispatchBookingAlertSms({ booking, siteName }),
            to,
          }),
        ),
      );

      await db
        .update(bookings)
        .set({
          dispatchSmsSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, booking.id));
    } catch (error) {
      console.error("Dispatch booking alert SMS failed.", error);
    }
  }
}

type BookingPaymentStateInput = {
  bookingId: string;
  paymentIntentId?: string | null;
  paymentStatus: "paid" | "expired" | "pending";
  sessionId?: string | null;
};

export async function applyBookingPaymentState({
  bookingId,
  paymentIntentId,
  paymentStatus,
  sessionId,
}: BookingPaymentStateInput) {
  const bookingStatus = paymentStatus === "paid" ? "confirmed" : "pending";

  const [booking] = await db
    .update(bookings)
    .set({
      status: bookingStatus,
      paymentStatus,
      paymentMethod: "stripe",
      paymentCheckoutSessionId: sessionId ?? null,
      paymentIntentId: paymentIntentId ?? null,
      paymentCollectedAt: paymentStatus === "paid" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning();

  await sendBookingSmsNotifications(booking);

  return booking;
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
  const booking = await applyBookingPaymentState({
    bookingId,
    paymentIntentId,
    paymentStatus,
    sessionId: session.id,
  });

  return { booking, session };
}

export async function getReserveSuccessState(sessionId: string) {
  const { booking, session } = await syncStripeCheckoutSession(sessionId);

  if (!booking) {
    return null;
  }

  const total = typeof session.amount_total === "number" ? session.amount_total / 100 : 0;
  const paymentStatus = session.payment_status ?? "unpaid";
  const viewState = paymentStatus === "paid" ? "confirmed" : "pending";

  return {
    booking: {
      contact: booking.customerEmail,
      customerName: booking.customerName,
      reference: booking.reference,
      routeName: booking.routeName,
      vehicleName: booking.vehicleName,
    },
    session: {
      amountTotal: total,
      id: session.id,
      paymentStatus,
      status: session.status,
      url: session.url ?? null,
    },
    viewState,
  };
}
