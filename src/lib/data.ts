import { and, asc, count, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  bookings,
  routes,
  siteSettings,
  vehicleSiteAssignments,
  vehicles,
} from "@/db/schema";
import { env } from "@/env";
import { getAllSites, getSiteBySlug } from "@/lib/sites";

async function resolveSite(slug?: string) {
  if (!slug) {
    return null;
  }

  return getSiteBySlug(slug);
}

export async function getActiveVehicles(siteSlug?: string) {
  const site = await resolveSite(siteSlug);

  if (!site) {
    return db
      .select()
      .from(vehicles)
      .where(eq(vehicles.active, true))
      .orderBy(asc(vehicles.displayOrder), asc(vehicles.name));
  }

  const rows = await db
    .select({ vehicle: vehicles })
    .from(vehicles)
    .innerJoin(
      vehicleSiteAssignments,
      eq(vehicleSiteAssignments.vehicleId, vehicles.id),
    )
    .where(
      and(
        eq(vehicles.active, true),
        eq(vehicleSiteAssignments.siteId, site.id),
      ),
    )
    .orderBy(asc(vehicles.displayOrder), asc(vehicles.name));

  return rows.map((row) => row.vehicle);
}

export async function getActiveRoutes(siteSlug?: string) {
  const site = await resolveSite(siteSlug);

  return db
    .select()
    .from(routes)
    .where(
      site
        ? and(eq(routes.active, true), eq(routes.siteId, site.id))
        : eq(routes.active, true),
    )
    .orderBy(asc(routes.mode), asc(routes.name));
}

export async function getDashboardStats(siteSlug?: string) {
  const site = await resolveSite(siteSlug);
  const [bookingCount] = await db
    .select({ value: count() })
    .from(bookings)
    .where(site ? eq(bookings.siteId, site.id) : undefined);
  const latest = await db
    .select()
    .from(bookings)
    .where(site ? eq(bookings.siteId, site.id) : undefined)
    .orderBy(desc(bookings.createdAt))
    .limit(5);
  const sites = await getAllSites();

  return {
    bookings: Number(bookingCount?.value ?? 0),
    latest,
    sites,
  };
}

export async function getAllBookings(siteSlug?: string) {
  const site = await resolveSite(siteSlug);

  return db
    .select()
    .from(bookings)
    .where(site ? eq(bookings.siteId, site.id) : undefined)
    .orderBy(desc(bookings.createdAt));
}

export async function getSettingsMap(siteSlug: string = env.siteSlug) {
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    return {};
  }

  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.siteId, site.id))
    .orderBy(asc(siteSettings.key));

  return rows.reduce<Record<string, unknown>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}

export async function getAllSettingsBySite() {
  const [allSites, rows] = await Promise.all([
    getAllSites(),
    db.select().from(siteSettings).orderBy(asc(siteSettings.key)),
  ]);

  const siteMap = new Map(allSites.map((site) => [site.id, site]));

  return rows.reduce<Record<string, Record<string, unknown>>>((acc, row) => {
    const site = siteMap.get(row.siteId);

    if (!site) {
      return acc;
    }

    acc[site.slug] ??= {};
    acc[site.slug][row.key] = row.value;
    return acc;
  }, {});
}
