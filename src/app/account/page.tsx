import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getClientProfileByUserId, getServerSession } from "@/lib/session";

export default async function AccountPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in?returnTo=/account");
  }

  const profile = await getClientProfileByUserId(session.user.id);
  const [firstName = "", ...rest] = (session.user.name ?? "").trim().split(/\s+/);
  const lastName = rest.join(" ");

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="space-y-8 rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-8">
          <h1 className="text-4xl font-semibold leading-tight text-[#1a3d34]">Profile</h1>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7a6e]">First name</p>
              <div className="rounded-[1.7rem] border border-[#d7e6de] bg-white px-5 py-4 text-[#1a3d34]">
                {firstName || "—"}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7a6e]">Last name</p>
              <div className="rounded-[1.7rem] border border-[#d7e6de] bg-white px-5 py-4 text-[#1a3d34]">
                {lastName || "—"}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7a6e]">Email</p>
              <div className="rounded-[1.7rem] border border-[#d7e6de] bg-white px-5 py-4 text-[#1a3d34]">
                {session.user.email}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7a6e]">Mobile number</p>
              <div className="rounded-[1.7rem] border border-[#d7e6de] bg-white px-5 py-4 text-[#1a3d34]">
                {profile?.phone || "—"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/reserve"
              className="booking-primary-button inline-flex h-11 items-center justify-center rounded-full px-5"
            >
              Book ride
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
