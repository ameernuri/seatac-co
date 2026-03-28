import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { getReserveSuccessState, isStripeConfigured } from "@/lib/stripe";

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

  const result = await getReserveSuccessState(sessionId);

  if (!result) {
    redirect("/reserve");
  }

  const isConfirmed = result.viewState === "confirmed";
  const total = result.session.amountTotal;

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <Card className="rounded-[2rem] border border-primary/15 bg-white shadow-[0_8px_40px_rgba(45,106,79,0.12)]">
          <CardContent className="space-y-8 p-8 lg:p-10">
            <div className="space-y-4">
              <p className="font-sans text-[0.76rem] uppercase tracking-[0.35em] text-primary/80">
                {isConfirmed ? "Payment confirmed" : "Checkout still open"}
              </p>
              <h1 className="font-display text-4xl leading-[0.95] text-foreground md:text-5xl">
                {isConfirmed
                  ? "Your reservation is paid and confirmed."
                  : "Your reservation is saved, but payment is not complete yet."}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                {isConfirmed
                  ? "We recorded the payment and confirmed the booking. Keep the reference below for airport pickup updates or trip edits."
                  : "We found the booking draft, but Stripe still reports the checkout as unpaid. Resume payment below or start a new reservation if you closed checkout by mistake."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-primary/15 bg-primary/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Reference</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">{result.booking.reference}</p>
              </div>
              <div className="rounded-[1.5rem] border border-primary/15 bg-primary/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {isConfirmed ? "Total paid" : "Checkout total"}
                </p>
                <p className="mt-3 text-2xl font-semibold text-foreground">{formatCurrency(total)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-primary/15 bg-primary/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Service</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">{result.booking.vehicleName}</p>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-primary/15 bg-primary/[0.04] p-6 text-foreground/80">
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-muted-foreground">Route:</span> {result.booking.routeName}
                </div>
                <div>
                  <span className="text-muted-foreground">Passenger:</span> {result.booking.customerName}
                </div>
                <div>
                  <span className="text-muted-foreground">Contact:</span> {result.booking.contact}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isConfirmed && result.session.url ? (
                <Link
                  href={result.session.url}
                  className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  Resume payment
                </Link>
              ) : null}
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Back to seatac.co
              </Link>
              <Link
                href="/reserve"
                className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold border border-primary/25 bg-primary/[0.06] text-foreground hover:bg-primary/[0.1] transition-colors"
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
