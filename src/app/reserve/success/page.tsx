import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { isStripeConfigured, syncStripeCheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function ReserveSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId || !isStripeConfigured()) {
    redirect("/reserve");
  }

  const { booking, session } = await syncStripeCheckoutSession(sessionId);

  if (!booking) {
    redirect("/reserve");
  }

  const total = typeof session.amount_total === "number" ? session.amount_total / 100 : 0;

  return (
    <div className="site-shell theme-pierlimo min-h-screen" data-booking-theme="pierlimo">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <Card className="rounded-[2rem] border-white/8 bg-white/[0.03] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
          <CardContent className="space-y-8 p-8 lg:p-10">
            <div className="space-y-4">
              <p className="font-sans text-[0.76rem] uppercase tracking-[0.35em] text-primary/80">
                Payment confirmed
              </p>
              <h1 className="font-display text-5xl leading-[0.92] text-white md:text-6xl">
                Your reservation is paid and queued for dispatch.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-white/66">
                We recorded the payment and confirmed the booking in dispatch. Keep the reference
                below for any airport pickup updates or trip edits.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/8 bg-black/25 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/44">Reference</p>
                <p className="mt-3 text-2xl font-semibold text-white">{booking.reference}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-black/25 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/44">Total paid</p>
                <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(total)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-black/25 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/44">Service</p>
                <p className="mt-3 text-2xl font-semibold text-white">{booking.vehicleName}</p>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/8 bg-black/25 p-6 text-white/72">
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-white/48">Route:</span> {booking.routeName}
                </div>
                <div>
                  <span className="text-white/48">Passenger:</span> {booking.customerName}
                </div>
                <div>
                  <span className="text-white/48">Contact:</span> {booking.customerEmail}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="booking-primary-button inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-[#111]"
              >
                Back to seatac.co
              </Link>
              <Link
                href="/reserve"
                className="booking-secondary-button inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold"
              >
                Create another reservation
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
