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

        <section className="pt-24 pb-16 px-6 lg:px-8 text-center bg-white flex flex-col items-center">
          <div className="max-w-4xl mx-auto space-y-6 pt-12 pb-16">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-slate-500">
              Hotel transfer
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-950 leading-[1.05] tracking-tight text-balance">
              {getHotelRouteName(hotel)} car service for direct airport arrivals.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto text-balance">
              {getHotelPageDescription(hotel)}
            </p>
            <p className="text-base text-slate-400 leading-relaxed max-w-xl mx-auto font-medium">
              Use this page to compare the Sea-Tac transfer, typical stay range, and live room-rate window for {hotel.name} before you reserve the ride.
            </p>
            <div className="flex justify-center pt-6 pb-2">
              <Link
                href={reserveHref}
                className="rounded-full bg-slate-900 text-white px-8 py-3.5 text-sm font-bold shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] hover:bg-slate-800 hover:scale-105 transition-all duration-300"
              >
                Reserve this hotel transfer
              </Link>
            </div>
          </div>
          <div className="w-full max-w-7xl mx-auto px-4 md:px-0">
            <div className="h-[400px] md:h-[600px] w-full rounded-[2rem] overflow-hidden relative shadow-2xl shadow-slate-900/10">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getHotelArt(hotel.area)})`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-12 px-6 lg:px-8 border-y border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-7xl grid gap-4 grid-cols-2 lg:grid-cols-4">
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

        <section className="py-24 px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">Stay snapshot</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">A quick read on the hotel itself.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

        <section className="py-24 px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">Hotel rates</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Check a live room-rate window before you book.</h2>
            </div>
            <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12 items-start">
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Stay dates</span>
                <h3 className="text-2xl font-extrabold text-emerald-950">Look up a sample stay at {hotel.name}.</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Use a quick date check to compare the hotel stay itself with the airport transfer.
                </p>
                <form className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end">
                  <label className="grid gap-2">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-emerald-800">
                      Check-in
                    </span>
                    <input
                      type="date"
                      name="checkin"
                      defaultValue={stayWindow.checkin}
                      className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-emerald-800">
                      Checkout
                    </span>
                    <input
                      type="date"
                      name="checkout"
                      defaultValue={stayWindow.checkout}
                      className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
                    />
                  </label>
                  <button type="submit" className="h-14 mb-0 sm:mb-0 rounded-2xl bg-slate-900 text-white px-8 text-sm font-bold shadow-md hover:bg-slate-800 transition-all">
                    Check rates
                  </button>
                </form>
              </div>
              <div className="rounded-[2rem] bg-white p-8 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] mt-4 lg:mt-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-500">
                  {formatStayWindow(stayWindow)}
                </p>
                {liveStayRate ? (
                  <>
                    <h3 className="mt-4 text-3xl font-extrabold text-emerald-950">
                      {formatCurrency(liveStayRate.totalPrice)} total stay
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      About {formatCurrency(liveStayRate.nightlyRate)} per night for the selected
                      dates.
                    </p>
                    {liveStayRate.deeplinkUrl ? (
                      <div className="mt-8">
                        <Link
                          href={liveStayRate.deeplinkUrl}
                          className="rounded-full flex items-center justify-center bg-white text-emerald-700 border border-emerald-200 px-6 py-3 text-sm font-bold shadow-sm hover:bg-emerald-50 transition-all"
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
                    <h3 className="mt-4 text-2xl font-extrabold text-emerald-950">
                      Typical stay range: {staySnapshot.nightlyRateLabel}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      A live room-rate match is not available for these dates right now, so use
                      the typical nightly range as your planning baseline.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 lg:px-8 bg-white" id="reserve-form">
          <div className="mx-auto max-w-5xl flex flex-col items-center">
            <div className="mb-12 text-center">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">Reserve this hotel transfer</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950 mb-4">Reserve your ride to {hotel.name} online.</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Your airport route is already selected. Add your flight timing, vehicle choice,
                and trip details to confirm the reservation.
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

        <section className="py-24 px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">Trip details</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Helpful to know before you arrive.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
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
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={getHotelAreaGuideHref(hotel.area)} className="rounded-full px-8 py-3.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-300">
                Browse {getHotelAreaLabel(hotel.area)}
              </Link>
              {hotel.area === "waterfront" ? (
                <Link href="/bell-street-cruise-terminal-pier-66" className="rounded-full px-8 py-3.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-300">
                  Pier 66 guide
                </Link>
              ) : null}
              {hotel.area === "waterfront" || hotel.area === "downtown-seattle" ? (
                <Link href="/seatac-to-cruise-pre-stay-hotels" className="rounded-full px-8 py-3.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-300">
                  Cruise pre-stay hotels
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        {faqs.length ? (
          <section className="py-24 px-6 lg:px-8 bg-white border-t border-slate-100">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12">
                <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">FAQs</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Common questions about this hotel transfer.</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
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
