import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getActiveHotels, getActiveRoutes, getActiveVehicles } from "@/lib/data";
import { env } from "@/env";
import { formatCurrency } from "@/lib/format";
import { deriveHotelReservationDefaults } from "@/lib/hotels";
import {
  getAirlineGuideByCode,
  getAirlineGuideHref,
} from "@/lib/airlines";
import { getAirportUtilityPage } from "@/lib/airport-utilities";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo";
import {
  deriveHotelPriceSnapshot,
  deriveRoutePriceSnapshot,
  deriveRouteReservationDefaults,
  getHotelReserveHref,
  getRouteReserveHref,
} from "@/lib/route-booking";

type AirportUtilityPageScreenProps = {
  slug: "arrivals" | "departures";
};

const routeDetailHrefBySlug: Record<string, string> = {
  "seatac-downtown-core": "/seatac-to-downtown-seattle",
  "seatac-bellevue-core": "/seatac-to-bellevue",
  "seatac-kirkland-core": "/seatac-to-kirkland",
  "seatac-pier-66": "/seatac-to-pier-66",
  "seatac-pier-91": "/seatac-to-pier-91",
  "downtown-seatac-core": "/seatac-to-downtown-seattle-hotels",
  "bellevue-seatac-core": "/seatac-to-bellevue-hotels",
  "kirkland-seatac-core": "/seatac-to-kirkland",
  "pier-66-seatac": "/seatac-to-pier-66",
  "pier-91-seatac": "/seatac-to-pier-91",
};

export async function AirportUtilityPageScreen({
  slug,
}: AirportUtilityPageScreenProps) {
  const page = getAirportUtilityPage(slug);

  if (!page) {
    notFound();
  }

  const [routes, vehicles, hotels] = await Promise.all([
    getActiveRoutes(env.siteSlug),
    getActiveVehicles(env.siteSlug),
    getActiveHotels(env.siteSlug),
  ]);

  const routeCards = page.routeSlugs
    .map((routeSlug) => routes.find((route) => route.slug === routeSlug) ?? null)
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
    .filter((card): card is NonNullable<typeof card> => Boolean(card));

  const hotelCards = page.hotelSlugs
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
    .filter((card): card is NonNullable<typeof card> => Boolean(card));

  const matchedAirlines = page.airlineCodes
    .map((code) => getAirlineGuideByCode(code))
    .filter((airline): airline is NonNullable<typeof airline> => Boolean(airline));

  const fareValues = [...routeCards.map((card) => card.snapshot.fare), ...hotelCards.map((card) => card.snapshot.fare)];
  const durationValues = [
    ...routeCards.map((card) => card.snapshot.durationMinutes),
    ...hotelCards.map((card) => card.snapshot.durationMinutes),
  ];
  const distanceValues = [
    ...routeCards.map((card) => card.snapshot.distanceMiles),
    ...hotelCards.map((card) => card.snapshot.distanceMiles),
  ];

  const summaryCards = [
    {
      label: "Starting fare",
      value: fareValues.length ? formatCurrency(Math.min(...fareValues)) : "Check route",
    },
    {
      label: "Drive time",
      value: durationValues.length
        ? `${Math.min(...durationValues)}-${Math.max(...durationValues)} min`
        : "Varies by route",
    },
    {
      label: "Route distance",
      value: distanceValues.length
        ? `${Math.min(...distanceValues).toFixed(0)}-${Math.max(...distanceValues).toFixed(0)} mi`
        : "Varies by route",
    },
    {
      label: "Airline guides",
      value: `${matchedAirlines.length}`,
    },
  ];

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "seatac.co", path: "/" },
            { name: page.slug === "arrivals" ? "Sea-Tac arrivals" : "Sea-Tac departures", path: `/${page.slug}` },
          ])}
        />
        <JsonLd data={buildFaqJsonLd(page.faqs)} />
        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <div className="max-w-4xl">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
              {page.eyebrow}
            </p>
            <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
              {page.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">{page.heroBody}</p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#45675d]">{page.seoIntro}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={page.primaryCta.href} className="button-link primary">
                {page.primaryCta.label}
              </Link>
              <Link href={page.secondaryCta.href} className="button-link secondary">
                {page.secondaryCta.label}
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {summaryCards.map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-5 py-5"
            >
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#5a7a6e]">{item.label}</p>
              <p className="mt-3 text-[1.8rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                {item.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">What matters most</p>
            <div className="mt-5 grid gap-4">
              {page.guidance.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
                >
                  <h2 className="text-[1.25rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Airline guides</p>
            <div className="mt-5 grid gap-3">
              {matchedAirlines.map((airline) => (
                <Link
                  key={airline.slug}
                  href={getAirlineGuideHref(airline.slug)}
                  className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-4 transition hover:border-[#2d6a4f]/20 hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#123b33]">{airline.name}</p>
                      <p className="mt-1 text-sm text-[#5a7a6e]">{airline.concourse}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.22em] text-[#5a7a6e]">{airline.code}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Common questions</p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {page.faqs.map((faq) => (
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

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Airport ride options</p>
          <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
            Compare the main Sea-Tac transfer routes.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {routeCards.map((card) => (
              <article
                key={card.slug}
                className="rounded-[1.6rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                      {card.name}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-[#5a7a6e]">{card.destination}</p>
                  </div>
                  <p className="text-lg font-semibold text-[#123b33]">
                    {formatCurrency(card.snapshot.fare)}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Distance</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {card.snapshot.distanceMiles.toFixed(0)} mi
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Drive time</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {card.snapshot.durationMinutes} min
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Per person</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {formatCurrency(card.snapshot.perPerson)}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
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
        </section>

        <section className="mt-10 rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Hotel transfer pages</p>
          <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
            Hotels travelers check most around Sea-Tac.
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {hotelCards.map((card) => (
              <article
                key={card.slug}
                className="rounded-[1.6rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[1.3rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                      {card.name}
                    </h3>
                    <p className="mt-1 text-sm leading-7 text-[#5a7a6e]">{card.neighborhood}</p>
                  </div>
                  <p className="text-lg font-semibold text-[#123b33]">
                    {formatCurrency(card.snapshot.fare)}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Distance</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {card.snapshot.distanceMiles.toFixed(1)} mi
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Drive time</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {card.snapshot.durationMinutes} min
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#2d6a4f]/10 bg-white px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Per person</p>
                    <p className="mt-1 text-base font-semibold text-[#123b33]">
                      {formatCurrency(card.snapshot.perPerson)}
                    </p>
                  </div>
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
            {page.usefulLinks.map((link) => (
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
      </main>
      <SiteFooter />
    </div>
  );
}
