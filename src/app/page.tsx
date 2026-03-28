import Link from "next/link";

import {
  HomeGradientCard,
  HomeGradientMetricCard,
  HomeGradientPanel,
  HomeGradientRowLink,
} from "@/components/home-gradient-cards";
import { JsonLd } from "@/components/json-ld";
import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getCoverageLinks } from "@/lib/coverage-links";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import { formatCurrency } from "@/lib/format";
import { buildLocalBusinessJsonLd, buildWebSiteJsonLd } from "@/lib/seo";
import { coverageAreas, siteChrome } from "@/lib/site-content";
import { getSiteThemeContent } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [vehicles, routes, settings] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
  ]);

  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);
  const theme = getSiteThemeContent(env.siteSlug);
  const startingFare = vehicles.reduce<number | null>((lowest, vehicle) => {
    const basePrice = Number(vehicle.basePrice);

    if (!Number.isFinite(basePrice)) {
      return lowest;
    }

    if (lowest === null || basePrice < lowest) {
      return basePrice;
    }

    return lowest;
  }, null);
  const leadHours = bookingConstraints.minimumLeadMinutes / 60;
  const formatOperatingTime = (value: string) => {
    const [hoursText, minutes] = value.split(":");
    const hours = Number(hoursText);
    const meridiem = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;

    return `${displayHour}:${minutes} ${meridiem}`;
  };

  const highlights = [
    { label: "Sea-Tac airport car service", href: "/seatac-airport-car-service" },
    { label: "Sea-Tac airport hotels", href: "/seatac-airport-hotels" },
    { label: "Sea-Tac flight lookup", href: "/flight" },
  ] as const;

  const services = [
    {
      eyebrow: "Airport",
      title: "Sea-Tac transfers",
      copy: "Airport pickups and departures with direct booking, fixed routes, and private ride service.",
      image: "/airport-transfer-card.jpg",
      imagePosition: "center center",
      href: "/seatac-airport-car-service",
      ctaLabel: "See Sea-Tac transfer details",
    },
    {
      eyebrow: "Cruise",
      title: "Pier 66 and Pier 91 transfers",
      copy: "Direct service between Sea-Tac, downtown hotels, and Seattle cruise terminals.",
      image: "/seattle.water.night.webp",
      imagePosition: "center 58%",
      href: "/seatac-to-pier-66",
      ctaLabel: "See cruise terminal transfer details",
    },
    {
      eyebrow: "Eastside",
      title: "Bellevue and downtown hotel rides",
      copy: "Useful for hotel check-ins, office visits, and planned airport pickups across Seattle.",
      image: "/eastside-hotel-card.jpg",
      imagePosition: "center center",
      href: "/seatac-to-bellevue",
      ctaLabel: "See Bellevue and hotel ride details",
    },
  ] as const;

  const rideDetails = [
    {
      title: "Flat-rate airport routes",
      copy: "See common Sea-Tac trips with set pricing before you choose a pickup time.",
    },
    {
      title: "Direct private rides",
      copy: "No shared shuttle stops between the airport, hotel, and terminal.",
    },
    {
      title: "Simple reservation flow",
      copy: "Choose the route, date, and vehicle, then finish the reservation online or by phone.",
    },
  ] as const;

  const quickFacts = [
    {
      label: "Airport car service",
      value: "Sea-Tac airport car service",
      href: "/seatac-airport-car-service",
    },
    {
      label: "Cruise route",
      value: "Sea-Tac to Pier 66",
      href: "/seatac-to-pier-66",
    },
    {
      label: "Airport hotels",
      value: "Sea-Tac airport hotels",
      href: "/seatac-airport-hotels",
    },
  ] as const;

  const routePillars = [
    {
      label: "Bellevue car service",
      value: "Sea-Tac to Bellevue car service",
      href: "/seatac-to-bellevue",
    },
    {
      label: "Cruise transfer",
      value: "Sea-Tac to Pier 66",
      href: "/seatac-to-pier-66",
    },
    {
      label: "Downtown car service",
      value: "Sea-Tac to Downtown Seattle",
      href: "/seatac-to-downtown-seattle",
    },
  ] as const;

  const planningPillars = [
    {
      label: "Hotel stays",
      value: "Sea-Tac airport hotels",
      href: "/seatac-airport-hotels",
    },
    {
      label: "Flight planning",
      value: "Sea-Tac departures and arrivals",
      href: "/departures",
    },
    {
      label: "Bellevue hotel route",
      value: "Sea-Tac to Hyatt Regency Bellevue",
      href: "/seatac-to/hyatt-regency-bellevue",
    },
  ] as const;

  const coverageLinks = getCoverageLinks(coverageAreas);
  const keywordHubLinks = [
    { label: "Sea-Tac arrivals", href: "/arrivals" },
    { label: "Sea-Tac departures", href: "/departures" },
    { label: "Alaska at Sea-Tac", href: "/airlines/alaska-at-seatac" },
    { label: "Sea-Tac airport hotels", href: "/seatac-airport-hotels" },
    { label: "Sea-Tac airport car service", href: "/seatac-airport-car-service" },
    { label: "Sea-Tac to downtown Seattle", href: "/seatac-to-downtown-seattle" },
    { label: "Sea-Tac to Bellevue car service", href: "/seatac-to-bellevue" },
    { label: "Sea-Tac to Pier 66", href: "/seatac-to-pier-66" },
    { label: "Sea-Tac to Pier 91", href: "/seatac-to-pier-91" },
    { label: "Sea-Tac to Hyatt Regency Bellevue", href: "/seatac-to/hyatt-regency-bellevue" },
  ] as const;
  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main>
        <JsonLd
          data={buildLocalBusinessJsonLd(theme.footer.contactPhone, theme.footer.contactEmail)}
        />
        <JsonLd data={buildWebSiteJsonLd()} />

        <section className="hero">
          <div className="section-inner">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <div className="hero-copy font-sans">
                <span className="eyebrow">Sea-Tac travel planning and private rides</span>
                <h1 className="display-title">
                  Sea-Tac rides for hotels, cruise connections, and much more.
                </h1>
                <p>
                  Compare airport routes, review nearby hotel areas, confirm the booking window,
                  and reserve private transportation for Sea-Tac, Bellevue, downtown Seattle, and
                  the cruise terminals.
                </p>
                <div className="hero-actions">
                  <Link href="/reserve" className="button-link primary">
                    Reserve your ride
                  </Link>
                  <Link href={siteChrome.reservationPhoneHref} className="button-link secondary">
                    Call dispatch
                  </Link>
                </div>
                <div className="hero-tags" aria-label="Seatac Connection highlights">
                  {highlights.map((highlight) => (
                    <Link key={highlight.label} href={highlight.href} className="hero-tag">
                      {highlight.label}
                    </Link>
                  ))}
                </div>
              </div>
                <ReserveWizard
                  bookingConstraints={bookingConstraints}
                  vehicles={vehicles}
                  routes={routes}
                  landingOnly
                  showTitle={false}
                />
              </div>
            </div>
          <div className="section-inner mt-8">
            <div className="grid gap-6 md:grid-cols-2" aria-label="Service highlights">
              <div className="grid gap-3">
                <HomeGradientPanel eyebrow="Popular routes" aria-label="Popular routes">
                  <div className="route-pillars">
                    {routePillars.map((route) => (
                      <HomeGradientRowLink
                        key={route.label}
                        href={route.href}
                        eyebrow={route.label}
                        title={route.value}
                      />
                    ))}
                  </div>
                </HomeGradientPanel>
              </div>
              <div className="grid gap-3">
                <HomeGradientPanel eyebrow="Best fit planning" aria-label="Best fit planning">
                  <div className="route-pillars">
                    {planningPillars.map((pillar) => (
                      <HomeGradientRowLink
                        key={pillar.label}
                        href={pillar.href}
                        eyebrow={pillar.label}
                        title={pillar.value}
                      />
                    ))}
                  </div>
                </HomeGradientPanel>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="routes">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">Travel services</span>
                <h2 className="section-title">Airport, cruise, and hotel-focused Seattle routes.</h2>
              </div>
            </div>
            <div className="media-card-grid font-sans">
              {services.map((service) => (
                <article key={service.title} className="media-card">
                  <div
                    className="media-card-art"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(11, 26, 22, 0.02) 0%, rgba(11, 26, 22, 0.14) 56%, rgba(11, 26, 22, 0.4) 100%), url(${service.image})`,
                      backgroundPosition: service.imagePosition,
                    }}
                  />
                  <div className="media-card-copy">
                    <span className="service-index">{service.eyebrow}</span>
                    <h3 className="font-sans font-semibold text-[#f5efe5]">{service.title}</h3>
                    <p>{service.copy}</p>
                    <Link href={service.href} className="service-link">
                      {service.ctaLabel}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="planning">
          <div className="section-inner">
            <div className="detail-band">
              <div className="detail-band-copy">
                <span className="section-kicker">Ride details</span>
                <h2 className="section-title">
                  Choose the route and timing that fit your trip.
                </h2>
                <p className="section-copy">
                  Use the hotel guides, flight lookup, and route pages to confirm timing, compare
                  neighborhoods, and choose the pickup window that works best for your schedule.
                </p>
              </div>
              <div className="detail-band-grid">
                {rideDetails.map((detail) => (
                  <article key={detail.title} className="compact-note-card">
                    <h3 className="font-sans font-semibold text-[#f5efe5]">{detail.title}</h3>
                    <p>{detail.copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="trust">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">Quick links</span>
                <h2 className="section-title">The pages travelers use most before booking.</h2>
              </div>
            </div>
            <div className="quick-fact-grid font-sans">
              {quickFacts.map((fact) => (
                <HomeGradientCard
                  key={fact.label}
                  href={fact.href}
                  eyebrow={fact.label}
                  title={fact.value}
                />
              ))}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {keywordHubLinks.map((link) => (
                <HomeGradientMetricCard
                  key={link.label}
                  href={link.href}
                  eyebrow="Popular search"
                  title={link.label}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section coverage-section" id="coverage">
          <div className="section-inner">
            <div className="coverage-panel font-sans">
              <div className="coverage-copy">
                <span className="section-kicker">Coverage area</span>
                <h2 className="section-title">
                  Serving Sea-Tac, Seattle hotels, Bellevue, and the cruise terminals.
                </h2>
                <p>
                  Coverage includes the airport, downtown Seattle, Bellevue, waterfront hotels, and
                  the cruise terminals travelers use most often.
                </p>
                <div className="areas-grid">
                  {coverageLinks.map((area) => (
                    <Link key={area.label} href={area.href} className="area-pill">
                      {area.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="coverage-map-art coverage-map-photo" aria-hidden="true" />
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
