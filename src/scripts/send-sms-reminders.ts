import { and, eq, gte, inArray, isNull, lte } from "drizzle-orm";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { env } from "@/env";
import { buildCustomerReminderSms } from "@/lib/sms-templates";
import { isSmsConfigured, sendTextMessage } from "@/lib/sms";

async function main() {
  if (!isSmsConfigured()) {
    console.log("Twilio SMS is not configured. Skipping reminders.");
    return;
  }

  const now = new Date();
  const reminderCutoff = new Date(now.getTime() + env.twilioReminderLeadHours * 60 * 60 * 1000);
  const upcomingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.customerSmsOptIn, true),
        isNull(bookings.customerSmsReminderSentAt),
        inArray(bookings.status, ["confirmed", "paid"]),
        inArray(bookings.paymentStatus, ["paid"]),
        gte(bookings.pickupAt, now),
        lte(bookings.pickupAt, reminderCutoff),
      ),
    );

  if (upcomingBookings.length === 0) {
    console.log("No booking reminders due.");
    return;
  }

  for (const booking of upcomingBookings) {
    const site = await db.query.sites.findFirst({
      where: (site, { eq }) => eq(site.id, booking.siteId),
    });
    const siteName = site?.name ?? "seatac.co";

    try {
      await sendTextMessage({
        body: buildCustomerReminderSms({ booking, siteName }),
        to: booking.customerPhone,
      });

      await db
        .update(bookings)
        .set({
          customerSmsReminderSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, booking.id));

      console.log(`Sent reminder for ${booking.reference}.`);
    } catch (error) {
      console.error(`Reminder SMS failed for ${booking.reference}.`, error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
