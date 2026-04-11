import { ReserveWizard } from "@/components/reserve-wizard";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import { getRoutePage } from "@/lib/route-pages";
import { getRouteReserveHref } from "@/lib/route-booking";

import { RouteLandingPage } from "./route-landing-page";

export async function RoutePageScreen({ slug }: { slug: string }) {
  const page = getRoutePage(slug);
  const [vehicles, routes, settings] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
  ]);
  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);

  return (
    <RouteLandingPage
      page={page}
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
          showTitle={false}
          startStep={1}
          minStep={1}
          allowFlatRate={page.reservationDefaults?.tripType === "flat"}
          initialState={page.reservationDefaults}
        />
      }
    />
  );
}
