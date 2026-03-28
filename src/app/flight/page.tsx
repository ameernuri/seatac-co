import type { Metadata } from "next";
import Link from "next/link";

import { getFlightStatus } from "@/lib/amadeus";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAirlineGuideByCode, getAirlineGuideHref } from "@/lib/airlines";
import { getActiveHotels, getActiveRoutes, getActiveVehicles } from "@/lib/data";
import { env } from "@/env";
import { getFlightExamples, parseFlightQuery } from "@/lib/flights";
import { formatCurrency } from "@/lib/format";
import { deriveHotelReservationDefaults } from "@/lib/hotels";
import { getHotelStaySnapshot } from "@/lib/hotel-stays";
import {
  deriveHotelPriceSnapshot,
  deriveRoutePriceSnapshot,
  deriveRouteReservationDefaults,
  getHotelReserveHref,
  getRouteReserveHref,
} from "@/lib/route-booking";

export const dynamic = "force-dynamic";

type FlightPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

const routeDetailHrefBySlug: Record<string, string> = {
  "seatac-downtown-core": "/seatac-to-downtown-seattle",
  "seatac-bellevue-core": "/seatac-to-bellevue",
  "seatac-kirkland-core": "/seatac-to-kirkland",
  "seatac-pier-66": "/seatac-to-pier-66",
  "seatac-pier-91": "/seatac-to-pier-91",
  "seatac-airport-hotels-core": "/seatac-airport-hotels",
};

type FlightRouteCard = {
  slug: string;
  name: string;
  destination: string;
  reserveHref: string;
  detailHref: string;
  snapshot: {
    fare: number;
    perPerson: number;
    riders: number;
    distanceMiles: number;
    durationMinutes: number;
    vehicleName: string;
  };
};

type FlightHotelCard = {
  slug: string;
  name: string;
  neighborhood: string;
  hotelHref: string;
  reserveHref: string;
  nightlyRateLabel: string;
  snapshot: {
    fare: number;
    perPerson: number;
    riders: number;
    distanceMiles: number;
    durationMinutes: number;
  };
};

export async function generateMetadata({ searchParams }: FlightPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const parsed = parseFlightQuery(q);

  return {
    title: parsed ? `${parsed.displayName} airport planning | seatac.co` : "Flight lookup | seatac.co",
    description: parsed
      ? `Compare Sea-Tac transfer options, hotel pages, and reserve links for ${parsed.displayName}.`
      : "Search a flight number or airline to compare Sea-Tac transfer options, hotel pages, and reserve links.",
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: "/flight",
    },
  };
}

