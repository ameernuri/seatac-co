import { asc, count, eq, isNull, or } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import {
  bookings,
  chauffeurs,
  routes,
  siteSettings,
  sites,
  users,
  vehicleSiteAvailabilityRules,
  vehicleSiteAssignments,
  vehicleUnits,
  vehicles,
} from "@/db/schema";
import { defaultDispatchRules } from "@/lib/dispatch-rules";
import { env } from "@/env";
import {
  seededSiteData,
  seededSites,
} from "@/lib/seed-data";

async function upsertSites() {
  for (const site of seededSites) {
    const existing = await db.query.sites.findFirst({
      where: eq(sites.slug, site.slug),
    });

    if (existing) {
      await db
        .update(sites)
        .set({
          name: site.name,
          domain: site.domain,
          themeKey: site.themeKey,
          active: true,
          updatedAt: new Date(),
        })
        .where(eq(sites.id, existing.id));
      continue;
    }

    await db.insert(sites).values(site);
  }
}

async function getSiteId(slug: keyof typeof seededSiteData) {
  const site = await db.query.sites.findFirst({
    where: eq(sites.slug, slug),
  });

  if (!site) {
    throw new Error(`Missing seeded site: ${slug}`);
  }

  return site.id;
}

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60 * 1000);
}

function buildUnitLabel(name: string, index: number) {
  return `${name} ${String(index).padStart(2, "0")}`;
}

async function ensureVehicleAssignment(vehicleId: string, siteId: string) {
  const existing = await db.query.vehicleSiteAssignments.findFirst({
    where: (assignment, { and, eq }) =>
      and(eq(assignment.vehicleId, vehicleId), eq(assignment.siteId, siteId)),
  });

  if (existing) {
    return existing.id;
  }

  const [created] = await db
    .insert(vehicleSiteAssignments)
    .values({ vehicleId, siteId })
    .returning({ id: vehicleSiteAssignments.id });

  return created.id;
}

async function ensureChauffeursForSite(slug: keyof typeof seededSiteData) {
  const siteId = await getSiteId(slug);

  for (const chauffeur of seededSiteData[slug].chauffeurs) {
    const existing = await db.query.chauffeurs.findFirst({
      where: (currentChauffeur, { and, eq }) =>
        and(
          eq(currentChauffeur.siteId, siteId),
          eq(currentChauffeur.name, chauffeur.name),
        ),
    });

    if (existing) {
      await db
        .update(chauffeurs)
        .set({
          active: true,
          color: chauffeur.color,
          displayOrder: chauffeur.displayOrder,
          phone: chauffeur.phone,
          updatedAt: new Date(),
        })
        .where(eq(chauffeurs.id, existing.id));
      continue;
    }

    await db.insert(chauffeurs).values({
      siteId,
      name: chauffeur.name,
      phone: chauffeur.phone,
      color: chauffeur.color,
      displayOrder: chauffeur.displayOrder,
      active: true,
    });
  }
}

async function ensureVehicleUnits(vehicleId: string, name: string, quantity: number) {
  const existingUnits = await db
    .select()
    .from(vehicleUnits)
    .where(eq(vehicleUnits.vehicleId, vehicleId))
    .orderBy(asc(vehicleUnits.label));

  if (existingUnits.length >= quantity) {
    return existingUnits;
  }

  const nextUnits = [];

  for (let index = existingUnits.length + 1; index <= quantity; index += 1) {
    nextUnits.push({
      vehicleId,
      label: buildUnitLabel(name, index),
      active: true,
    });
  }

  if (nextUnits.length > 0) {
    await db.insert(vehicleUnits).values(nextUnits);
  }

  return db
    .select()
    .from(vehicleUnits)
    .where(eq(vehicleUnits.vehicleId, vehicleId))
    .orderBy(asc(vehicleUnits.label));
}

