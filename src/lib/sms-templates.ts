import { bookings } from "@/db/schema";

type BookingRecord = typeof bookings.$inferSelect;

function formatPickupAt(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  }).format(value);
}

export function buildCustomerBookingConfirmationSms({
  booking,
  siteName,
}: {
  booking: BookingRecord;
  siteName: string;
}) {
  return [
    `${siteName}: your booking ${booking.reference} is confirmed.`,
    `Pickup ${formatPickupAt(booking.pickupAt)}.`,
    booking.routeName ? `Route: ${booking.routeName}.` : null,
    booking.vehicleName ? `Vehicle: ${booking.vehicleName}.` : null,
    "Reply STOP to opt out, HELP for help.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildDispatchBookingAlertSms({
  booking,
  siteName,
}: {
  booking: BookingRecord;
  siteName: string;
}) {
  return [
    `${siteName}: new paid booking ${booking.reference}.`,
    `${booking.customerName} ${booking.customerPhone}.`,
    `Pickup ${formatPickupAt(booking.pickupAt)}.`,
    booking.routeName ? `${booking.routeName}.` : null,
    booking.vehicleName ? `${booking.vehicleName}.` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildCustomerReminderSms({
  booking,
  siteName,
}: {
  booking: BookingRecord;
  siteName: string;
}) {
  return [
    `${siteName} reminder: booking ${booking.reference} is coming up.`,
    `Pickup ${formatPickupAt(booking.pickupAt)}.`,
    booking.routeName ? `Route: ${booking.routeName}.` : null,
    "Reply STOP to opt out, HELP for help.",
  ]
    .filter(Boolean)
    .join(" ");
}
