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
        <section className="route-hero">
          <div className="section-inner route-hero-grid">
            <aside className="route-scene-card">
              <div
                className="route-scene-art"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(9,10,13,0.08) 0%, rgba(9,10,13,0.55) 65%, rgba(9,10,13,0.92) 100%), url(${page.art})`,
                }}
              />
              <div className="route-scene-copy">
                <span className="section-kicker">{page.sectionKicker}</span>
                <h2>{page.sectionTitle}</h2>
                <p>{page.sectionBody}</p>
              </div>
            </aside>
            <div className="route-hero-copy">
              <span className="eyebrow">{page.heroEyebrow}</span>
              <h1 className="display-title route-display-title">{page.heroTitle}</h1>
              <p>{page.heroBody}</p>
              <div className="hero-actions">
                <Link
                  href={fallbackRoute ? getRouteReserveHref(fallbackRoute.slug) : "/reserve"}
                  className="button-link primary"
                >
                  Reserve a hotel transfer
                </Link>
                <Link href="#hotel-options" className="button-link secondary">
                  Compare hotels
                </Link>
              </div>
              <div className="route-mini-pills">
                {page.areas.map((area) => (
                  <span key={area} className="hero-tag">
                    {getHotelAreaLabel(area)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section route-summary-section">
          <div className="section-inner route-summary-grid">
            {clusterFacts.map((item) => (
              <HomeGradientMetricCard
                key={item.label}
                eyebrow={item.label}
                title={item.value}
              />
            ))}
          </div>
        </section>

        <section className="section" id="hotel-options">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">{page.sectionKicker}</span>
                <h2 className="section-title">{page.sectionTitle}</h2>
                <p className="section-copy">{page.sectionBody}</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {cards.map((card) => (
                <article
                  key={card.slug}
                  className="rounded-[1.8rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#5a7a6e]">
                        {card.neighborhood}
                      </p>
                      <h3 className="font-sans text-[1.45rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                        {card.name}
                      </h3>
                      <p className="max-w-xl text-sm leading-7 text-[#5a7a6e]">{card.summary}</p>
                    </div>
                    <Link href={card.hotelPageHref} className="button-link secondary">
                      View hotel page
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                        Starting fare
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#123b33]">{card.priceLabel}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                        Nightly rate
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#123b33]">{card.nightlyRateLabel}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                        Distance
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#123b33]">{card.distanceLabel}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                        Drive time
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#123b33]">{card.driveTimeLabel}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-[#5a7a6e]">{card.stayStyle}</p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link href={card.reserveHref} className="button-link primary">
                      Reserve Sea-Tac to {card.name}
                    </Link>
                    <Link href={card.hotelPageHref} className="button-link secondary">
                      Hotel details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section route-reserve-section" id="reserve-form">
          <div className="section-inner">
            <div className="route-reserve-shell">
              <div className="route-reserve-copy">
                <span className="section-kicker">Reserve this ride</span>
                <h2 className="section-title">Choose your hotel route and reserve online.</h2>
                <p className="section-copy">
                  Start with the airport hotel corridor below, or open one of the hotel pages above
                  for a property-specific booking flow.
                </p>
              </div>
              <div className="booking-panel font-sans">
                <ReserveWizard
                  bookingConstraints={bookingConstraints}
                  vehicles={vehicles}
                  routes={routes}
                  compact
                  initialState={initialState}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">Good to know</span>
                <h2 className="section-title">What makes this group of hotels useful.</h2>
              </div>
            </div>
            <div className="route-reason-grid">
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

        <section className="section">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">FAQs</span>
                <h2 className="section-title">Quick answers before you choose a hotel transfer.</h2>
              </div>
            </div>
            <div className="route-faq-grid">
              {page.faqs.map((faq) => (
                <HomeSurfaceNoteCard
                  key={faq.question}
                  title={faq.question}
                  body={faq.answer}
                  className="route-faq-card"
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