async function ensureVehicleAvailabilityRules(params: {
  endTime: string;
  startTime: string;
  vehicleSiteAssignmentId: string;
}) {
  const existingRules = await db
    .select()
    .from(vehicleSiteAvailabilityRules)
    .where(
      eq(
        vehicleSiteAvailabilityRules.vehicleSiteAssignmentId,
        params.vehicleSiteAssignmentId,
      ),
    )
    .orderBy(asc(vehicleSiteAvailabilityRules.dayOfWeek));

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
    const existingRule = existingRules.find((rule) => rule.dayOfWeek === dayOfWeek);

    if (existingRule) {
      await db
        .update(vehicleSiteAvailabilityRules)
        .set({
          dayOfWeek,
          enabled: true,
          endTime: params.endTime,
          startTime: params.startTime,
          updatedAt: new Date(),
        })
        .where(eq(vehicleSiteAvailabilityRules.id, existingRule.id));
      continue;
    }

    await db.insert(vehicleSiteAvailabilityRules).values({
      dayOfWeek,
      enabled: true,
      endTime: params.endTime,
      startTime: params.startTime,
      vehicleSiteAssignmentId: params.vehicleSiteAssignmentId,
    });
  }
}

async function upsertSettingsForSite(slug: keyof typeof seededSiteData) {
  const siteId = await getSiteId(slug);
  const entries = Object.entries(seededSiteData[slug].settings);

  for (const [key, value] of entries) {
    const existing = await db.query.siteSettings.findFirst({
      where: (setting, { and, eq }) =>
        and(eq(setting.siteId, siteId), eq(setting.key, key)),
    });

    if (existing) {
      await db
        .update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing.id));
      continue;
    }

    await db.insert(siteSettings).values({ siteId, key, value });
  }
}

async function ensureVehiclesForSite(slug: keyof typeof seededSiteData) {
  const siteId = await getSiteId(slug);

  for (const vehicle of seededSiteData[slug].vehicles) {
    const existing = await db.query.vehicles.findFirst({
      where: (currentVehicle, { and, eq }) =>
        and(eq(currentVehicle.siteId, siteId), eq(currentVehicle.slug, vehicle.slug)),
    });

    let vehicleId = existing?.id;

    if (existing) {
      await db
        .update(vehicles)
        .set({
          name: vehicle.name,
          summary: vehicle.summary,
          passengersMin: vehicle.passengersMin,
          passengersMax: vehicle.passengersMax,
          bagsMin: vehicle.bagsMin,
          bagsMax: vehicle.bagsMax,
          quantity: vehicle.quantity,
          basePrice: vehicle.basePrice,
          perMileRate: vehicle.perMileRate,
          hourlyRate: vehicle.hourlyRate,
          image: vehicle.image,
          displayOrder: vehicle.displayOrder,
          active: true,
          updatedAt: new Date(),
        })
        .where(eq(vehicles.id, existing.id));
    } else {
      const [created] = await db
        .insert(vehicles)
        .values({
          siteId,
          slug: vehicle.slug,
          name: vehicle.name,
          summary: vehicle.summary,
          passengersMin: vehicle.passengersMin,
          passengersMax: vehicle.passengersMax,
          bagsMin: vehicle.bagsMin,
          bagsMax: vehicle.bagsMax,
          quantity: vehicle.quantity,
          basePrice: vehicle.basePrice,
          perMileRate: vehicle.perMileRate,
          hourlyRate: vehicle.hourlyRate,
          image: vehicle.image,
          displayOrder: vehicle.displayOrder,
          active: true,
        })
        .returning({ id: vehicles.id });

      vehicleId = created.id;
    }

    if (!vehicleId) {
      throw new Error(`Could not resolve vehicle for ${slug}:${vehicle.slug}`);
    }

    const siteAssignments =
      ("siteAssignments" in vehicle ? vehicle.siteAssignments : undefined) ?? [slug];

    for (const assignmentSlug of siteAssignments) {
      const assignmentSiteId = await getSiteId(assignmentSlug);
      const assignmentId = await ensureVehicleAssignment(vehicleId, assignmentSiteId);
      const assignmentSettings = seededSiteData[assignmentSlug].settings.bookingConstraints;

      await ensureVehicleAvailabilityRules({
        endTime: assignmentSettings.operatingHoursEnd,
        startTime: assignmentSettings.operatingHoursStart,
        vehicleSiteAssignmentId: assignmentId,
      });
    }

    await ensureVehicleUnits(vehicleId, vehicle.name, vehicle.quantity);
  }
}

