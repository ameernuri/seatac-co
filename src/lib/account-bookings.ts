import { eq, or } from "drizzle-orm";

import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { normalizeClientPhone } from "@/lib/client-phone";
import { getClientAccountSnapshot } from "@/lib/client-auth";

type BookingRow = typeof bookings.$inferSelect;

async function getBookingAccessIdentity(userId: string) {
  const account = await getClientAccountSnapshot(userId).catch(() => null);

  const verifiedEmails = new Set<string>();
  const phoneVariants = new Set<string>();
  const normalizedVerifiedPhones = new Set<string>();

  if (account?.emailVerified && account.email) {
    verifiedEmails.add(account.email.trim().toLowerCase());
  }

  if (account?.phoneVerifiedAt && account.phone) {
    phoneVariants.add(account.phone);
    const normalized = normalizeClientPhone(account.phone);
    if (normalized) {
      phoneVariants.add(normalized);
      normalizedVerifiedPhones.add(normalized);
    }
  }

  return {
    userId,
    verifiedEmails: [...verifiedEmails],
    phoneVariants: [...phoneVariants],
    normalizedVerifiedPhones,
  };
}

function bookingMatchesAccess(
  booking: BookingRow,
  access: Awaited<ReturnType<typeof getBookingAccessIdentity>>,
) {
  if (booking.customerUserId === access.userId) {
    return true;
  }

  const bookingEmail = booking.customerEmail.trim().toLowerCase();
  if (access.verifiedEmails.includes(bookingEmail)) {
    return true;
  }

  const normalizedBookingPhone = normalizeClientPhone(booking.customerPhone);
  if (normalizedBookingPhone && access.normalizedVerifiedPhones.has(normalizedBookingPhone)) {
    return true;
  }

  return access.phoneVariants.includes(booking.customerPhone);
}

async function getAccessibleBookings(userId: string) {
  const access = await getBookingAccessIdentity(userId);
  const predicates = [eq(bookings.customerUserId, userId)];

  for (const email of access.verifiedEmails) {
    predicates.push(eq(bookings.customerEmail, email));
  }

  for (const phone of access.phoneVariants) {
    predicates.push(eq(bookings.customerPhone, phone));
  }

  const rows = await db
    .select()
    .from(bookings)
    .where(predicates.length === 1 ? predicates[0] : or(...predicates));

  return rows.filter((booking) => bookingMatchesAccess(booking, access));
}

export async function getBookingsForUser(userId: string) {
  const now = new Date();
  const accessible = await getAccessibleBookings(userId);
  const upcoming = accessible
    .filter((booking) => booking.pickupAt >= now)
    .sort((a, b) => a.pickupAt.getTime() - b.pickupAt.getTime());

  const past = accessible
    .filter((booking) => booking.pickupAt < now)
    .sort((a, b) => b.pickupAt.getTime() - a.pickupAt.getTime());

  return { upcoming, past };
}

export async function getBookingForUser(userId: string, reference: string) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.reference, reference))
    .limit(1);

  if (!booking) {
    return null;
  }

  const access = await getBookingAccessIdentity(userId);
  return bookingMatchesAccess(booking, access) ? booking : null;
}

export function getBookingManageUrl(reference: string, appUrl: string) {
  return `${appUrl.replace(/\/$/, "")}/account/bookings/${encodeURIComponent(reference)}`;
}
