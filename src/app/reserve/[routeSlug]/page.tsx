import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getActiveRoutes, getActiveVehicles, getHotelBySlug, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
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
  searchParams: Promise<{
    hotel?: string;
  }>;
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
  const { hotel: hotelSlug } = await searchParams;
  const { hotel, route } = await loadRoute(routeSlug, hotelSlug);

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
    title: hotel ? `Reserve ${getHotelRouteName(hotel)} | seatac.co` : `Reserve ${route.name} | seatac.co`,
    description: hotel
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
  const { hotel: hotelSlug } = await searchParams;
  const { hotel, route, routes, settings, vehicles } = await loadRoute(routeSlug, hotelSlug);

  if (!route) {
    notFound();
  }

  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);
  const initialState = hotel
    ? deriveHotelReservationDefaults(hotel, route)
    : deriveRouteReservationDefaults(route);
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
          routeLocked
          lockedPricingType={initialState.tripType === "flat" ? "flat" : undefined}
          allowFlatRate={initialState.tripType === "flat"}
          bookingConstraints={bookingConstraints}
          vehicles={vehicles}
          routes={routes}
          initialState={initialState}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
