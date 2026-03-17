import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";
import {
  BOOKING_CONSTRAINTS_KEY,
  normalizeBookingConstraints,
} from "@/lib/booking-constraints";

export async function getBookingConstraintsBySiteId(siteId: string) {
  const row = await db.query.siteSettings.findFirst({
    where: and(
      eq(siteSettings.siteId, siteId),
      eq(siteSettings.key, BOOKING_CONSTRAINTS_KEY),
    ),
  });

  return normalizeBookingConstraints(row?.value);
}
