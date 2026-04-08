import { bookings } from "@/db/schema";
import { centsToDollars, formatCurrency } from "@/lib/format";

type BookingRecord = typeof bookings.$inferSelect;

export type NotificationSiteContext = {
  companyName: string;
  dispatchEmail: string;
  dispatchPhone: string;
};

function formatPickupAt(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  }).format(value);
}

function baseSummaryRows(booking: BookingRecord) {
  return [
    ["Reference", booking.reference],
    ["Pickup", formatPickupAt(booking.pickupAt)],
    ["Route", booking.routeName ?? "Custom route"],
    ["Vehicle", booking.vehicleName],
    ["Passenger", booking.customerName],
    ["Phone", booking.customerPhone],
    ["Total", formatCurrency(centsToDollars(booking.totalCents))],
  ] as const;
}

function renderRows(rows: ReadonlyArray<readonly [string, string]>) {
  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #d7e4df;background:#f7fbf9;font-weight:600;color:#133a33;">${label}</td><td style="padding:8px 12px;border:1px solid #d7e4df;color:#17352f;">${value}</td></tr>`,
    )
    .join("");
}

export function buildCustomerBookingConfirmationEmail({
  booking,
  site,
}: {
  booking: BookingRecord;
  site: NotificationSiteContext;
}) {
  const rows = baseSummaryRows(booking);
  const subject = `${site.companyName}: booking ${booking.reference} confirmed`;
  const text = [
    `Your reservation with ${site.companyName} is confirmed.`,
    `Reference: ${booking.reference}`,
    `Pickup: ${formatPickupAt(booking.pickupAt)}`,
    `Route: ${booking.routeName ?? "Custom route"}`,
    `Vehicle: ${booking.vehicleName}`,
    `Total: ${formatCurrency(centsToDollars(booking.totalCents))}`,
    `Questions: ${site.dispatchPhone} or ${site.dispatchEmail}`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f2f7f5;padding:32px;color:#17352f;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d7e4df;border-radius:20px;overflow:hidden;">
        <div style="padding:28px 28px 20px;background:#0f6a56;color:#f6f2e8;">
          <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.85;">Reservation confirmed</div>
          <h1 style="margin:12px 0 0;font-size:32px;line-height:1.05;">Your ride is booked.</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">
            Thanks for booking with ${site.companyName}. Your reservation is confirmed and dispatch has your trip details.
          </p>
          <table style="width:100%;border-collapse:collapse;border-spacing:0;">
            ${renderRows(rows)}
          </table>
          <p style="margin:20px 0 0;font-size:15px;line-height:1.7;">
            If you need to update the trip, call <a href="tel:${site.dispatchPhone.replace(/\D/g, "")}" style="color:#0f6a56;">${site.dispatchPhone}</a>
            or email <a href="mailto:${site.dispatchEmail}" style="color:#0f6a56;">${site.dispatchEmail}</a>.
          </p>
        </div>
      </div>
    </div>
  `;

  return { html, subject, text };
}

export function buildDispatchBookingAlertEmail({
  booking,
  site,
}: {
  booking: BookingRecord;
  site: NotificationSiteContext;
}) {
  const rows = [
    ...baseSummaryRows(booking),
    ["Email", booking.customerEmail],
    [
      "Pickup address",
      booking.pickupAddress,
    ],
    [
      "Dropoff address",
      booking.dropoffAddress ?? "Open return / hourly service",
    ],
  ] as const;
  const subject = `${site.companyName}: new paid booking ${booking.reference}`;
  const text = [
    `${site.companyName} received a new paid booking.`,
    `Reference: ${booking.reference}`,
    `Customer: ${booking.customerName}`,
    `Phone: ${booking.customerPhone}`,
    `Email: ${booking.customerEmail}`,
    `Pickup: ${formatPickupAt(booking.pickupAt)}`,
    `Route: ${booking.routeName ?? "Custom route"}`,
    `Vehicle: ${booking.vehicleName}`,
    `Total: ${formatCurrency(centsToDollars(booking.totalCents))}`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f2f7f5;padding:32px;color:#17352f;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #d7e4df;border-radius:20px;overflow:hidden;">
        <div style="padding:24px 28px;background:#17352f;color:#f6f2e8;">
          <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.85;">Dispatch alert</div>
          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.1;">New paid booking ${booking.reference}</h1>
        </div>
        <div style="padding:28px;">
          <table style="width:100%;border-collapse:collapse;border-spacing:0;">
            ${renderRows(rows)}
          </table>
          ${
            booking.specialInstructions
              ? `<p style="margin:20px 0 0;font-size:15px;line-height:1.7;"><strong>Notes:</strong> ${booking.specialInstructions}</p>`
              : ""
          }
        </div>
      </div>
    </div>
  `;

  return { html, subject, text };
}

export function buildCustomerReminderEmail({
  booking,
  bookingUrl,
  site,
}: {
  booking: BookingRecord;
  bookingUrl?: string | null;
  site: NotificationSiteContext;
}) {
  const rows = [
    ["Reference", booking.reference],
    ["Pickup", formatPickupAt(booking.pickupAt)],
    ["Route", booking.routeName ?? "Custom route"],
    ["Vehicle", booking.vehicleName],
  ] as const;
  const subject = `${site.companyName}: booking ${booking.reference} reminder`;
  const text = [
    `${site.companyName} reminder: your trip is coming up.`,
    `Reference: ${booking.reference}`,
    `Pickup: ${formatPickupAt(booking.pickupAt)}`,
    `Route: ${booking.routeName ?? "Custom route"}`,
    `Vehicle: ${booking.vehicleName}`,
    bookingUrl ? `Manage booking: ${bookingUrl}` : null,
    `Questions: ${site.dispatchPhone} or ${site.dispatchEmail}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f2f7f5;padding:32px;color:#17352f;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d7e4df;border-radius:20px;overflow:hidden;">
        <div style="padding:28px 28px 20px;background:#0f6a56;color:#f6f2e8;">
          <div style="font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.85;">Pickup reminder</div>
          <h1 style="margin:12px 0 0;font-size:32px;line-height:1.05;">Your ride is coming up.</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">
            This is a reminder for your upcoming trip with ${site.companyName}.
          </p>
          <table style="width:100%;border-collapse:collapse;border-spacing:0;">
            ${renderRows(rows)}
          </table>
          ${
            bookingUrl
              ? `<p style="margin:20px 0 0;font-size:15px;line-height:1.7;">
                  Manage your booking here:
                  <a href="${bookingUrl}" style="color:#0f6a56;">${bookingUrl}</a>
                </p>`
              : ""
          }
          <p style="margin:20px 0 0;font-size:15px;line-height:1.7;">
            If you need help, call <a href="tel:${site.dispatchPhone.replace(/\D/g, "")}" style="color:#0f6a56;">${site.dispatchPhone}</a>
            or email <a href="mailto:${site.dispatchEmail}" style="color:#0f6a56;">${site.dispatchEmail}</a>.
          </p>
        </div>
      </div>
    </div>
  `;

  return { html, subject, text };
}
