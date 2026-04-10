import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAirlineGuideBySlug, getAirlineGuideSlugs } from "@/lib/airlines";
import { getActiveHotels, getActiveRoutes, getActiveVehicles } from "@/lib/data";
import { env } from "@/env";
import { formatCurrency } from "@/lib/format";
import { deriveHotelReservationDefaults, getHotelAreaGuideHref, getHotelAreaLabel } from "@/lib/hotels";
import { getHotelStaySnapshot } from "@/lib/hotel-stays";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeatacMetadata } from "@/lib/seo";
import {
  deriveHotelPriceSnapshot,
  deriveRoutePriceSnapshot,
  deriveRouteReservationDefaults,
  getHotelReserveHref,
  getRouteReserveHref,
} from "@/lib/route-booking";

export const dynamicParams = false;

type AirlineGuidePageProps = {
  params: Promise<{
    airlineSlug: string;
  }>;
};

export async function generateStaticParams() {
  return getAirlineGuideSlugs().map((airlineSlug) => ({ airlineSlug }));
}

export async function generateMetadata({
  params,
}: AirlineGuidePageProps): Promise<Metadata> {
  const { airlineSlug } = await params;
  const airline = getAirlineGuideBySlug(airlineSlug);

  if (!airline) {
    return buildSeatacMetadata({
      title: "Sea-Tac airline guide | seatac.co",
      description: "Sea-Tac airline guide",
      path: "/airlines",
      index: false,
    });
  }

  return buildSeatacMetadata({
    title: `${airline.title} | seatac.co`,
    description: airline.description,
    path: `/airlines/${airline.slug}`,
  });
}

