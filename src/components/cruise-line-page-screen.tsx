import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCruiseLineGuide } from "@/lib/cruise-lines";
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

export async function CruiseLinePageScreen({ slug }: { slug: string }) {
  const guide = getCruiseLineGuide(slug);

  if (!guide) {
    notFound();
  }

  const terminal = getCruiseTerminalGuide(guide.terminalSlug);

  if (!terminal) {
    notFound();
  }

  const [routes, vehicles, hotels] = await Promise.all([
    getActiveRoutes(env.siteSlug),
    getActiveVehicles(env.siteSlug),
    getActiveHotels(env.siteSlug),
  ]);

  const route = routes.find((entry) => entry.slug === guide.airportRouteSlug) ?? null;
  const routeSnapshot = route
    ? deriveRoutePriceSnapshot(route, vehicles, deriveRouteReservationDefaults(route))
    : null;

  const hotelCards = guide.hotelSlugs
    .map((hotelSlug) => hotels.find((hotel) => hotel.slug === hotelSlug) ?? null)
    .filter((hotel): hotel is NonNullable<typeof hotel> => Boolean(hotel))
    .map((hotel) => {
      const hotelRoute = routes.find((entry) => entry.slug === hotel.airportRouteSlug) ?? null;
      const snapshot = deriveHotelPriceSnapshot(
        hotel,
        hotelRoute,
        vehicles,
        deriveHotelReservationDefaults(hotel, hotelRoute),
      );

      if (!snapshot || !hotelRoute) {
        return null;
      }

      return {
        slug: hotel.slug,
        name: hotel.name,
        neighborhood: hotel.neighborhood,
        reserveHref: getHotelReserveHref(hotelRoute.slug, hotel.slug),
        hotelHref: `/seatac-to/${hotel.slug}`,
        snapshot,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <div className="max-w-5xl">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Cruise line guide</p>
            <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
              {guide.name} Seattle terminal and transfer guide.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">
              Use this page to see which Seattle terminal {guide.name} uses, compare Sea-Tac transfer pricing,
              and jump into the right terminal or hotel page before cruise day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={guide.terminalGuideHref} className="button-link primary">
                Open terminal guide
              </Link>
              {route ? (
                <Link href={getRouteReserveHref(route.slug)} className="button-link secondary">
                  Reserve this route
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-5 py-5">
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#5a7a6e]">Seattle terminal</p>
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#123b33]">{guide.terminalName}</p>
          </article>
          {routeSnapshot ? (
            <>
              <article className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-5 py-5">
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#5a7a6e]">Starting fare</p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#123b33]">
                  {formatCurrency(routeSnapshot.fare)}
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-5 py-5">
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#5a7a6e]">Drive time</p>
                <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-[#123b33]">
                  {routeSnapshot.durationMinutes} min
                </p>
              </article>
            </>
          ) : null}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Terminal mapping</p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              {guide.name} uses {guide.terminalName}.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5a7a6e]">
              This page maps {guide.name} to the correct Seattle cruise terminal so you can go straight
              into the airport route, nearby hotel pages, and the full terminal guide.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={guide.terminalGuideHref} className="button-link primary">
                Terminal guide
              </Link>
              <Link href={guide.airportRouteHref} className="button-link secondary">
                Route details
              </Link>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">What to focus on</p>
            <div className="mt-5 grid gap-4">
              {guide.notes.map((note) => (
                <article
                  key={note}
                  className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
                >
                  <p className="text-sm leading-7 text-[#5a7a6e]">{note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {route && routeSnapshot ? (
          <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Airport transfer</p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              Sea-Tac to {guide.terminalName} route facts.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Starting fare</p>
                <p className="mt-1 text-base font-semibold text-[#123b33]">{formatCurrency(routeSnapshot.fare)}</p>
              </div>
              <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Distance</p>
                <p className="mt-1 text-base font-semibold text-[#123b33]">{routeSnapshot.distanceMiles.toFixed(0)} mi</p>
              </div>
              <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Drive time</p>
                <p className="mt-1 text-base font-semibold text-[#123b33]">{routeSnapshot.durationMinutes} min</p>
              </div>
              <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Per person</p>
                <p className="mt-1 text-base font-semibold text-[#123b33]">{formatCurrency(routeSnapshot.perPerson)}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={getRouteReserveHref(route.slug)} className="button-link primary">
                Reserve this route
              </Link>
              <Link href={guide.terminalGuideHref} className="button-link secondary">
                Full terminal guide
              </Link>
            </div>
          </section>
        ) : null}

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Hotel pages</p>
          <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
            Hotels that pair well with this cruise terminal.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {hotelCards.map((card) => (
              <article
                key={card.slug}
                className="rounded-[1.6rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[#123b33]">{card.name}</h3>
                    <p className="mt-1 text-sm leading-7 text-[#5a7a6e]">{card.neighborhood}</p>
                  </div>
                  <p className="text-lg font-semibold text-[#123b33]">
                    {formatCurrency(card.snapshot.fare)}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#5a7a6e]">
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
      </main>
      <SiteFooter />
    </div>
  );
}
