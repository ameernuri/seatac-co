import Link from "next/link";

import {
  HomeGradientMetricCard,
  HomeSurfaceNoteCard,
} from "@/components/home-gradient-cards";
import { JsonLd } from "@/components/json-ld";
import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getLiveHotelRate } from "@/lib/booking-demand";
import { getActiveRoutes, getActiveVehicles, getHotelBySlug, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import {
  deriveHotelReservationDefaults,
  getHotelAreaGuideHref,
  getHotelAreaLabel,
  getHotelArt,
  getHotelFaqs,
  getHotelPageDescription,
  getHotelRouteName,
} from "@/lib/hotels";
import { getHotelStaySnapshot } from "@/lib/hotel-stays";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildHotelJsonLd,
  buildTransferServiceJsonLd,
} from "@/lib/seo";
import { formatCurrency } from "@/lib/format";
import { formatStayWindow, resolveStayWindow } from "@/lib/stay-dates";
import { getSiteThemeContent } from "@/lib/theme";
import {
  deriveHotelFacts,
  deriveHotelPriceSnapshot,
  getHotelReserveHref,
} from "@/lib/route-booking";

export async function HotelPageScreen({
  slug,
  stayDates,
}: {
  slug: string;
  stayDates?: {
    checkin?: string;
    checkout?: string;
  };
}) {
  const [vehicles, routes, settings, hotel] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
    getHotelBySlug(slug, env.siteSlug),
  ]);

  if (!hotel) {
    return null;
  }

  const theme = getSiteThemeContent(env.siteSlug);
  const providerPhone =
    typeof settings.dispatchPhone === "string" && settings.dispatchPhone.trim().length > 0
      ? settings.dispatchPhone
      : theme.footer.contactPhone;
  const route = routes.find((entry) => entry.slug === hotel.airportRouteSlug) ?? null;
  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);
  const initialState = deriveHotelReservationDefaults(hotel, route);
  const snapshot = deriveHotelPriceSnapshot(hotel, route, vehicles, initialState);
  const facts = deriveHotelFacts(hotel, route, vehicles, initialState) ?? [];
  const staySnapshot = getHotelStaySnapshot(hotel);
  const stayWindow = resolveStayWindow(stayDates);
  const liveStayRate = await getLiveHotelRate(hotel, stayWindow);
  const reserveHref = route ? getHotelReserveHref(route.slug, hotel.slug) : "/reserve";
  const faqs = snapshot ? getHotelFaqs(hotel, snapshot, staySnapshot) : [];

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main>
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "seatac.co", path: "/" },
            { name: getHotelAreaLabel(hotel.area), path: getHotelAreaGuideHref(hotel.area) },
            { name: hotel.name, path: `/seatac-to/${hotel.slug}` },
          ])}
        />
        <JsonLd
          data={buildHotelJsonLd(
            hotel,
            `/seatac-to/${hotel.slug}`,
            getHotelArt(hotel.area),
            staySnapshot.priceRangeLabel,
          )}
        />
        {snapshot ? (
          <JsonLd
            data={buildTransferServiceJsonLd({
              name: getHotelRouteName(hotel),
              description: getHotelPageDescription(hotel),
              path: reserveHref,
              price: snapshot.fare,
              areaServed: ["Sea-Tac Airport", hotel.name, hotel.neighborhood],
              providerPhone,
            })}
          />
        ) : null}
        {faqs.length ? <JsonLd data={buildFaqJsonLd(faqs)} /> : null}

        <section className="route-hero">
          <div className="section-inner route-hero-grid">
            <aside className="route-scene-card">
              <div
                className="route-scene-art"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(9,10,13,0.08) 0%, rgba(9,10,13,0.55) 65%, rgba(9,10,13,0.92) 100%), url(${getHotelArt(hotel.area)})`,
                }}
              />
              <div className="route-scene-copy">
                <span className="section-kicker">{getHotelAreaLabel(hotel.area)}</span>
                <h2>{hotel.name}</h2>
                <p>{hotel.summary}</p>
              </div>
            </aside>
            <div className="route-hero-copy">
              <span className="eyebrow">Hotel transfer</span>
              <h1 className="display-title route-display-title">
                {getHotelRouteName(hotel)} car service for direct airport arrivals.
              </h1>
              <p>{getHotelPageDescription(hotel)}</p>
              <p className="mt-4 max-w-[52rem] text-base leading-7 text-[#45675d]">
                Use this page to compare the Sea-Tac transfer, typical stay range, and live room-rate window for {hotel.name} before you reserve the ride.
              </p>
              <div className="hero-actions">
                <Link href={reserveHref} className="button-link primary">
                  Reserve this hotel transfer
                </Link>
                <Link href="#reserve-form" className="button-link secondary">
                  See booking details
                </Link>
              </div>
              <div className="route-mini-pills">
                {[hotel.neighborhood, getHotelAreaLabel(hotel.area), `${hotel.durationMinutes} min from Sea-Tac`].map(
                  (item) => (
                    <span key={item} className="hero-tag">
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section route-summary-section">
          <div className="section-inner route-summary-grid">
            {liveStayRate ? (
              <HomeGradientMetricCard
                eyebrow="Live stay rate"
                title={`${formatCurrency(liveStayRate.nightlyRate)}/night`}
              />
            ) : null}
            <HomeGradientMetricCard
              eyebrow="Typical nightly rate"
              title={staySnapshot.nightlyRateLabel}
            />
            {facts.map((item) => (
              <HomeGradientMetricCard
                key={item.label}
                eyebrow={item.label}
                title={item.value}
              />
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">Stay snapshot</span>
                <h2 className="section-title">A quick read on the hotel itself.</h2>
              </div>
            </div>
            <div className="route-reason-grid">
              <HomeSurfaceNoteCard title="Stay style" body={staySnapshot.styleLabel} />
              <HomeSurfaceNoteCard
                title="Typical nightly range"
                body={staySnapshot.nightlyRateLabel}
              />
              <HomeSurfaceNoteCard
                title="Good for"
                body={`${staySnapshot.bestFor.join(", ")}.`}
              />
              <HomeSurfaceNoteCard title="Planning note" body={staySnapshot.planningNote} />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">Hotel rates</span>
                <h2 className="section-title">Check a live room-rate window before you book.</h2>
              </div>
            </div>
            <div className="route-reserve-shell">
              <div className="route-reserve-copy">
                <span className="section-kicker">Stay dates</span>
                <h3 className="section-title text-[1.7rem]">Look up a sample stay at {hotel.name}.</h3>
                <p className="section-copy">
                  Use a quick date check to compare the hotel stay itself with the airport transfer.
                </p>
                <form className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <label className="grid gap-2">
                    <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                      Check-in
                    </span>
                    <input
                      type="date"
                      name="checkin"
                      defaultValue={stayWindow.checkin}
                      className="h-14 rounded-[1.1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                      Checkout
                    </span>
                    <input
                      type="date"
                      name="checkout"
                      defaultValue={stayWindow.checkout}
                      className="h-14 rounded-[1.1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
                    />
                  </label>
                  <div className="flex items-end">
                    <button type="submit" className="button-link primary">
                      Check rates
                    </button>
                  </div>
                </form>
              </div>
              <div className="rounded-[1.8rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)]">
                <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                  {formatStayWindow(stayWindow)}
                </p>
                {liveStayRate ? (
                  <>
                    <h3 className="mt-3 text-[1.6rem] leading-[1.05] tracking-[-0.03em] text-[#123b33]">
                      {formatCurrency(liveStayRate.totalPrice)} total stay
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">
                      About {formatCurrency(liveStayRate.nightlyRate)} per night for the selected
                      dates.
                    </p>
                    {liveStayRate.deeplinkUrl ? (
                      <div className="mt-5">
                        <Link
                          href={liveStayRate.deeplinkUrl}
                          className="button-link secondary"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open live hotel offer
                        </Link>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <h3 className="mt-3 text-[1.6rem] leading-[1.05] tracking-[-0.03em] text-[#123b33]">
                      Typical stay range: {staySnapshot.nightlyRateLabel}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">
                      A live room-rate match is not available for these dates right now, so use
                      the typical nightly range as your planning baseline.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section route-reserve-section" id="reserve-form">
          <div className="section-inner">
            <div className="route-reserve-shell">
              <div className="route-reserve-copy">
                <span className="section-kicker">Reserve this hotel transfer</span>
                <h2 className="section-title">Reserve your ride to {hotel.name} online.</h2>
                <p className="section-copy">
                  Your airport route is already selected. Add your flight timing, vehicle choice,
                  and trip details to confirm the reservation.
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
                <span className="section-kicker">Trip details</span>
                <h2 className="section-title">Helpful to know before you arrive.</h2>
              </div>
            </div>
            <div className="route-reason-grid">
              <HomeSurfaceNoteCard
                title="Hotel location"
                body={`${hotel.name} is in ${hotel.neighborhood}, which can affect airport timing, late arrivals, and cruise or downtown connections.`}
              />
              <HomeSurfaceNoteCard
                title="Airport timing"
                body="Use the transfer estimate on this page as a planning baseline for arrivals, hotel check-in, and return trips back to Sea-Tac."
              />
              <HomeSurfaceNoteCard
                title="Direct booking"
                body="Your destination is already selected in the booking form, so you can move straight into timing and vehicle details."
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={getHotelAreaGuideHref(hotel.area)} className="button-link secondary">
                Browse {getHotelAreaLabel(hotel.area)}
              </Link>
              {hotel.area === "waterfront" ? (
                <Link href="/bell-street-cruise-terminal-pier-66" className="button-link secondary">
                  Pier 66 guide
                </Link>
              ) : null}
              {hotel.area === "waterfront" || hotel.area === "downtown-seattle" ? (
                <Link href="/seatac-to-cruise-pre-stay-hotels" className="button-link secondary">
                  Cruise pre-stay hotels
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        {faqs.length ? (
          <section className="section">
            <div className="section-inner">
              <div className="section-heading section-heading-tight">
                <div>
                  <span className="section-kicker">FAQs</span>
                  <h2 className="section-title">Common questions about this hotel transfer.</h2>
                </div>
              </div>
              <div className="route-faq-grid">
                {faqs.map((faq) => (
                  <HomeSurfaceNoteCard
                    key={faq.question}
                    title={faq.question}
                    body={faq.answer}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
