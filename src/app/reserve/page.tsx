import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getClientAccountSnapshot } from "@/lib/client-auth";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import { getServerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReservePage() {
  const session = await getServerSession();
  const [vehicles, routes, settings, initialClientAccount] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
    session?.user ? getClientAccountSnapshot(session.user.id) : Promise.resolve(null),
  ]);
  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <ReserveWizard
          bookingConstraints={bookingConstraints}
          initialClientAccount={initialClientAccount}
          vehicles={vehicles}
          routes={routes}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
