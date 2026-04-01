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
  deriveHotelFacts,
  deriveRouteFacts,
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
  const routeFacts = hotel
    ? deriveHotelFacts(hotel, route, vehicles, initialState) ?? []
    : deriveRouteFacts(route, vehicles, initialState) ?? [];
  const title = hotel ? getHotelRouteName(hotel) : route.name;
  const description = hotel
    ? `Reserve your ride from Sea-Tac Airport to ${hotel.name}. Review the route facts, then confirm the trip online.`
    : `Reserve your ride from ${route.origin} to ${route.destination}. Review the route facts, then confirm the trip online.`;

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-18">
        <div className="mb-10 max-w-5xl">
          <p className="font-sans text-[0.76rem] uppercase tracking-[0.36em] text-primary/80">
            Route reservation
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-[3.6rem] leading-[0.92] text-foreground md:text-[5rem]">
            Reserve <span className="text-primary">{title}</span>
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-9 text-muted-foreground">{description}</p>
        </div>

        {routeFacts.length > 0 ? (
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            {routeFacts.map((item) => (
              <article
                key={item.label}
                className="rounded-[1.4rem] border border-primary/12 bg-[color:var(--card)] px-5 py-4 shadow-[0_8px_28px_rgba(45,106,79,0.08)]"
              >
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-foreground">
                  {item.value}
                </p>
              </article>
            ))}
          </div>
        ) : null}

        <ReserveWizard
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
