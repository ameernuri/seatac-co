import type { Metadata } from"next";

import { JsonLd } from"@/components/json-ld";
import { ReserveWizard } from"@/components/reserve-wizard";
import { SiteFooter } from"@/components/site-footer";
import { SiteHeader } from"@/components/site-header";
import { normalizeBookingConstraints } from"@/lib/booking-constraints";
import { getClientAccountSnapshot } from"@/lib/client-auth";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from"@/lib/data";
import { env } from"@/env";
import {
 EXTRAS_CATALOG_KEY,
 getDefaultExtrasCatalog,
 getEnabledExtrasCatalog,
} from "@/lib/extras-catalog";
import {
 buildReserveUrlPath,
 parseReserveUrlState,
 summarizeReserveLocations,
 type ReserveUrlState,
} from "@/lib/reserve-url-state";
import { buildCollectionPageJsonLd, buildSeatacMetadata } from"@/lib/seo";
import { getClientProfileByUserId, getServerSession } from"@/lib/session";

export const dynamic ="force-dynamic";

type ReservePageProps = {
 searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildReservePageMetadata(state: ReserveUrlState) {
 const { from, to } = summarizeReserveLocations(state);
 const path = buildReserveUrlPath(state);

 if (from && to) {
 return buildSeatacMetadata({
 title: `Reserve a ride from ${from} to ${to} | seatac.co`,
 description: `Reserve a private ride from ${from} to ${to} with live vehicle options, route timing, and online checkout.`,
 path,
 });
 }

 if (to) {
 return buildSeatacMetadata({
 title: `Reserve a ride to ${to} | seatac.co`,
 description: `Reserve a private ride to ${to} with live vehicle options, route timing, and online checkout.`,
 path,
 });
 }

 return buildSeatacMetadata({
 title:"Reserve a Sea-Tac airport or cruise terminal ride | seatac.co",
 description:"Book a private ride for Sea-Tac airport arrivals, airport departures, Pier 66, Pier 91, downtown Seattle hotels, Bellevue, Redmond, and Eastside pickups.",
 path,
 });
}

type SessionUserWithPhone = {
 id: string;
 name: string;
 email: string;
 emailVerified: boolean;
 phoneNumber?: string | null;
 phoneNumberVerified?: boolean | null;
};

export async function generateMetadata({
 searchParams,
}: ReservePageProps): Promise<Metadata> {
 return buildReservePageMetadata(parseReserveUrlState(await searchParams));
}

export default async function ReservePage({ searchParams }: ReservePageProps) {
 const reserveUrlState = parseReserveUrlState(await searchParams);
 const session = await getServerSession();
 const [vehicles, routes, settings, accountSnapshot, clientProfile] = await Promise.all([
 getActiveVehicles(env.siteSlug),
 getActiveRoutes(env.siteSlug),
 getSettingsMap(env.siteSlug),
 session?.user ? getClientAccountSnapshot(session.user.id).catch(() => null) : Promise.resolve(null),
 session?.user ? getClientProfileByUserId(session.user.id).catch(() => null) : Promise.resolve(null),
 ]);
 const bookingConstraints = normalizeBookingConstraints(settings.bookingConstraints);
 const extrasCatalog = getEnabledExtrasCatalog(
 settings[EXTRAS_CATALOG_KEY],
 getDefaultExtrasCatalog(env.siteSlug),
 );
 const sessionUser = session?.user as SessionUserWithPhone | undefined;
 const { from, to } = summarizeReserveLocations(reserveUrlState);
 const reservePath = buildReserveUrlPath(reserveUrlState);
 const pageTitle =
 from && to
 ? `Reserve ${from} to ${to}.`
 : to
 ? `Reserve a ride to ${to}.`
 : "Reserve a Sea-Tac ride.";
 const pageBody =
 from && to
 ? `Book a direct private car from ${from} to ${to} with live vehicle pricing and route-specific timing.`
 : to
 ? `Book a direct private car to ${to} with live vehicle pricing and route-specific timing.`
 : "Book a direct private car for Sea-Tac arrivals, airport departures, Pier 66, Pier 91, downtown Seattle hotels, Bellevue, Redmond, and Eastside pickups.";
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
 data={buildCollectionPageJsonLd("Reserve Sea-Tac rides","Private ride booking for Sea-Tac airport, Seattle cruise terminals, downtown hotels, Bellevue, Redmond, and Eastside pickups.",reservePath,
 [
 { name:"Sea-Tac airport rides", path:"/seatac-airport-car-service"},
 { name:"Sea-Tac to Pier 66", path:"/seatac-to-pier-66"},
 { name:"Sea-Tac to Pier 91", path:"/seatac-to-pier-91"},
 { name:"Sea-Tac to Bellevue", path:"/seatac-to-bellevue"},
 ],
 )}
 />

        <section className="mb-10 hidden md:block">
          <div className="max-w-3xl">
            <p className="text-[0.76rem] font-bold uppercase tracking-[0.34em] text-[#2d6a4f]">
              Private ride reservation
            </p>
            <h1 className="mt-4 text-[clamp(3rem,5vw,5rem)] leading-[0.95] text-[#1a3d34]">
              {pageTitle}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#5a7a6e]">
              {pageBody}
            </p>
          </div>
        </section>

 <ReserveWizard
 bookingConstraints={bookingConstraints}
 extrasCatalog={extrasCatalog}
 initialState={reserveUrlState}
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
