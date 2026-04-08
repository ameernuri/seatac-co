import { and, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { env } from "@/env";
import { getBookingManageUrl } from "@/lib/account-bookings";
import { buildCustomerReminderEmail } from "@/lib/email-templates";
import {
  getNotificationSiteContext,
  isEmailConfigured,
  sendEmail,
} from "@/lib/email";
import { buildCustomerReminderSms } from "@/lib/sms-templates";
import { isSmsConfigured, sendTextMessage } from "@/lib/sms";

type ReminderRunOptions = {
  now?: Date;
  dryRun?: boolean;
  references?: string[];
};

type ReminderRunResult = {
  scanned: number;
  sent: number;
  smsSent: number;
  emailSent: number;
  failed: number;
  skipped: number;
  candidates: string[];
  sentReferences: string[];
  failedReferences: string[];
  skippedReferences: string[];
  smsSentReferences: string[];
  emailSentReferences: string[];
  leadHours: number;
  dryRun: boolean;
  dryReason?: string;
};

function collectErrorMessages(error: unknown): string[] {
  if (!error || typeof error !== "object") {
    return [];
  }

  const values = Object.values(error as Record<string, unknown>);
  const directMessage =
    "message" in error && typeof (error as { message?: unknown }).message === "string"
      ? [(error as { message: string }).message]
      : [];

  return [...directMessage, ...values.flatMap((value) => collectErrorMessages(value))];
}

function errorMentions(error: unknown, ...needles: string[]) {
  const haystack = collectErrorMessages(error).join("\n").toLowerCase();
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}

function isMissingEmailReminderColumnError(error: unknown) {
  return errorMentions(error, "customer_email_reminder_sent_at");
}

type ReminderBookingRow = typeof bookings.$inferSelect;

async function loadDueBookingsSmsOnlyFallback(
  now: Date,
  reminderCutoff: Date,
  references?: string[],
) {
  const predicates = [
    inArray(bookings.status, ["confirmed", "paid"]),
    inArray(bookings.paymentStatus, ["paid"]),
    gte(bookings.pickupAt, now),
    lte(bookings.pickupAt, reminderCutoff),
    eq(bookings.customerSmsOptIn, true),
    isNull(bookings.customerSmsReminderSentAt),
  ];

  if (references?.length) {
    predicates.unshift(inArray(bookings.reference, references));
  }

  return db
    .select({
      id: bookings.id,
      siteId: bookings.siteId,
      reference: bookings.reference,
      pickupAt: bookings.pickupAt,
      routeName: bookings.routeName,
      vehicleName: bookings.vehicleName,
      customerPhone: bookings.customerPhone,
      customerSmsOptIn: bookings.customerSmsOptIn,
      customerSmsReminderSentAt: bookings.customerSmsReminderSentAt,
    })
    .from(bookings)
    .where(and(...predicates));
}

export async function sendDueCustomerSmsReminders(
  options: ReminderRunOptions = {},
): Promise<ReminderRunResult> {
  const dryRun = Boolean(options.dryRun);
  const references = options.references?.filter(Boolean);
  const smsEnabled = isSmsConfigured();
  let emailEnabled = isEmailConfigured();

  if (!smsEnabled && !emailEnabled) {
    return {
      scanned: 0,
      sent: 0,
      smsSent: 0,
      emailSent: 0,
      failed: 0,
      skipped: 0,
      candidates: [],
      sentReferences: [],
      failedReferences: [],
      skippedReferences: [],
      smsSentReferences: [],
      emailSentReferences: [],
      leadHours: env.twilioReminderLeadHours,
      dryRun,
      dryReason: "No reminder delivery channels are configured.",
    };
  }

  const now = options.now ?? new Date();
  const reminderCutoff = new Date(
    now.getTime() + env.twilioReminderLeadHours * 60 * 60 * 1000,
  );
  const buildReminderEligibilityPredicates = () => {
    const predicates = [];

    if (smsEnabled) {
      predicates.push(
        and(eq(bookings.customerSmsOptIn, true), isNull(bookings.customerSmsReminderSentAt)),
      );
    }

    if (emailEnabled) {
      predicates.push(and(isNull(bookings.customerEmailReminderSentAt)));
    }

    return predicates;
  };

  const loadDueBookings = async () => {
    const reminderEligibilityPredicates = buildReminderEligibilityPredicates();
    const basePredicates = [
      inArray(bookings.status, ["confirmed", "paid"]),
      inArray(bookings.paymentStatus, ["paid"]),
      gte(bookings.pickupAt, now),
      lte(bookings.pickupAt, reminderCutoff),
      reminderEligibilityPredicates.length === 1
        ? reminderEligibilityPredicates[0]
        : or(...reminderEligibilityPredicates),
    ];

    if (references?.length) {
      basePredicates.unshift(inArray(bookings.reference, references));
    }

    return db
      .select()
      .from(bookings)
      .where(and(...basePredicates));
  };

  let dueBookings: ReminderBookingRow[] | Awaited<ReturnType<typeof loadDueBookingsSmsOnlyFallback>>;
  try {
    dueBookings = await loadDueBookings();
  } catch (error) {
    if (!emailEnabled || !isMissingEmailReminderColumnError(error)) {
      throw error;
    }

    emailEnabled = false;
    dueBookings = await loadDueBookingsSmsOnlyFallback(now, reminderCutoff, references);
  }

  if (dueBookings.length === 0) {
    return {
      scanned: 0,
      sent: 0,
      smsSent: 0,
      emailSent: 0,
      failed: 0,
      skipped: 0,
      candidates: [],
      sentReferences: [],
      failedReferences: [],
      skippedReferences: [],
      smsSentReferences: [],
      emailSentReferences: [],
      leadHours: env.twilioReminderLeadHours,
      dryRun,
    };
  }

  const siteIds = [...new Set(dueBookings.map((booking) => booking.siteId))];
  const sites = siteIds.length
    ? await db.query.sites.findMany({
        where: (site, { inArray }) => inArray(site.id, siteIds),
      })
    : [];
  const siteById = new Map(sites.map((site) => [site.id, site]));

  let sent = 0;
  let smsSent = 0;
  let emailSent = 0;
  let failed = 0;
  const sentReferences: string[] = [];
  const failedReferences: string[] = [];
  const skippedReferences: string[] = [];
  const smsSentReferences: string[] = [];
  const emailSentReferences: string[] = [];

  for (const booking of dueBookings) {
    const site = siteById.get(booking.siteId);
    const siteName = site?.name ?? "seatac.co";
    const siteSlug = site?.slug ?? env.siteSlug;
    const siteContext = await getNotificationSiteContext(siteSlug);
    const bookingUrl = getBookingManageUrl(booking.reference, env.appUrl);

    try {
      if (dryRun) {
        skippedReferences.push(booking.reference);
        continue;
      }

      let bookingSent = false;

      const shouldSendSms =
        smsEnabled && booking.customerSmsOptIn && !booking.customerSmsReminderSentAt;

      if (shouldSendSms) {
        await sendTextMessage({
          to: booking.customerPhone,
          body: buildCustomerReminderSms({
            booking: booking as ReminderBookingRow,
            bookingUrl,
            siteName,
          }),
        });

        await db
          .update(bookings)
          .set({
            customerSmsReminderSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, booking.id));

        sent += 1;
        smsSent += 1;
        bookingSent = true;
        sentReferences.push(booking.reference);
        smsSentReferences.push(booking.reference);
      }

      const shouldSendEmail =
        emailEnabled &&
        "customerEmail" in booking &&
        Boolean(booking.customerEmail) &&
        "customerEmailReminderSentAt" in booking &&
        !booking.customerEmailReminderSentAt;

      if (shouldSendEmail && "customerEmail" in booking && booking.customerEmail) {
        const message = buildCustomerReminderEmail({
          booking: booking as ReminderBookingRow,
          bookingUrl,
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
            customerEmailReminderSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, booking.id));

        sent += 1;
        emailSent += 1;
        if (!bookingSent) {
          sentReferences.push(booking.reference);
        }
        emailSentReferences.push(booking.reference);
      }
    } catch (error) {
      failed += 1;
      failedReferences.push(booking.reference);
      console.error(`Reminder SMS failed for ${booking.reference}.`, error);
    }
  }

  return {
    scanned: dueBookings.length,
    sent,
    smsSent,
    emailSent,
    failed,
    skipped: dryRun ? dueBookings.length : dueBookings.length - sent - failed,
    candidates: dueBookings.map((booking) => booking.reference),
    sentReferences,
    failedReferences,
    skippedReferences,
    smsSentReferences,
    emailSentReferences,
    leadHours: env.twilioReminderLeadHours,
    dryRun,
  };
}
