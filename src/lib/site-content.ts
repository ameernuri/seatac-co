import { getSiteThemeContent } from "@/lib/theme";

import { publicSiteSlug } from "@/lib/public-env";

const siteContent = getSiteThemeContent(publicSiteSlug);

export const serviceCards = siteContent.serviceCards;
export const fleetNotes = siteContent.fleetNotes;
export const coverageAreas = siteContent.coverageAreas;
export const homepageMetrics = siteContent.homepageMetrics;
export const extrasCatalog = siteContent.extrasCatalog;
export const siteChrome = {
  brandName: siteContent.brandName,
  brandMark: siteContent.brandMark,
  topbarText: siteContent.topbarText,
  reservationPhoneLabel: siteContent.reservationPhoneLabel,
  reservationPhoneHref: siteContent.reservationPhoneHref,
  navLinks: siteContent.navLinks,
  footer: siteContent.footer,
};
