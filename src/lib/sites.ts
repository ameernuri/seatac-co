import { asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { sites } from "@/db/schema";
import { env } from "@/env";

export async function getSiteBySlug(slug: string) {
  return db.query.sites.findFirst({
    where: eq(sites.slug, slug),
  });
}

export async function getRequiredSite(slug: string) {
  const site = await getSiteBySlug(slug);

  if (!site) {
    throw new Error(`Site not found for slug: ${slug}`);
  }

  return site;
}

export async function getCurrentSite() {
  return getRequiredSite(env.siteSlug);
}

export async function getAllSites() {
  return db.select().from(sites).orderBy(asc(sites.name));
}
