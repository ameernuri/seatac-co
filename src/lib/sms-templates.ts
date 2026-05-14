import { bookings } from "@/db/schema";

type BookingRecord = typeof bookings.$inferSelect;

function formatPickupAt(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  }).format(value);
}

function formatPartySummary(booking: BookingRecord) {
  return `${booking.passengers} pax · ${booking.bags} bag${booking.bags === 1 ? "" : "s"}`;
}

export function buildCustomerBookingConfirmationSms({
  booking,
  bookingUrl,
  siteName,
}: {
  booking: BookingRecord;
  bookingUrl?: string | null;
  siteName: string;
}) {
  return [
    `${siteName}: your booking ${booking.reference} is confirmed.`,
    `Pickup ${formatPickupAt(booking.pickupAt)}.`,
    booking.routeName ? `Route: ${booking.routeName}.` : null,
    booking.vehicleName ? `Vehicle: ${booking.vehicleName}.` : null,
    bookingUrl ? `Manage booking: ${bookingUrl}` : null,
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
  bookingUrl,
  siteName,
}: {
  booking: BookingRecord;
  bookingUrl?: string | null;
  siteName: string;
}) {
  return [
    `${siteName} reminder: booking ${booking.reference} is coming up.`,
    `Pickup ${formatPickupAt(booking.pickupAt)}.`,
    booking.routeName ? `Route: ${booking.routeName}.` : null,
    bookingUrl ? `Manage booking: ${bookingUrl}` : null,
    "Reply STOP to opt out, HELP for help.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildCustomerPaymentRequestSms({
  booking,
  summaryUrl,
  siteName,
}: {
  booking: BookingRecord;
  summaryUrl: string;
  siteName: string;
}) {
  return [
    `${siteName}: payment request for booking ${booking.reference}.`,
    `Pickup ${formatPickupAt(booking.pickupAt)}.`,
    `From ${booking.pickupAddress}.`,
    booking.dropoffAddress ? `To ${booking.dropoffAddress}.` : null,
    booking.returnAt ? `Return ${formatPickupAt(booking.returnAt)}.` : null,
    booking.routeName ? `Trip: ${booking.routeName}.` : null,
    booking.vehicleName ? `Vehicle: ${booking.vehicleName}.` : null,
    `Party: ${formatPartySummary(booking)}.`,
    `Amount due: ${booking.totalCents ? `$${(booking.totalCents / 100).toFixed(2)}` : ""}`,
    `Review and pay: ${summaryUrl}`,
    "Reply STOP to opt out, HELP for help.",
  ]
    .filter(Boolean)
    .join(" ");
}
