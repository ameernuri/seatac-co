import Link from "next/link";
import { notFound } from "next/navigation";

import {
  HomeGradientMetricCard,
  HomeSurfaceNoteCard,
} from "@/components/home-gradient-cards";
import { JsonLd } from "@/components/json-ld";
import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getActiveHotels, getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import { getHotelClusterPage } from "@/lib/hotel-clusters";
import {
  deriveHotelReservationDefaults,
  getHotelAreaLabel,
} from "@/lib/hotels";
import { getHotelClusterStayRangeLabel, getHotelStaySnapshot } from "@/lib/hotel-stays";
import {
  deriveHotelPriceSnapshot,
  deriveRouteReservationDefaults,
  getHotelReserveHref,
  getRouteReserveHref,
} from "@/lib/route-booking";
import { formatCurrency } from "@/lib/format";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo";

type HotelClusterCard = {
  slug: string;
  name: string;
  neighborhood: string;
  summary: string;
  hotelPageHref: string;
  reserveHref: string;
  priceLabel: string;
  nightlyRateLabel: string;
  distanceLabel: string;
  driveTimeLabel: string;
  stayStyle: string;
};

export async function HotelClusterPageScreen({ slug }: { slug: string }) {
  const page = getHotelClusterPage(slug);

  if (!page) {
    notFound();
  }

  const [vehicles, routes, settings, hotels] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
    getActiveHotels(env.siteSlug),
  ]);

  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);
  const fallbackRoute = routes.find((route) => route.slug === page.fallbackRouteSlug) ?? null;
  const initialState = fallbackRoute
    ? deriveRouteReservationDefaults(fallbackRoute)
    : {
        serviceMode: "airport" as const,
        tripType: "distance" as const,
        pickupAddress: "Sea-Tac Airport",
        pickupDetail: "Flight number, hotel, or pickup notes",
      };

  const matchedHotels = hotels
    .filter((hotel) =>
      page.hotelSlugs?.length ? page.hotelSlugs.includes(hotel.slug) : page.areas.includes(hotel.area),
    )
    .map((hotel) => {
      const route = routes.find((entry) => entry.slug === hotel.airportRouteSlug) ?? null;
      const reservationDefaults = deriveHotelReservationDefaults(hotel, route);
      const snapshot = deriveHotelPriceSnapshot(hotel, route, vehicles, reservationDefaults);

      return {
        hotel,
        route,
        snapshot,
      };
    })
    .filter((entry) => entry.snapshot);

  if (matchedHotels.length === 0) {
    notFound();
  }

  const fares = matchedHotels.map((entry) => entry.snapshot!.fare);
  const durations = matchedHotels.map((entry) => entry.snapshot!.durationMinutes);
  const distances = matchedHotels.map((entry) => entry.snapshot!.distanceMiles);

  const clusterFacts = [
    { label: "Hotels listed", value: `${matchedHotels.length}` },
    { label: "Typical nightly range", value: getHotelClusterStayRangeLabel(matchedHotels.map((entry) => entry.hotel)) },
    { label: "Starting fare", value: formatCurrency(Math.min(...fares)) },
    {
      label: "Drive time",
      value: `${Math.min(...durations)}-${Math.max(...durations)} min`,
    },
    {
      label: "Route distance",
      value: `${Math.min(...distances).toFixed(1)}-${Math.max(...distances).toFixed(1)} mi`,
    },
  ];

  const cards: HotelClusterCard[] = matchedHotels.map(({ hotel, route, snapshot }) => {
    const staySnapshot = getHotelStaySnapshot(hotel);

    return {
      slug: hotel.slug,
      name: hotel.name,
      neighborhood: hotel.neighborhood,
      summary: hotel.summary,
      hotelPageHref: `/seatac-to/${hotel.slug}`,
      reserveHref: route ? getHotelReserveHref(route.slug, hotel.slug) : "/reserve",
      priceLabel: formatCurrency(snapshot!.fare),
      nightlyRateLabel: staySnapshot.nightlyRateLabel,
      distanceLabel: `${snapshot!.distanceMiles.toFixed(1)} mi`,
      driveTimeLabel: `${snapshot!.durationMinutes} min`,
      stayStyle: staySnapshot.styleLabel,
    };
  });

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main>
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "seatac.co", path: "/" },
            { name: "Hotel guides", path: `/${page.slug}` },
          ])}
        />
        <JsonLd
          data={buildCollectionPageJsonLd(
            page.title.replace(" | seatac.co", ""),
            page.description,
            `/${page.slug}`,
            cards.map((card) => ({
              name: card.name,
              path: card.hotelPageHref,
            })),
          )}
        />
        <JsonLd data={buildFaqJsonLd(page.faqs)} />
        <section className="pt-24 pb-16 px-6 lg:px-8 text-center bg-white flex flex-col items-center">
          <div className="max-w-4xl mx-auto space-y-6 pt-12 pb-16">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-slate-500">
              {page.heroEyebrow}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-950 leading-[1.05] tracking-tight text-balance">
              {page.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto text-balance">
              {page.heroBody}
            </p>
            <div className="flex justify-center pt-6 pb-2">
              <Link
                href={fallbackRoute ? getRouteReserveHref(fallbackRoute.slug) : "/reserve"}
                className="rounded-full bg-slate-900 text-white px-8 py-3.5 text-sm font-bold shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] hover:bg-slate-800 hover:scale-105 transition-all duration-300"
              >
                Reserve a hotel transfer
              </Link>
            </div>
          </div>
          <div className="w-full max-w-7xl mx-auto px-4 md:px-0">
            <div className="h-[400px] md:h-[600px] w-full rounded-[2rem] overflow-hidden relative shadow-2xl shadow-slate-900/10">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${page.art})`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-12 px-6 lg:px-8 border-y border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-7xl grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {clusterFacts.map((item) => (
              <HomeGradientMetricCard
                key={item.label}
                eyebrow={item.label}
                title={item.value}
              />
            ))}
          </div>
        </section>

        <section className="py-24 px-6 lg:px-8" id="hotel-options">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">{page.sectionKicker}</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950">{page.sectionTitle}</h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl">{page.sectionBody}</p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-2">
              {cards.map((card) => (
                <article
                  key={card.slug}
                  className="rounded-[2.5rem] bg-white p-8 lg:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                          {card.neighborhood}
                        </p>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-950">
                          {card.name}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-600 max-w-md">{card.summary}</p>
                      </div>
                      <Link href={card.hotelPageHref} className="text-xs font-bold text-emerald-700 hover:text-emerald-500 uppercase tracking-widest flex items-center group">
                        Hotel details
                        <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </Link>
                    </div>

                    <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-4">
                      <div className="rounded-2xl bg-emerald-50/50 px-4 py-4 border border-emerald-100/50">
                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 mb-1">
                          Starting fare
                        </p>
                        <p className="text-xl font-extrabold text-emerald-950">{card.priceLabel}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50/50 px-4 py-4 border border-emerald-100/50">
                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 mb-1">
                          Nightly rate
                        </p>
                        <p className="text-xl font-extrabold text-emerald-950">{card.nightlyRateLabel}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50/50 px-4 py-4 border border-emerald-100/50">
                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 mb-1">
                          Distance
                        </p>
                        <p className="text-xl font-extrabold text-emerald-950">{card.distanceLabel}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50/50 px-4 py-4 border border-emerald-100/50">
                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500 mb-1">
                          Drive time
                        </p>
                        <p className="text-xl font-extrabold text-emerald-950">{card.driveTimeLabel}</p>
                      </div>
                    </div>

                    <p className="mt-6 text-sm font-semibold text-emerald-800">{card.stayStyle}</p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-4 items-center">
                    <Link href={card.reserveHref} className="rounded-full bg-slate-900 text-white px-8 py-3.5 text-sm font-bold shadow-xl hover:bg-slate-800 hover:scale-105 hover:shadow-2xl transition-all duration-300">
                      Reserve transfer
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6 lg:px-8 bg-slate-50 border-t border-slate-100" id="reserve-form">
          <div className="mx-auto max-w-5xl flex flex-col items-center">
            <div className="mb-12 text-center">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">Reserve this ride</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950 mb-4">Choose your hotel route and reserve online.</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Start with the airport hotel corridor below, or open one of the hotel pages above
                for a property-specific booking flow.
              </p>
            </div>
            <div className="w-full text-left">
              <ReserveWizard
                bookingConstraints={bookingConstraints}
                vehicles={vehicles}
                routes={routes}
                compact
                initialState={initialState}
              />
            </div>
          </div>
        </section>

        <section className="py-24 px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">Good to know</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">What makes this group of hotels useful.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {page.reasons.map((reason) => (
                <HomeSurfaceNoteCard
                  key={reason.title}
                  title={reason.title}
                  body={reason.body}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">FAQs</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Quick answers before you choose a hotel transfer.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {page.faqs.map((faq) => (
                <HomeSurfaceNoteCard
                  key={faq.question}
                  title={faq.question}
                  body={faq.answer}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
