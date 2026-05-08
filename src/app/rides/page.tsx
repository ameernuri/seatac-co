import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import { buildCollectionPageJsonLd, buildSeatacMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildSeatacMetadata({
  title: "Book a Sea-Tac airport or cruise terminal ride | seatac.co",
  description:
    "Reserve a private Sea-Tac airport ride for arrivals, departures, Seattle cruise terminals, downtown hotels, Bellevue, Redmond, and Eastside pickups.",
  path: "/rides",
});

const targetRoutes = [
  {
    label: "Sea-Tac arrivals",
    title: "Airport pickup after landing",
    body: "Reserve a private ride from Sea-Tac to Seattle hotels, Bellevue, Redmond, Kirkland, or the cruise terminals.",
    href: "/seatac-airport-car-service",
  },
  {
    label: "Sea-Tac departures",
    title: "Hotel or home pickup to SEA",
    body: "Book the pickup window you need for early flights, luggage-heavy departures, and direct airport drop-offs.",
    href: "/seatac-to-downtown-seattle",
  },
  {
    label: "Cruise terminals",
    title: "Pier 66 and Pier 91 transfers",
    body: "Private ride service between Sea-Tac, downtown hotels, Bell Street Pier 66, and Smith Cove Pier 91.",
    href: "/seatac-to-pier-66",
  },
  {
    label: "Eastside rides",
    title: "Bellevue, Redmond, and Kirkland",
    body: "Targeted private rides for Eastside hotel stays, business trips, office visits, and airport returns.",
    href: "/seatac-to-bellevue",
  },
] as const;

const bookingIntents = [
  "Sea-Tac airport pickups",
  "Sea-Tac airport departures",
  "Pier 66 cruise transfers",
  "Pier 91 cruise transfers",
  "Downtown Seattle hotels",
  "Bellevue and Redmond rides",
] as const;

export default async function RidesPage() {
  const [vehicles, routes, settings] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
  ]);
  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-10 lg:px-8 lg:py-14">
        <JsonLd
          data={buildCollectionPageJsonLd(
            "Book Sea-Tac rides",
            "Private airport and cruise terminal ride booking for Sea-Tac travelers.",
            "/rides",
            targetRoutes.map((route) => ({ name: route.title, path: route.href })),
          )}
        />

        <section className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:sticky lg:top-6 lg:px-8 lg:py-10">
            <p className="text-[0.76rem] font-bold uppercase tracking-[0.34em] text-[#2d6a4f]">
              Private ride booking
            </p>
            <h1 className="mt-4 text-[clamp(3rem,5.3vw,5.6rem)] leading-[0.9] tracking-[-0.055em] text-[#123b33]">
              Book a Sea-Tac ride or cruise transfer.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#5a7a6e]">
              Reserve direct private transportation for Sea-Tac arrivals, airport departures,
              Seattle cruise terminals, downtown hotels, Bellevue, Redmond, and Eastside pickups.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {bookingIntents.map((intent) => (
                <div
                  key={intent}
                  className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3 text-sm font-semibold text-[#123b33]"
                >
                  {intent}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#book" className="button-link primary">
                Reserve online
              </Link>
              <Link href="tel:+12067370808" className="button-link secondary">
                Call dispatch
              </Link>
            </div>
          </div>

          <div id="book" className="scroll-mt-6 rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white p-4 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:p-6">
            <div className="mb-5 px-2 pt-2">
              <p className="text-[0.76rem] font-bold uppercase tracking-[0.34em] text-[#2d6a4f]">
                Hold your pickup window
              </p>
              <h2 className="mt-2 text-3xl leading-[0.95] tracking-[-0.04em] text-[#123b33] md:text-4xl">
                Choose the route, time, and vehicle. Checkout reserves the ride.
              </h2>
            </div>
            <ReserveWizard
              bookingConstraints={bookingConstraints}
              vehicles={vehicles}
              routes={routes}
              showTitle={false}
            />
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {targetRoutes.map((route) => (
            <Link
              key={route.label}
              href={route.href}
              className="rounded-[1.8rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_18px_rgba(45,106,79,0.05)] transition hover:-translate-y-0.5 hover:border-[#2d6a4f]/20 hover:shadow-[0_10px_32px_rgba(45,106,79,0.1)]"
            >
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-[#2d6a4f]">
                {route.label}
              </span>
              <h3 className="mt-4 text-2xl leading-[1] tracking-[-0.04em] text-[#123b33]">
                {route.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#5a7a6e]">{route.body}</p>
            </Link>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
