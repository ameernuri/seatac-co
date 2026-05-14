import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getActiveRoutes, getActiveVehicles, getHotelBySlug, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import {
  EXTRAS_CATALOG_KEY,
  getDefaultExtrasCatalog,
  getEnabledExtrasCatalog,
} from "@/lib/extras-catalog";
import {
  parseReserveUrlState,
  summarizeReserveLocations,
} from "@/lib/reserve-url-state";
import { deriveHotelReservationDefaults, getHotelRouteName } from "@/lib/hotels";
import {
  deriveRouteReservationDefaults,
  getRouteReserveHref,
} from "@/lib/route-booking";

export const dynamic = "force-dynamic";

type ReserveRoutePageProps = {
  params: Promise<{
    routeSlug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadRoute(routeSlug: string, hotelSlug?: string) {
  const [vehicles, routes, settings] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
  ]);
  const route = routes.find((entry) => entry.slug === routeSlug) ?? null;
  const hotelCandidate = hotelSlug ? await getHotelBySlug(hotelSlug, env.siteSlug) : null;
  const hotel =
    hotelCandidate && hotelCandidate.airportRouteSlug === routeSlug ? hotelCandidate : null;

  return { hotel, route, routes, settings, vehicles };
}

export async function generateMetadata({
  params,
  searchParams,
}: ReserveRoutePageProps): Promise<Metadata> {
  const { routeSlug } = await params;
  const rawSearchParams = await searchParams;
  const hotelSlug =
    typeof rawSearchParams.hotel === "string" ? rawSearchParams.hotel : undefined;
  const { hotel, route } = await loadRoute(routeSlug, hotelSlug);
  const { from, to } = summarizeReserveLocations(
    parseReserveUrlState(rawSearchParams),
  );

  if (!route) {
    return {
      title: "Reserve a Sea-Tac transfer | seatac.co",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title:
      from && to
        ? `Reserve ${from} to ${to} | seatac.co`
        : hotel
          ? `Reserve ${getHotelRouteName(hotel)} | seatac.co`
          : `Reserve ${route.name} | seatac.co`,
    description:
      from && to
        ? `Book ${from} to ${to} with route facts, live vehicle options, and an online reservation form.`
        : hotel
          ? `Book ${getHotelRouteName(hotel)} with route facts, hotel timing, and an online reservation form.`
          : `Book ${route.name} with route facts, clear pricing details, and an online reservation form.`,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: getRouteReserveHref(route.slug),
    },
  };
}

export default async function ReserveRoutePage({ params, searchParams }: ReserveRoutePageProps) {
  const { routeSlug } = await params;
  const rawSearchParams = await searchParams;
  const hotelSlug =
    typeof rawSearchParams.hotel === "string" ? rawSearchParams.hotel : undefined;
  const { hotel, route, routes, settings, vehicles } = await loadRoute(routeSlug, hotelSlug);

  if (!route) {
    notFound();
  }

  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);
  const extrasCatalog = getEnabledExtrasCatalog(
    settings[EXTRAS_CATALOG_KEY],
    getDefaultExtrasCatalog(env.siteSlug),
  );
  const initialState = {
    ...(hotel
      ? deriveHotelReservationDefaults(hotel, route)
      : deriveRouteReservationDefaults(route)),
    ...parseReserveUrlState(rawSearchParams),
    routeSlug: route.slug,
  };
  const title = hotel ? getHotelRouteName(hotel) : route.name;

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="mb-6 max-w-4xl">
          <h1 className="font-display text-4xl leading-[0.94] text-[#1a3d34] md:text-5xl">
            Reserve {title}
          </h1>
        </div>

        <ReserveWizard
          showTitle={false}
          startStep={1}
          minStep={1}
          allowFlatRate={initialState.tripType === "flat"}
          bookingConstraints={bookingConstraints}
          extrasCatalog={extrasCatalog}
          vehicles={vehicles}
          routes={routes}
          initialState={initialState}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
