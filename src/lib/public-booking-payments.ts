import { and, eq, or } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";

import { db } from "@/db/client";
import { bookings, siteSettings, sites } from "@/db/schema";
import { env } from "@/env";
import { formatBookingReference } from "@/lib/booking-display";
import { EXTRAS_CATALOG_KEY, getEnabledExtrasCatalog } from "@/lib/extras-catalog";

const BOOKING_PAYMENT_TOKEN_PURPOSE = "booking-payment";
const BOOKING_PAYMENT_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 180;

const publicPaymentBookingColumns = {
  bags: bookings.bags,
  createdAt: bookings.createdAt,
  customerEmail: bookings.customerEmail,
  customerName: bookings.customerName,
  customerPhone: bookings.customerPhone,
  dropoffAddress: bookings.dropoffAddress,
  dropoffLabel: bookings.dropoffLabel,
  extras: bookings.extras,
  id: bookings.id,
  passengers: bookings.passengers,
  paymentCheckoutSessionId: bookings.paymentCheckoutSessionId,
  paymentIntentId: bookings.paymentIntentId,
  paymentMethod: bookings.paymentMethod,
  paymentStatus: bookings.paymentStatus,
  pickupAddress: bookings.pickupAddress,
  pickupAt: bookings.pickupAt,
  pickupLabel: bookings.pickupLabel,
  pricing: bookings.pricing,
  reference: bookings.reference,
  returnAt: bookings.returnAt,
  routeName: bookings.routeName,
  serviceMode: bookings.serviceMode,
  siteId: bookings.siteId,
  specialInstructions: bookings.specialInstructions,
  status: bookings.status,
  subtotalCents: bookings.subtotalCents,
  totalCents: bookings.totalCents,
  tripType: bookings.tripType,
  vehicleName: bookings.vehicleName,
} satisfies Record<string, unknown>;

type PublicPaymentTokenClaims = {
  bookingId: string;
  bookingReference: string;
  purpose: typeof BOOKING_PAYMENT_TOKEN_PURPOSE;
};

export class PublicBookingPaymentAccessError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PublicBookingPaymentAccessError";
    this.status = status;
  }
}

function getSigningKey() {
  return new TextEncoder().encode(env.betterAuthSecret);
}

function normalizeReference(reference: string) {
  return reference.trim();
}

function getReferenceCandidates(reference: string) {
  const normalized = normalizeReference(reference);
  const candidates = new Set([normalized]);

  if (/^SC-/i.test(normalized)) {
    candidates.add(normalized.replace(/^SC-/i, "PL-"));
  }

  if (/^PL-/i.test(normalized)) {
    candidates.add(normalized.replace(/^PL-/i, "SC-"));
  }

  return [...candidates];
}

export async function createPublicBookingPaymentToken({
  bookingId,
  bookingReference,
}: {
  bookingId: string;
  bookingReference: string;
}) {
  return new SignJWT({
    bookingId,
    bookingReference: normalizeReference(bookingReference),
    purpose: BOOKING_PAYMENT_TOKEN_PURPOSE,
  } satisfies PublicPaymentTokenClaims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${BOOKING_PAYMENT_TOKEN_TTL_SECONDS}s`)
    .sign(getSigningKey());
}

export async function verifyPublicBookingPaymentToken({
  bookingId,
  bookingReference,
  token,
}: {
  bookingId: string;
  bookingReference: string;
  token: string;
}) {
  const verified = await jwtVerify(token, getSigningKey(), {
    algorithms: ["HS256"],
  });

  const claims = verified.payload as Partial<PublicPaymentTokenClaims>;
  const referenceCandidates = getReferenceCandidates(bookingReference).map((value) =>
    value.toUpperCase(),
  );
  const claimedReference = normalizeReference(String(claims.bookingReference ?? "")).toUpperCase();

  if (
    claims.purpose !== BOOKING_PAYMENT_TOKEN_PURPOSE ||
    claims.bookingId !== bookingId ||
    !referenceCandidates.includes(claimedReference)
  ) {
    throw new PublicBookingPaymentAccessError(
      "This payment summary link is invalid or expired.",
      401,
    );
  }

  return claims as PublicPaymentTokenClaims;
}

export async function getPublicBookingPaymentUrl({
  appUrl = env.appUrl,
  bookingId,
  bookingReference,
}: {
  appUrl?: string;
  bookingId: string;
  bookingReference: string;
}) {
  void bookingId;
  return `${appUrl.replace(/\/$/, "")}/pay/${encodeURIComponent(formatBookingReference(bookingReference))}`;
}

export async function getPublicBookingPaymentDetail({
  reference,
  token,
}: {
  reference: string;
  token?: string | null;
}) {
  const referenceCandidates = getReferenceCandidates(reference);
  const [booking] = await db
    .select(publicPaymentBookingColumns)
    .from(bookings)
    .where(
      referenceCandidates.length === 1
        ? eq(bookings.reference, referenceCandidates[0]!)
        : or(...referenceCandidates.map((candidate) => eq(bookings.reference, candidate))),
    )
    .limit(1);

  if (!booking) {
    throw new PublicBookingPaymentAccessError("This booking could not be found.", 404);
  }

  if (token) {
    await verifyPublicBookingPaymentToken({
      bookingId: booking.id,
      bookingReference: booking.reference,
      token,
    });
  }

  const [site] = await db
    .select({
      domain: sites.domain,
      name: sites.name,
      slug: sites.slug,
    })
    .from(sites)
    .where(eq(sites.id, booking.siteId))
    .limit(1);

  if (!site) {
    throw new PublicBookingPaymentAccessError("This booking site could not be found.", 404);
  }

  const [extrasCatalogRow] = await db
    .select({
      value: siteSettings.value,
    })
    .from(siteSettings)
    .where(
      and(
        eq(siteSettings.siteId, booking.siteId),
        eq(siteSettings.key, EXTRAS_CATALOG_KEY),
      ),
    )
    .limit(1);

  return {
    booking,
    extrasCatalog: getEnabledExtrasCatalog(extrasCatalogRow?.value),
    site,
  };
}
