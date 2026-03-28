import { ReserveWizard } from "@/components/reserve-wizard";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import { getRoutePage } from "@/lib/route-pages";
import { deriveRouteFacts, getRouteReserveHref } from "@/lib/route-booking";

import { RouteLandingPage } from "./route-landing-page";

export async function RoutePageScreen({ slug }: { slug: string }) {
  const page = getRoutePage(slug);
  const [vehicles, routes, settings] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
  ]);
  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);
  const resolvedRoute =
    page.reservationDefaults?.routeSlug
      ? routes.find((route) => route.slug === page.reservationDefaults?.routeSlug) ?? null
      : null;

  const routeFacts = deriveRouteFacts(resolvedRoute, vehicles, page.reservationDefaults);

  return (
    <RouteLandingPage
      page={page}
      facts={routeFacts}
      reserveHref={
        page.reservationDefaults?.routeSlug
          ? getRouteReserveHref(page.reservationDefaults.routeSlug)
          : undefined
      }
      reservationPanel={
        <ReserveWizard
          bookingConstraints={bookingConstraints}
          vehicles={vehicles}
          routes={routes}
          compact
          initialState={page.reservationDefaults}
        />
      }
    />
  );
}