export default async function AirlineGuidePage({ params }: AirlineGuidePageProps) {
  const { airlineSlug } = await params;
  const airline = getAirlineGuideBySlug(airlineSlug);

  if (!airline) {
    notFound();
  }

  const [routes, vehicles, hotels] = await Promise.all([
    getActiveRoutes(env.siteSlug),
    getActiveVehicles(env.siteSlug),
    getActiveHotels(env.siteSlug),
  ]);

  const routeCards = [
    ...airline.routeSlugs,
  ]
    .map((slug) => routes.find((route) => route.slug === slug) ?? null)
    .filter((route): route is NonNullable<typeof route> => Boolean(route))
    .map((route) => ({
      route,
      snapshot: deriveRoutePriceSnapshot(route, vehicles, deriveRouteReservationDefaults(route)),
    }))
    .filter((entry) => entry.snapshot);

  const hotelCards = hotels
    .filter((hotel) => airline.hotelSlugs.includes(hotel.slug))
    .map((hotel) => {
      const route = routes.find((entry) => entry.slug === hotel.airportRouteSlug) ?? null;
      const snapshot = deriveHotelPriceSnapshot(
        hotel,
        route,
        vehicles,
        deriveHotelReservationDefaults(hotel, route),
      );
      const staySnapshot = getHotelStaySnapshot(hotel);

      return route && snapshot ? { hotel, route, snapshot, staySnapshot } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const hotelGuideLinks = Array.from(
    new Map(
      hotelCards.map(({ hotel }) => [
        hotel.area,
        {
          href: getHotelAreaGuideHref(hotel.area),
          label: `${getHotelAreaLabel(hotel.area)} hotels`,
        },
      ]),
    ).values(),
  );

  const faqs = airline.faq ?? [
    {
      question: `What terminal or concourse does ${airline.name} use at Sea-Tac?`,
      answer: `${airline.name} usually works from ${airline.concourse}. Gate assignments can shift at Sea-Tac, so use this as a planning baseline before pickup day.`,
    },
    {
      question: `How should I plan pickup after a ${airline.name} arrival at Sea-Tac?`,
      answer: `${airline.pickupNotes} This guide links directly into the airport routes, hotel pages, and reserve URLs travelers usually need after a ${airline.name} arrival at Sea-Tac.`,
    },
    {
      question: `Can I compare airport rides and hotel transfers after flying ${airline.name} into Sea-Tac?`,
      answer: `Yes. This ${airline.name} at Sea-Tac guide links the main airport rides, hotel transfer pages, airline lookup path, and direct reserve URLs for common post-flight routes.`,
    },
  ];

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "seatac.co", path: "/" },
            { name: "Airline guides", path: "/airlines" },
            { name: airline.name, path: `/airlines/${airline.slug}` },
          ])}
        />
        <JsonLd data={buildFaqJsonLd(faqs)} />
        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <div className="max-w-4xl">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
              Airline guide
            </p>
            <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
              {airline.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">
              {airline.description}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#45675d]">
              Use this page when you need to check {airline.name} terminal patterns at Sea-Tac, baggage-claim pickup timing, airport rides, and hotel transfer options before you land or depart.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-2 text-sm text-[#2d6a4f]">
                {airline.code}
              </span>
              <span className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-2 text-sm text-[#2d6a4f]">
                {airline.concourse}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
            Airline-specific FAQ
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
              >
                <h2 className="text-[1.1rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  {faq.question}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
              Sea-Tac notes
            </p>
            <div className="mt-5 space-y-5">
              <div className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <h2 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  Typical concourse
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{airline.concourse}</p>
              </div>
              {airline.checkInNotes ? (
                <div className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                  <h2 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                    Check-in context
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{airline.checkInNotes}</p>
                </div>
              ) : null}
              {airline.baggageNotes ? (
                <div className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                  <h2 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                    Baggage notes
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{airline.baggageNotes}</p>
                </div>
              ) : null}
              <div className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <h2 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  Pickup timing
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{airline.pickupNotes}</p>
              </div>
              {airline.airportUpgradeNotes ? (
                <div className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                  <h2 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                    Airport upgrade notes
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{airline.airportUpgradeNotes}</p>
                </div>
              ) : null}
              <div className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <h2 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  Best fit
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {airline.bestFor.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#2d6a4f]/10 bg-white px-3 py-1.5 text-xs text-[#2d6a4f]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
              Quick lookup
            </p>
            <h2 className="mt-3 text-[1.8rem] leading-[1.04] tracking-[-0.03em] text-[#1a3d34]">
              Search a specific {airline.name} flight.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5a7a6e]">
              Use the flight lookup to compare transfer routes and hotel pages around a specific
              arrival or departure.
            </p>
            <div className="mt-5">
              <Link href={`/flight?q=${airline.code}`} className="button-link primary">
                Open {airline.name} lookup
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/arrivals" className="button-link secondary">
                Arrivals guide
              </Link>
              <Link href="/departures" className="button-link secondary">
                Departures guide
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
            Transfer options
          </p>
          <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
            Common rides after you land.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {routeCards.map(({ route, snapshot }) => (
              <article
                key={route.slug}
                className="rounded-[1.6rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
              >
                <h3 className="text-[1.25rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  {route.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{route.destination}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#5a7a6e]">
                  <span>{formatCurrency(snapshot!.fare)}</span>
                  <span>•</span>
                  <span>{snapshot!.durationMinutes} min</span>
                  <span>•</span>
                  <span>{snapshot!.distanceMiles.toFixed(0)} mi</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={getRouteReserveHref(route.slug)} className="button-link primary">
                    Reserve
                  </Link>
                  <Link href="/flight" className="button-link secondary">
                    Flight lookup
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
            Hotel pages
          </p>
          <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
            Hotels travelers often check before pickup.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {hotelCards.map(({ hotel, route, snapshot, staySnapshot }) => (
              <article
                key={hotel.slug}
                className="rounded-[1.6rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
              >
                <h3 className="text-[1.25rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                  {hotel.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{hotel.neighborhood}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#5a7a6e]">
                  <span>{formatCurrency(snapshot.fare)}</span>
                  <span>•</span>
                  <span>{snapshot.durationMinutes} min</span>
                  <span>•</span>
                  <span>{snapshot.distanceMiles.toFixed(1)} mi</span>
                </div>
                <p className="mt-3 text-sm text-[#5a7a6e]">Typical nightly rate: {staySnapshot.nightlyRateLabel}</p>
                <p className="mt-2 text-sm text-[#5a7a6e]">{staySnapshot.styleLabel}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={getHotelReserveHref(route.slug, hotel.slug)} className="button-link primary">
                    Reserve
                  </Link>
                  <Link href={`/seatac-to/${hotel.slug}`} className="button-link secondary">
                    Hotel page
                  </Link>
                  <Link href={getHotelAreaGuideHref(hotel.area)} className="button-link secondary">
                    Area guide
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {hotelGuideLinks.length ? (
          <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
              Hotel clusters
            </p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              Where travelers on this airline usually stay next.
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {hotelGuideLinks.map((link) => (
                <Link key={link.href} href={link.href} className="button-link secondary">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
            Useful next steps
          </p>
          <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
            More pages travelers open around this airline.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {airline.relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[1.4rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-5 py-5 text-sm font-semibold text-[#123b33] transition hover:border-[#2d6a4f]/20 hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        {airline.sourceLinks?.length ? (
          <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
              Official sources
            </p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              Verify airline and airport details before travel.
            </h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {airline.sourceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-[1.4rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-5 py-5 text-sm font-semibold text-[#123b33] transition hover:border-[#2d6a4f]/20 hover:bg-white"
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
