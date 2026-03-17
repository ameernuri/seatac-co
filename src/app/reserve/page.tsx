import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";

export const dynamic = "force-dynamic";

export default async function ReservePage() {
  const [vehicles, routes, settings] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
  ]);
  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-18">
        <div className="mb-10 max-w-5xl">
          <p className="font-sans text-[0.76rem] uppercase tracking-[0.36em] text-primary/80">
            seatac.co reservations
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-[4.8rem] leading-[0.86] text-white md:text-[6.4rem]">
            <span className="text-primary">Airport-first</span> reservation for Sea-Tac rides,
            hotel transfers, and Seattle arrivals.
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-9 text-white/66">
            Start with the route, date, and pickup details, then send the trip straight into
            dispatch review. Use this page for airport pickups, departures, hotel transfers,
            Bellevue rides, and hourly airport-day schedules.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Sea-Tac transfers", "Hotel pickups", "Bellevue arrivals", "Hourly airport days"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/78"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
        <ReserveWizard
          bookingConstraints={bookingConstraints}
          vehicles={vehicles}
          routes={routes}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
