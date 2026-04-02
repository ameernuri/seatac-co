import Link from "next/link";

import { ClientSignInForm } from "@/components/client-sign-in-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getServerSession } from "@/lib/session";

type Props = {
  searchParams?: Promise<{
    returnTo?: string;
  }>;
};

export default async function SignInPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const returnTo = params.returnTo || "/reserve?resume=1";
  const session = await getServerSession();

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
        {session?.user ? (
          <div className="rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-[#1a3d34]">You are already signed in.</h1>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={returnTo}
                className="booking-primary-button inline-flex h-11 items-center justify-center rounded-full px-5"
              >
                Continue
              </Link>
              <Link
                href="/reserve"
                className="booking-secondary-button inline-flex h-11 items-center justify-center rounded-full px-5"
              >
                Reserve a ride
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-8">
            <ClientSignInForm returnTo={returnTo} />
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
