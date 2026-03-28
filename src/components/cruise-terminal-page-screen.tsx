import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCruiseLineGuideByName } from "@/lib/cruise-lines";
import { getCruiseTerminalGuide } from "@/lib/cruise-terminals";
import { getActiveHotels, getActiveRoutes, getActiveVehicles } from "@/lib/data";
import { env } from "@/env";
import { formatCurrency } from "@/lib/format";
import { deriveHotelReservationDefaults } from "@/lib/hotels";
import {
  deriveHotelPriceSnapshot,
  deriveRoutePriceSnapshot,
  deriveRouteReservationDefaults,
  getHotelReserveHref,
  getRouteReserveHref,
} from "@/lib/route-booking";

type CruiseTerminalPageScreenProps = {
  slug: string;
};

export async function CruiseTerminalPageScreen({
  slug,
}: CruiseTerminalPageScreenProps) {
  const guide = getCruiseTerminalGuide(slug);

  if (!guide) {
    notFound();
  }

  const [routes, vehicles, hotels] = await Promise.all([
    getActiveRoutes(env.siteSlug),
    getActiveVehicles(env.siteSlug),
    getActiveHotels(env.siteSlug),
  ]);

  const airportRoute = routes.find((route) => route.slug === guide.airportRouteSlug) ?? null;
  const returnRoute = routes.find((route) => route.slug === guide.returnRouteSlug) ?? null;

  const airportSnapshot = airportRoute
    ? deriveRoutePriceSnapshot(airportRoute, vehicles, deriveRouteReservationDefaults(airportRoute))
    : null;
  const returnSnapshot = returnRoute
    ? deriveRoutePriceSnapshot(returnRoute, vehicles, deriveRouteReservationDefaults(returnRoute))
    : null;

  const hotelCards = guide.hotelSlugs
    .map((hotelSlug) => hotels.find((hotel) => hotel.slug === hotelSlug) ?? null)
    .filter((hotel): hotel is NonNullable<typeof hotel> => Boolean(hotel))
    .map((hotel) => {
      const route = routes.find((entry) => entry.slug === hotel.airportRouteSlug) ?? null;
      const snapshot = deriveHotelPriceSnapshot(
        hotel,
        route,
        vehicles,
        deriveHotelReservationDefaults(hotel, route),
      );

      if (!snapshot || !route) {
        return null;
      }

      return {
        slug: hotel.slug,
        name: hotel.name,
        neighborhood: hotel.neighborhood,
        hotelHref: `/seatac-to/${hotel.slug}`,
        reserveHref: getHotelReserveHref(route.slug, hotel.slug),
        snapshot,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <div className="max-w-5xl">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
              {guide.eyebrow}
            </p>
            <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
              {guide.heroTitle}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">{guide.heroBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={getRouteReserveHref(guide.airportRouteSlug)} className="button-link primary">
                Reserve cruise transfer
              </Link>
              <Link href={guide.airportRouteHref} className="button-link secondary">
                Route details
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {guide.facts.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-5 py-5"
            >
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#5a7a6e]">{item.label}</p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#123b33]">
                {item.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Terminal overview</p>
            <div className="mt-5 grid gap-4">
              <article className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <h2 className="text-[1.25rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  Where it is
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{guide.locationSummary}</p>
                <p className="mt-3 text-sm font-medium text-[#123b33]">{guide.terminalAddress}</p>
              </article>
              <article className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <h2 className="text-[1.25rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  Best use
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{guide.routeContext}</p>
              </article>
              <article className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <h2 className="text-[1.25rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  Cruise lines at this terminal
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.cruiseLines.map((line) => (
                    <Link
                      key={line}
                      href={`/cruise-lines/${getCruiseLineGuideByName(line)?.slug ?? ""}`}
                      className="rounded-full border border-[#2d6a4f]/10 bg-white px-3 py-1.5 text-xs text-[#2d6a4f] transition hover:border-[#2d6a4f]/20 hover:bg-[#f1f7f3]"
                    >
                      {line}
                    </Link>
                  ))}
                </div>
              </article>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">What to know</p>
            <div className="mt-5 grid gap-4">
              {guide.guidance.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
                >
                  <h2 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Airport transfer routes</p>
          <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
            Compare the airport ride in both directions.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {airportRoute && airportSnapshot ? (
              <article className="rounded-[1.6rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                      {airportRoute.name}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-[#5a7a6e]">{airportRoute.destination}</p>
                  </div>
                  <p className="text-lg font-semibold text-[#123b33]">
                    {formatCurrency(airportSnapshot.fare)}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Distance</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {airportSnapshot.distanceMiles.toFixed(0)} mi
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Drive time</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {airportSnapshot.durationMinutes} min
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Per person</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {formatCurrency(airportSnapshot.perPerson)}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={getRouteReserveHref(airportRoute.slug)} className="button-link primary">
                    Reserve from Sea-Tac
                  </Link>
                  <Link href={guide.airportRouteHref} className="button-link secondary">
                    Route page
                  </Link>
                </div>
              </article>
            ) : null}

            {returnRoute && returnSnapshot ? (
              <article className="rounded-[1.6rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                      {returnRoute.name}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-[#5a7a6e]">{returnRoute.destination}</p>
                  </div>
                  <p className="text-lg font-semibold text-[#123b33]">
                    {formatCurrency(returnSnapshot.fare)}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Distance</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {returnSnapshot.distanceMiles.toFixed(0)} mi
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Drive time</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {returnSnapshot.durationMinutes} min
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Per person</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {formatCurrency(returnSnapshot.perPerson)}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={getRouteReserveHref(returnRoute.slug)} className="button-link primary">
                    Reserve to Sea-Tac
                  </Link>
                  <Link href={guide.returnRouteHref} className="button-link secondary">
                    Airport departures guide
                  </Link>
                </div>
              </article>
            ) : null}
          </div>
        </section>

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Nearby hotel pages</p>
          <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
            Hotels travelers use before or after cruise day.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {hotelCards.map((card) => (
              <article
                key={card.slug}
                className="rounded-[1.6rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
              >
                <h3 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  {card.name}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#5a7a6e]">{card.neighborhood}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#5a7a6e]">
                  <span>{formatCurrency(card.snapshot.fare)}</span>
                  <span>•</span>
                  <span>{card.snapshot.durationMinutes} min</span>
                  <span>•</span>
                  <span>{card.snapshot.distanceMiles.toFixed(1)} mi</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={card.reserveHref} className="button-link primary">
                    Reserve hotel transfer
                  </Link>
                  <Link href={card.hotelHref} className="button-link secondary">
                    Hotel page
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Useful pages</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {guide.usefulLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3 text-sm font-medium text-[#123b33] transition hover:border-[#2d6a4f]/20 hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
