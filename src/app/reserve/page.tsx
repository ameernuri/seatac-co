import { ReserveWizard } from "@/components/reserve-wizard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { normalizeBookingConstraints } from "@/lib/booking-constraints";
import { getClientAccountSnapshot } from "@/lib/client-auth";
import { getActiveRoutes, getActiveVehicles, getSettingsMap } from "@/lib/data";
import { env } from "@/env";
import { getClientProfileByUserId, getServerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

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
