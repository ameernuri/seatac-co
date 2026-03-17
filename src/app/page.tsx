import Link from "next/link";

import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import { coverageAreas, siteChrome } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [vehicles, routes, settings] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
  ]);
  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);

  const routeCards = [
    {
      eyebrow: "Airport route",
      title: "Sea-Tac to downtown Seattle",
      body: "Useful for hotels, convention traffic, South Lake Union, and waterfront arrivals.",
      href: "/seatac-to-downtown-seattle",
      art: "/seattle.water.night.webp",
    },
    {
      eyebrow: "Eastside route",
      title: "Sea-Tac to Bellevue",
      body: "For office towers, hotel check-ins, and airport trips into the Bellevue core.",
      href: "/seatac-to-bellevue",
      art: "/downtown.night.jpeg",
    },
    {
      eyebrow: "Eastside route",
      title: "Sea-Tac to Kirkland",
      body: "Direct airport transfers for residential pickups, waterfront stays, and Eastside travel.",
      href: "/seatac-to-kirkland",
      art: "/scene-city.svg",
    },
    {
      eyebrow: "Flexible service",
      title: "Hourly airport-day service",
      body: "For multi-stop itineraries, hosted arrivals, and airport days that keep moving.",
      href: "/seatac-hourly-charter",
      art: "/scene-airport.svg",
    },
  ] as const;

  const guideCards = [
    {
      title: "Sea-Tac hotel pickup planning",
      body: "Use airport pickup notes, hotel names, and timing windows that make sense for early departures and late arrivals.",
    },
    {
      title: "Airport-to-city transfer notes",
      body: "Choose the route page that matches where you are actually staying so the booking form opens closer to the final trip.",
    },
    {
      title: "Built for travel research too",
      body: "This brand is meant to grow into a Seattle airport guide with hotel rundowns, transfer notes, and local arrival planning.",
    },
  ] as const;

  const promisePoints = [
    "Sea-Tac arrivals and departures",
    "Seattle hotel and Eastside coverage",
    "Direct booking with route-aware forms",
  ] as const;

  const bookingTags = [
    "Airport pickups",
    "Sea-Tac hotels",
    "Downtown Seattle",
    "Bellevue",
    "Kirkland",
  ] as const;

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main>
        <section className="border-b border-white/8">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-[0_30px_110px_rgba(0,0,0,0.38)]">
              <div
                className="h-[220px] bg-cover bg-center md:h-[280px] lg:h-[320px]"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(8,10,16,0.06) 0%, rgba(8,10,16,0.46) 58%, rgba(8,10,16,0.92) 100%), url(/seattle.water.night.webp)",
                }}
              />
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
              <div className="section-frame p-7 lg:p-9">
                <span className="eyebrow">Sea-Tac airport rides + Seattle arrival planning</span>
                <h1 className="display-title mt-4 max-w-4xl text-[3.5rem] leading-[0.9] text-white md:text-[5.1rem]">
                  Book the airport ride and use the site like a local travel desk.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
                  seatac.co is built for Sea-Tac pickups, hotel transfers, downtown Seattle
                  arrivals, Bellevue rides, and airport-day planning that starts with the booking
                  instead of ending with a contact form.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="#booking" className="action-pill">
                    Start a reservation
                  </Link>
                  <Link href={siteChrome.reservationPhoneHref} className="action-pill action-pill-secondary">
                    Call dispatch
                  </Link>
                </div>
                <div className="mt-7 flex flex-wrap gap-3" aria-label="Popular service zones">
                  {bookingTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {promisePoints.map((point) => (
                    <div
                      key={point}
                      className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/70"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              <div className="editorial-panel p-5 lg:p-6" id="booking">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.74rem] uppercase tracking-[0.34em] text-primary/75">
                      Reserve now
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#f5efe5]">
                      Start with the route and send the trip straight into dispatch.
                    </h2>
                  </div>
                </div>
                <ReserveWizard
                  bookingConstraints={bookingConstraints}
                  vehicles={vehicles}
                  routes={routes}
                  compact
                  initialState={{ serviceMode: "airport", tripType: "flat" }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="routes">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">Popular airport routes</span>
                <h2 className="section-title">Start from the page that matches where you are going.</h2>
              </div>
            </div>
            <div className="media-card-grid font-sans">
              {routeCards.map((card) => (
                <article key={card.title} className="media-card">
                  <div
                    className="media-card-art"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(9,10,13,0.1) 0%, rgba(9,10,13,0.7) 72%, rgba(9,10,13,0.96) 100%), url(${card.art})`,
                    }}
                  />
                  <div className="media-card-copy">
                    <span className="service-index">{card.eyebrow}</span>
                    <h3 className="font-sans text-xl font-semibold text-[#f5efe5]">{card.title}</h3>
                    <p>{card.body}</p>
                    <Link href={card.href} className="service-link">
                      Open route page
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="guides">
          <div className="section-inner">
            <div className="detail-band">
              <div className="detail-band-copy">
                <span className="section-kicker">Airport planning notes</span>
                <h2 className="section-title">More useful than a bare booking form, without turning into a directory.</h2>
                <p className="section-copy">
                  The long-term role of seatac.co is simple: make airport transportation easier to
                  understand, then make it easy to book.
                </p>
              </div>
              <div className="detail-band-grid">
                {guideCards.map((guide) => (
                  <article key={guide.title} className="compact-note-card">
                    <h3 className="font-sans font-semibold text-[#f5efe5]">{guide.title}</h3>
                    <p>{guide.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section coverage-section" id="coverage">
          <div className="section-inner">
            <div className="coverage-panel font-sans">
              <div className="coverage-copy">
                <span className="section-kicker">Coverage</span>
                <h2 className="section-title">Airport-focused service for the places Sea-Tac riders ask for most.</h2>
                <p>
                  The current footprint is built around the airport, nearby hotel zones, downtown
                  Seattle, Bellevue, Kirkland, and the routes visitors and business travelers use most often.
                </p>
                <div className="areas-grid">
                  {coverageAreas.map((area) => (
                    <div key={area} className="area-pill">
                      {area}
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/30"
                aria-hidden="true"
              >
                <div
                  className="min-h-[320px] bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(6,8,14,0.08) 0%, rgba(6,8,14,0.68) 80%, rgba(6,8,14,0.94) 100%), url(/downtown.night.jpeg)",
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
