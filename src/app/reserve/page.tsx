import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";
import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getClientAccountSnapshot } from "@/lib/client-auth";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import { buildCollectionPageJsonLd, buildSeatacMetadata } from "@/lib/seo";
import { getClientProfileByUserId, getServerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildSeatacMetadata({
  title: "Reserve a Sea-Tac airport or cruise terminal ride | seatac.co",
  description:
    "Book a private ride for Sea-Tac airport arrivals, airport departures, Pier 66, Pier 91, downtown Seattle hotels, Bellevue, Redmond, and Eastside pickups.",
  path: "/reserve",
});

type SessionUserWithPhone = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
};

export default async function ReservePage() {
  const session = await getServerSession();
  const [vehicles, routes, settings, accountSnapshot, clientProfile] = await Promise.all([
    getActiveVehicles(env.siteSlug),
    getActiveRoutes(env.siteSlug),
    getSettingsMap(env.siteSlug),
    session?.user ? getClientAccountSnapshot(session.user.id).catch(() => null) : Promise.resolve(null),
    session?.user ? getClientProfileByUserId(session.user.id).catch(() => null) : Promise.resolve(null),
  ]);
  const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);
  const sessionUser = session?.user as SessionUserWithPhone | undefined;
  const initialClientAccount = session?.user
    ? {
        userId: session.user.id,
        name: accountSnapshot?.name ?? session.user.name,
        email: accountSnapshot?.email ?? session.user.email,
        emailVerified: accountSnapshot?.emailVerified ?? session.user.emailVerified,
        phone:
          clientProfile?.phone ??
          accountSnapshot?.phone ??
          sessionUser?.phoneNumber ??
          null,
        phoneVerifiedAt:
          clientProfile?.phoneVerifiedAt ??
          accountSnapshot?.phoneVerifiedAt ??
          (sessionUser?.phoneNumberVerified ? new Date(0) : null),
        policyAgreedAt:
          clientProfile?.policyAgreedAt ?? accountSnapshot?.policyAgreedAt ?? null,
        smsOptIn:
          clientProfile?.smsOptIn ??
          accountSnapshot?.smsOptIn ??
          false,
      }
    : null;

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <JsonLd
          data={buildCollectionPageJsonLd(
            "Reserve Sea-Tac rides",
            "Private ride booking for Sea-Tac airport, Seattle cruise terminals, downtown hotels, Bellevue, Redmond, and Eastside pickups.",
            "/reserve",
            [
              { name: "Sea-Tac airport rides", path: "/seatac-airport-car-service" },
              { name: "Sea-Tac to Pier 66", path: "/seatac-to-pier-66" },
              { name: "Sea-Tac to Pier 91", path: "/seatac-to-pier-91" },
              { name: "Sea-Tac to Bellevue", path: "/seatac-to-bellevue" },
            ],
          )}
        />

        <section className="mb-8 overflow-hidden rounded-[2.4rem] border border-[#2d6a4f]/10 bg-white shadow-[0_4px_24px_rgba(45,106,79,0.06)]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="px-6 py-8 lg:px-10 lg:py-12">
              <p className="text-[0.76rem] font-bold uppercase tracking-[0.34em] text-[#2d6a4f]">
                Private ride reservation
              </p>
              <h1 className="mt-4 max-w-3xl text-[clamp(3rem,5.2vw,5.8rem)] leading-[0.9] tracking-[-0.055em] text-[#123b33]">
                Reserve a Sea-Tac ride.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5a7a6e]">
                Book a direct private car for Sea-Tac arrivals, airport departures, Pier 66,
                Pier 91, downtown Seattle hotels, Bellevue, Redmond, and Eastside pickups.
              </p>
            </div>

            <div className="grid content-center gap-3 border-t border-[#2d6a4f]/10 bg-[#f8f7f4] p-6 lg:border-l lg:border-t-0 lg:p-8">
              {[
                "Sea-Tac airport pickups",
                "Airport departures",
                "Pier 66 and Pier 91 transfers",
                "Downtown, Bellevue, and Redmond",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.2rem] border border-[#2d6a4f]/10 bg-white px-4 py-3 text-sm font-semibold text-[#123b33]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <ReserveWizard
          bookingConstraints={bookingConstraints}
          initialClientAccount={initialClientAccount}
          vehicles={vehicles}
          routes={routes}
          showTitle={false}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
