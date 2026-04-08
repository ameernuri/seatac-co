import { redirect } from "next/navigation";

import { AccountProfileForm } from "@/components/account-profile-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SeatacPrimaryButton } from "@/components/ui/seatac-primary-button";
import { getClientAccountSnapshot } from "@/lib/client-auth";
import { getClientProfileByUserId, getServerSession } from "@/lib/session";

export default async function AccountPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in?returnTo=/account");
  }

  const [profile, accountSnapshot] = await Promise.all([
    getClientProfileByUserId(session.user.id).catch(() => null),
    getClientAccountSnapshot(session.user.id).catch(() => null),
  ]);
  const [firstName = "", ...rest] = (session.user.name ?? "").trim().split(/\s+/);
  const lastName = rest.join(" ");

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="space-y-8 rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-4xl font-semibold leading-tight text-[#1a3d34]">Profile</h1>
            <SeatacPrimaryButton href="/account/bookings" className="px-5 py-3">
              My bookings
            </SeatacPrimaryButton>
          </div>
          <AccountProfileForm
            initialEmail={accountSnapshot?.email ?? session.user.email}
            initialEmailVerified={Boolean(
              accountSnapshot?.emailVerified ?? session.user.emailVerified,
            )}
            initialFirstName={firstName}
            initialLastName={lastName}
            initialPhone={profile?.phone ?? accountSnapshot?.phone ?? ""}
            initialPhoneVerified={Boolean(
              profile?.phoneVerifiedAt ?? accountSnapshot?.phoneVerifiedAt,
            )}
            initialSmsOptIn={Boolean(profile?.smsOptIn ?? accountSnapshot?.smsOptIn)}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