async function ensureRoutesForSite(slug: keyof typeof seededSiteData) {
  const siteId = await getSiteId(slug);
  const [{ value }] = await db
    .select({ value: count() })
    .from(routes)
    .where(eq(routes.siteId, siteId));

  if (Number(value) > 0) {
    return;
  }

  await db
    .insert(routes)
    .values(seededSiteData[slug].routes.map((route) => ({ siteId, ...route })));
}

async function ensureAdmin() {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, env.adminEmail),
  });

  if (existing) {
    return;
  }

  await auth.api.signUpEmail({
    body: {
      email: env.adminEmail,
      password: env.adminPassword,
      name: env.adminName,
    },
  });
}

async function backfillBookings() {
  const rows = await db
    .select()
    .from(bookings)
    .where(or(isNull(bookings.vehicleUnitId), isNull(bookings.serviceEndAt)))
    .orderBy(asc(bookings.pickupAt));

  for (const booking of rows) {
    const units = await db
      .select()
      .from(vehicleUnits)
      .where(eq(vehicleUnits.vehicleId, booking.vehicleId))
      .orderBy(asc(vehicleUnits.label));

    if (units.length === 0) {
      continue;
    }

    const pricing =
      booking.pricing && typeof booking.pricing === "object"
        ? (booking.pricing as { routeDurationMinutes?: number | null })
        : {};
    const baseDurationMinutes =
      booking.tripType === "hourly" || booking.tripType === "event"
        ? Math.max((booking.hoursRequested ?? 2) * 60, 120)
        : Math.max(
            pricing.routeDurationMinutes ?? defaultDispatchRules.defaultRouteDurationMinutes,
            15,
          );
    const serviceEndAt =
      booking.serviceEndAt ??
      (booking.returnAt
        ? addMinutes(new Date(booking.returnAt), baseDurationMinutes)
        : addMinutes(new Date(booking.pickupAt), baseDurationMinutes));
    const assignedUnit =
      units.find((unit) => unit.id === booking.vehicleUnitId) ?? units[0];

    await db
      .update(bookings)
      .set({
        vehicleUnitId: assignedUnit.id,
        vehicleUnitLabel: assignedUnit.label,
        serviceEndAt,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));
  }

  const allBookings = await db
    .select()
    .from(bookings)
    .orderBy(asc(bookings.pickupAt), asc(bookings.reference));
  const chauffeursBySite = new Map<
    string,
    Array<{
      id: string;
      name: string;
    }>
  >();

  for (const [index, booking] of allBookings.entries()) {
    if (booking.chauffeurId && booking.chauffeurName) {
      continue;
    }

    if (!chauffeursBySite.has(booking.siteId)) {
      const siteChauffeurs = await db
        .select()
        .from(chauffeurs)
        .where(eq(chauffeurs.siteId, booking.siteId))
        .orderBy(asc(chauffeurs.displayOrder), asc(chauffeurs.name));
      chauffeursBySite.set(booking.siteId, siteChauffeurs);
    }

    const siteChauffeurs = chauffeursBySite.get(booking.siteId) ?? [];

    if (siteChauffeurs.length === 0) {
      continue;
    }

    const chauffeur = siteChauffeurs[index % siteChauffeurs.length];

    await db
      .update(bookings)
      .set({
        chauffeurId: chauffeur.id,
        chauffeurName: chauffeur.name,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, booking.id));
  }
}

async function main() {
  await upsertSites();
  await ensureChauffeursForSite("pierlimo");
  await ensureVehiclesForSite("pierlimo");
  await ensureRoutesForSite("pierlimo");
  await upsertSettingsForSite("pierlimo");
  await ensureChauffeursForSite("seatacdrive");
  await ensureVehiclesForSite("seatacdrive");
  await ensureRoutesForSite("seatacdrive");
  await upsertSettingsForSite("seatacdrive");
  await ensureAdmin();
  await backfillBookings();
  console.log("Platform seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