export default async function FlightPage({ searchParams }: FlightPageProps) {
  const { q } = await searchParams;
  const parsed = parseFlightQuery(q);
  const airlineGuide = getAirlineGuideByCode(parsed?.airlineCode);
  const [routes, vehicles, hotels, flightStatus] = await Promise.all([
    getActiveRoutes(env.siteSlug),
    getActiveVehicles(env.siteSlug),
    getActiveHotels(env.siteSlug),
    getFlightStatus({
      carrierCode: parsed?.airlineCode,
      flightNumber: parsed?.flightNumber,
    }),
  ]);

  const routeCards: FlightRouteCard[] = [
    "seatac-downtown-core",
    "seatac-bellevue-core",
    "seatac-airport-hotels-core",
    "seatac-pier-66",
    "seatac-pier-91",
  ]
    .map((slug) => routes.find((route) => route.slug === slug) ?? null)
    .filter((route): route is NonNullable<typeof route> => Boolean(route))
    .map((route) => {
      const snapshot = deriveRoutePriceSnapshot(route, vehicles, deriveRouteReservationDefaults(route));

      if (!snapshot) {
        return null;
      }

      return {
        slug: route.slug,
        name: route.name,
        destination: route.destination,
        reserveHref: getRouteReserveHref(route.slug),
        detailHref: routeDetailHrefBySlug[route.slug] ?? "/reserve",
        snapshot,
      };
    })
    .filter((card): card is FlightRouteCard => Boolean(card));

  const hotelCards: FlightHotelCard[] = hotels
    .filter((hotel) =>
      [
        "coast-gateway-hotel",
        "cedarbrook-lodge",
        "grand-hyatt-seattle",
        "hyatt-regency-bellevue",
      ].includes(hotel.slug),
    )
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
        nightlyRateLabel: getHotelStaySnapshot(hotel).nightlyRateLabel,
        snapshot,
      };
    })
    .filter((hotel): hotel is FlightHotelCard => Boolean(hotel));

  const planningLinks = [
    { href: "/airlines", label: "Sea-Tac airline guides" },
    { href: "/arrivals", label: "Sea-Tac arrivals guide" },
    { href: "/departures", label: "Sea-Tac departures guide" },
    { href: "/bell-street-cruise-terminal-pier-66", label: "Pier 66 cruise terminal guide" },
    { href: "/smith-cove-cruise-terminal-pier-91", label: "Pier 91 cruise terminal guide" },
    { href: "/seatac-airport-hotels", label: "Sea-Tac airport hotels" },
    { href: "/seatac-airport-overnight-hotels", label: "Airport overnight hotels" },
    { href: "/seatac-to-cruise-pre-stay-hotels", label: "Cruise pre-stay hotels" },
    { href: "/seatac-to-downtown-seattle-hotels", label: "Downtown Seattle hotel transfers" },
    { href: "/seatac-to-bellevue-hotels", label: "Bellevue hotel transfers" },
  ];

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <div className="max-w-4xl">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
              Flight planning
            </p>
            <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
              {parsed ? `Planning for ${parsed.displayName}` : "Search a flight or airline at Sea-Tac."}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">
              Use this page to compare airport ride options, nearby hotel pages, and direct reserve
              links before you land or head back to Sea-Tac.
            </p>
          </div>

          <form className="mt-8 grid gap-3 rounded-[1.8rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                Flight number or airline
              </span>
              <input
                type="text"
                name="q"
                defaultValue={q ?? ""}
                placeholder="DL117 or Alaska Airlines"
                className="h-14 rounded-[1.1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center rounded-[1.1rem] border border-[#2d6a4f]/20 bg-[#2d6a4f] px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(45,106,79,0.18)] transition hover:bg-[#24563f]"
              >
                Search flight
              </button>
            </div>
          </form>

          {!parsed ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {getFlightExamples().map((example) => (
                <Link
                  key={example}
                  href={`/flight?q=${encodeURIComponent(example)}`}
                  className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-2 text-sm text-[#2d6a4f]"
                >
                  {example}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-2 text-sm text-[#2d6a4f]">
                {parsed.airline ? parsed.airline.name : "Flight query"}
              </span>
              {parsed.flightNumber ? (
                <span className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-2 text-sm text-[#2d6a4f]">
                  Flight {parsed.flightNumber}
                </span>
              ) : null}
              <span className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-2 text-sm text-[#2d6a4f]">
                Sea-Tac Airport
              </span>
              {airlineGuide ? (
                <Link
                  href={getAirlineGuideHref(airlineGuide.slug)}
                  className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-2 text-sm text-[#2d6a4f]"
                >
                  {airlineGuide.name} guide
                </Link>
              ) : null}
            </div>
          )}
        </section>

        {parsed?.isSpecificFlight && flightStatus ? (
          <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Live flight status</p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              Latest schedule details for {parsed.displayName}.
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Route</p>
                <p className="mt-2 text-base font-semibold text-[#123b33]">
                  {flightStatus.departureAirportCode ?? "Origin"} to {flightStatus.arrivalAirportCode ?? "Destination"}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Departure</p>
                <p className="mt-2 text-base font-semibold text-[#123b33]">
                  {flightStatus.estimatedDepartureTime ?? flightStatus.scheduledDepartureTime ?? "Pending"}
                </p>
                {flightStatus.departureTerminal || flightStatus.departureGate ? (
                  <p className="mt-1 text-sm text-[#5a7a6e]">
                    {flightStatus.departureTerminal ? `Terminal ${flightStatus.departureTerminal}` : ""}
                    {flightStatus.departureTerminal && flightStatus.departureGate ? " • " : ""}
                    {flightStatus.departureGate ? `Gate ${flightStatus.departureGate}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Arrival</p>
                <p className="mt-2 text-base font-semibold text-[#123b33]">
                  {flightStatus.estimatedArrivalTime ?? flightStatus.scheduledArrivalTime ?? "Pending"}
                </p>
                {flightStatus.arrivalTerminal || flightStatus.arrivalGate ? (
                  <p className="mt-1 text-sm text-[#5a7a6e]">
                    {flightStatus.arrivalTerminal ? `Terminal ${flightStatus.arrivalTerminal}` : ""}
                    {flightStatus.arrivalTerminal && flightStatus.arrivalGate ? " • " : ""}
                    {flightStatus.arrivalGate ? `Gate ${flightStatus.arrivalGate}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Scheduled day</p>
                <p className="mt-2 text-base font-semibold text-[#123b33]">
                  {flightStatus.scheduledDepartureDate}
                </p>
                {flightStatus.scheduledDuration ? (
                  <p className="mt-1 text-sm text-[#5a7a6e]">{flightStatus.scheduledDuration}</p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <div className="mb-6">
              <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
                Transfer options
              </p>
              <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
                Popular rides from Sea-Tac after you land.
              </h2>
            </div>
            <div className="grid gap-4">
              {routeCards.map((card) => (
                <article
                  key={card.slug}
                  className="rounded-[1.6rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                        {card.name}
                      </h3>
                      <p className="mt-1 text-sm leading-7 text-[#5a7a6e]">
                        {card.destination}
                      </p>
                    </div>
                    <p className="text-xl font-semibold text-[#123b33]">
                      {formatCurrency(card.snapshot.fare)}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                        Distance
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#123b33]">
                        {card.snapshot.distanceMiles.toFixed(0)} mi
                      </p>
                    </div>
                    <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                        Drive time
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#123b33]">
                        {card.snapshot.durationMinutes} min
                      </p>
                    </div>
                    <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                        Per person
                      </p>
                      <p className="mt-1 text-base font-semibold text-[#123b33]">
                        {formatCurrency(card.snapshot.perPerson)} at {card.snapshot.riders}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href={card.reserveHref} className="button-link primary">
                      Reserve this route
                    </Link>
                    <Link href={card.detailHref} className="button-link secondary">
                      Route details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)]">
              <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
                Hotel options
              </p>
              <h2 className="mt-3 text-[1.8rem] leading-[1.04] tracking-[-0.03em] text-[#1a3d34]">
                Nearby hotel pages and reserve links.
              </h2>
              <div className="mt-5 space-y-4">
                {hotelCards.map((hotel) => (
                  <article key={hotel.slug} className="rounded-[1.4rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-4">
                    <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-[#123b33]">{hotel.name}</h3>
                        <p className="mt-1 text-sm text-[#5a7a6e]">{hotel.neighborhood}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#123b33]">
                        {formatCurrency(hotel.snapshot.fare)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-[#5a7a6e]">
                      <span>{hotel.snapshot.distanceMiles.toFixed(1)} mi</span>
                      <span>•</span>
                      <span>{hotel.snapshot.durationMinutes} min</span>
                    </div>
                    <p className="mt-3 text-sm text-[#5a7a6e]">
                      Typical nightly rate: {hotel.nightlyRateLabel}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={hotel.reserveHref} className="button-link primary">
                        Reserve hotel transfer
                      </Link>
                      <Link href={hotel.hotelHref} className="button-link secondary">
                        Hotel page
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)]">
              <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
                Airport day tips
              </p>
              <div className="mt-4 space-y-4 text-sm leading-7 text-[#5a7a6e]">
                <p>Domestic arrivals usually need 20 to 30 minutes from touchdown to curbside pickup.</p>
                <p>International arrivals usually need 45 to 60 minutes for immigration, baggage, and pickup timing.</p>
                <p>Checked bags, cruise luggage, and downtown traffic can all change the best pickup window.</p>
              </div>
            </section>

            {airlineGuide ? (
              <section className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)]">
                <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
                  Airline guide
                </p>
                <h2 className="mt-3 text-[1.8rem] leading-[1.04] tracking-[-0.03em] text-[#1a3d34]">
                  {airlineGuide.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#5a7a6e]">
                  {airlineGuide.concourse}. {airlineGuide.pickupNotes}
                </p>
                <div className="mt-5">
                  <Link href={getAirlineGuideHref(airlineGuide.slug)} className="button-link secondary">
                    Open airline guide
                  </Link>
                </div>
              </section>
            ) : null}

            <section className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)]">
              <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
                Useful pages
              </p>
              <div className="mt-4 grid gap-3">
                {planningLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3 text-sm font-medium text-[#123b33] transition hover:border-[#2d6a4f]/20 hover:bg-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
