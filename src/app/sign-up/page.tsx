import Link from "next/link";

import { ClientAccountForm } from "@/components/client-account-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SeatacPrimaryButton } from "@/components/ui/seatac-primary-button";
import { getServerSession } from "@/lib/session";

type Props = {
  searchParams?: Promise<{
    returnTo?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const returnTo = params.returnTo || "/reserve?resume=1";
  const session = await getServerSession();

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="font-sans text-4xl font-semibold leading-tight text-[#1a3d34]">
              Create Account
            </h1>
          </div>
          {session?.user ? (
            <div className="space-y-5 rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[#1a3d34]">You are already signed in.</h2>
                <p className="text-base leading-7 text-[#5a7a6e]">
                  Continue to your reservation or keep using seatac.co with your saved account.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <SeatacPrimaryButton href={returnTo} className="h-11 px-5">
                  Continue
                </SeatacPrimaryButton>
                <Link
                  href="/reserve"
                  className="booking-secondary-button inline-flex h-11 items-center justify-center rounded-full px-5"
                >
                  Reserve a ride
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-8">
              <ClientAccountForm compact returnTo={returnTo} />
              <div className="text-sm text-[#5a7a6e]">
                Already have an account?{" "}
                <Link href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`} className="text-[#0d5c48] underline underline-offset-4">
                  Sign in
                </Link>
                .
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
