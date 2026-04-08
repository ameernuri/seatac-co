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
    { label: "Book flights", href: "/flights" },
    { label: "Book hotels", href: "/hotels" },
    { label: "Reserve rides", href: "/rides" },
    { label: "Compare parking", href: "/parking" },
    { label: "Track cruises", href: "/cruises" },
  ] as const;

  const services = [
    {
      eyebrow: "Flights",
      title: "Sea-Tac flight booking",
      copy: "Search partner-powered flight options, then connect the itinerary to Sea-Tac hotels, parking, and rides.",
      image: "/airport-suv-vibrant.png",
      imagePosition: "center center",
      href: "/flights",
      ctaLabel: "See flight booking",
    },
    {
      eyebrow: "Hotels",
      title: "Seattle and Sea-Tac hotels",
      copy: "Book airport, downtown, Bellevue, and cruise-pre-stay hotels without leaving the Sea-Tac planning flow.",
      image: "/cruise-v2.png",
      imagePosition: "center center",
      href: "/hotels",
      ctaLabel: "See hotel booking",
    },
    {
      eyebrow: "Ground",
      title: "Parking, rides, and cruise timing",
      copy: "Use one Seattle-first layer for Sea-Tac parking, airport transfers, and cruise-terminal trip timing.",
      image: "/bellevue-hotel.png",
      imagePosition: "center center",
      href: "/rides",
      ctaLabel: "See ride marketplace",
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
      label: "Flights",
      value: "Book flights from Sea-Tac",
      href: "/flights",
    },
    {
      label: "Hotels",
      value: "Seattle and Sea-Tac hotels",
      href: "/hotels",
    },
    {
      label: "Rides",
      value: "Airport and cruise rides",
      href: "/rides",
    },
    {
      label: "Parking",
      value: "Sea-Tac parking",
      href: "/parking",
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
      label: "Hotels",
      value: "Book Seattle and Sea-Tac hotels",
      href: "/hotels",
    },
    {
      label: "Flights",
      value: "Book flights and plan Sea-Tac timing",
      href: "/flights",
    },
    {
      label: "Parking",
      value: "Compare Sea-Tac parking",
      href: "/parking",
    },
    {
      label: "Cruises",
      value: "Seattle cruise arrivals and departures",
      href: "/cruises",
    },
    {
      label: "Ride marketplace",
      value: "Airport and cruise rides",
      href: "/rides",
    },
  ] as const;

  const coverageLinks = getCoverageLinks(coverageAreas);
  const keywordHubLinks = [
    { label: "Book flights", href: "/flights" },
    { label: "Book hotels", href: "/hotels" },
    { label: "Reserve rides", href: "/rides" },
    { label: "Sea-Tac parking", href: "/parking" },
    { label: "Seattle cruises", href: "/cruises" },
    { label: "Sea-Tac arrivals", href: "/arrivals" },
    { label: "Sea-Tac departures", href: "/departures" },
    { label: "Alaska at Sea-Tac", href: "/airlines/alaska-at-seatac" },
    { label: "Sea-Tac airport hotels", href: "/seatac-airport-hotels" },
    { label: "Sea-Tac airport guide", href: "/seatac-airport-guide" },
    { label: "Sea-Tac airport transfer guide", href: "/seatac-airport-transfer-guide" },
    { label: "Sea-Tac hotel transfer guide", href: "/seatac-hotel-transfer-guide" },
    { label: "Sea-Tac parking guide", href: "/seatac-parking-guide" },
    { label: "Sea-Tac park-and-fly hotels", href: "/park-and-fly-hotels-seatac" },
    { label: "Sea-Tac airport car service", href: "/seatac-airport-car-service" },
    { label: "Sea-Tac to downtown Seattle", href: "/seatac-to-downtown-seattle" },
    { label: "Downtown Seattle airport transfer guide", href: "/downtown-seattle-airport-transfer-guide" },
    { label: "Sea-Tac to Bellevue car service", href: "/seatac-to-bellevue" },
    { label: "Eastside airport transfer guide", href: "/eastside-airport-transfer-guide" },
    { label: "Sea-Tac to Pier 66", href: "/seatac-to-pier-66" },
    { label: "Sea-Tac to Pier 91", href: "/seatac-to-pier-91" },
    { label: "Sea-Tac to Hyatt Regency Bellevue", href: "/seatac-to/hyatt-regency-bellevue" },
  ] as const;

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="bg-[#f8f9fa] min-h-screen text-slate-900 font-sans selection:bg-emerald-500/30">
        <JsonLd data={buildLocalBusinessJsonLd(theme.footer.contactPhone, theme.footer.contactEmail)} />
        <JsonLd data={buildWebSiteJsonLd()} />

        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
             <div className="absolute inset-0 bg-gradient-to-b from-emerald-100 to-transparent blur-3xl rounded-full" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-6 flex flex-col items-center text-center">
            <span className="inline-block rounded-full bg-white border border-emerald-100 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-emerald-700 mb-8 shadow-sm">
              The Sea-Tac Travel Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-emerald-950 mb-6 leading-[1.15] tracking-normal">
              Your Seattle travel companion.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-16 leading-relaxed tracking-wide">
              Book flights, find hotels, reserve rides, compare parking, and move through Sea-Tac,
              Seattle, Bellevue, and the cruise terminals from a single airport-first platform.
            </p>

            <div className="w-full max-w-4xl mt-12 mb-8 relative z-20">
              <h2 className="text-3xl font-extrabold text-emerald-950 mb-6 tracking-normal text-center w-full">
                Book Your Ride
              </h2>
              <div className="w-full text-left">
                <ReserveWizard
                  bookingConstraints={bookingConstraints}
                  vehicles={vehicles}
                  routes={routes}
                  landingOnly
                  showTitle={false}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center items-center mt-6 mb-8 relative z-10">
              <Link href={siteChrome.reservationPhoneHref} className="group flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">
                Call dispatch
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
              {highlights.map((highlight) => (
                <Link key={highlight.label} href={highlight.href} className="text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-emerald-700 transition-colors">
                  {highlight.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Data Pillars (Popular Routes / Planning) */}
        <section className="py-20 relative">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Popular routes */}
              <div className="bg-white rounded-[2rem] p-10 md:p-14 shadow-sm border border-emerald-100/50 flex flex-col hover:shadow-xl transition-shadow duration-500">
                <h3 className="text-2xl font-extrabold text-emerald-950 mb-8 flex items-center gap-4 tracking-normal pb-6 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  Popular routes
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {routePillars.map((route) => (
                    <Link key={route.label} href={route.href} className="group flex flex-col p-5 rounded-2xl bg-slate-50 border border-transparent hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-700/70 mb-1">{route.label}</span>
                      <span className="text-lg font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors tracking-wide flex items-center justify-between">
                        {route.value}
                        <svg className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 text-emerald-600 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Best fit planning */}
              <div className="bg-white rounded-[2rem] p-10 md:p-14 shadow-sm border border-emerald-100/50 flex flex-col hover:shadow-xl transition-shadow duration-500">
                <h3 className="text-2xl font-extrabold text-emerald-950 mb-8 flex items-center gap-4 tracking-normal pb-6 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  Best fit planning
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {planningPillars.map((pillar) => (
                    <Link key={pillar.label} href={pillar.href} className="group flex flex-col p-5 rounded-2xl bg-slate-50 border border-transparent hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-700/70 mb-1">{pillar.label}</span>
                      <span className="text-lg font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors tracking-wide flex items-center justify-between">
                        {pillar.value}
                        <svg className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 text-emerald-600 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Travel Services */}
        <section className="py-24 relative" id="routes">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest uppercase text-emerald-600 mb-4 block">Travel services</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950 mb-6 tracking-normal">
                Seattle routes, reimagined.
              </h2>
            </div>
            
            {/* 3 Column Uniform Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link key={service.title} href={service.href} className="group flex flex-col bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="h-56 w-full relative overflow-hidden">
                    <img src={service.image} alt={service.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ objectPosition: service.imagePosition }} />
                  </div>
                  <div className="p-8 flex flex-col flex-1 bg-white">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">{service.eyebrow}</span>
                    <h3 className="text-xl font-extrabold text-emerald-950 mb-4 tracking-normal leading-tight">{service.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed tracking-wide mb-8 flex-1">{service.copy}</p>
                    <div className="flex items-center text-sm font-bold text-emerald-700 group-hover:text-emerald-500 transition-colors">
                      <span>{service.ctaLabel}</span>
                      <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Ride Details Modular Row */}
        <section className="py-12" id="planning">
          <div className="mx-auto max-w-7xl px-6">
            <div className="bg-emerald-950 rounded-[2.5rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-800/30 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="relative z-10">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-normal">Timing that fits your trip.</h2>
                  <p className="text-emerald-100/80 text-lg md:text-xl leading-relaxed tracking-wide">Use the hotel guides, flight lookup, and route pages to confirm timing, compare neighborhoods, and choose the pickup window that works best for your schedule.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {rideDetails.map((detail, index) => (
                    <article key={detail.title} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-10 hover:bg-white/10 transition-colors duration-500 flex flex-col">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-bold text-lg border border-emerald-500/30 mb-8">
                        0{index + 1}
                      </div>
                      <h3 className="text-2xl font-extrabold text-white mb-4 tracking-normal">
                        {detail.title}
                      </h3>
                      <p className="text-base text-emerald-100/70 leading-relaxed tracking-wide flex-1">{detail.copy}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Links / Pages Travelers Use Most */}
        <section className="py-20" id="trust">
          <div className="mx-auto max-w-7xl px-6">
            <div className="bg-white rounded-[2.5rem] p-12 md:p-20 shadow-sm border border-emerald-100/50">
              <div className="flex flex-col mb-16 text-center max-w-3xl mx-auto">
                <span className="text-sm font-bold tracking-widest uppercase text-emerald-600 mb-4 block">Quick references</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950 tracking-normal">Pages travelers use most.</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
                {quickFacts.map((fact) => (
                  <Link key={fact.label} href={fact.href} className="group flex flex-col p-8 rounded-[2rem] bg-slate-50 border border-transparent hover:border-emerald-200 hover:bg-white hover:shadow-xl transition-all duration-500">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-700/70 mb-3 block">{fact.label}</span>
                    <span className="text-xl font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors tracking-wide flex items-center justify-between">
                      {fact.value}
                      <svg className="h-5 w-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 text-emerald-600 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                  </Link>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-16 text-center">
                <span className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-8 block">Popular Searches</span>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {keywordHubLinks.slice(0, 8).map((link) => (
                    <Link key={link.label} href={link.href} className="group px-5 py-2.5 rounded-full bg-slate-50 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors tracking-wide border border-transparent hover:border-emerald-100">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage Map */}
        <section className="py-32 relative overflow-hidden bg-slate-900" id="coverage">
          {/* Natural exposure image without the heavy green overlay */}
          <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-normal" style={{ backgroundImage: 'url(/seattle.water.night.webp)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          
          <div className="mx-auto max-w-7xl px-6 relative z-10 text-center mt-12">
            <h2 className="text-4xl font-extrabold text-white mb-6 tracking-normal">
              Serving Sea-Tac, Seattle hotels, Bellevue, and the cruise terminals.
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed tracking-wide">
              Coverage includes the airport, downtown Seattle, Bellevue, waterfront hotels, and
              the cruise terminals travelers use most often.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
              {coverageLinks.map((area) => (
                <Link key={area.label} href={area.href} className="rounded-full bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-bold text-white border border-white/20 hover:bg-white hover:text-slate-950 transition-colors tracking-wide">
                  {area.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
