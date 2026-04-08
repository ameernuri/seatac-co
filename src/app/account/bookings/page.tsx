import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SeatacPrimaryButton } from "@/components/ui/seatac-primary-button";
import { getBookingsForUser } from "@/lib/account-bookings";
import { centsToDollars, formatCurrency, formatDateTime } from "@/lib/format";
import { getServerSession } from "@/lib/session";

export default async function AccountBookingsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/sign-in?returnTo=/account/bookings");
  }

  const { upcoming, past } = await getBookingsForUser(session.user.id);

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[0.76rem] uppercase tracking-[0.32em] text-[#5a7a6e]">
                Account
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-[#1a3d34]">
                My bookings
              </h1>
            </div>
            <SeatacPrimaryButton href="/reserve" emphasis="cta" className="px-5 py-3">
              Book another ride
            </SeatacPrimaryButton>
          </div>

          {upcoming.length === 0 && past.length === 0 ? (
            <div className="rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-8 text-[#5a7a6e]">
              No bookings yet.
            </div>
          ) : null}

          {upcoming.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-[0.76rem] uppercase tracking-[0.32em] text-[#5a7a6e]">
                Upcoming
              </h2>
              <div className="grid gap-4">
                {upcoming.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-[1.8rem] border border-[#2d6a4f]/10 bg-white p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                          {booking.reference}
                        </p>
                        <h3 className="text-2xl font-semibold text-[#1a3d34]">
                          {booking.routeName ?? `${booking.pickupLabel} to ${booking.dropoffLabel ?? "destination"}`}
                        </h3>
                        <div className="space-y-1 text-sm leading-6 text-[#5a7a6e]">
                          <p>Pickup {formatDateTime(booking.pickupAt)}</p>
                          <p>{booking.vehicleName}</p>
                          <p>{formatCurrency(centsToDollars(booking.totalCents))}</p>
                        </div>
                      </div>
                      <SeatacPrimaryButton
                        href={`/account/bookings/${encodeURIComponent(booking.reference)}`}
                        className="px-5 py-3"
                      >
                        Manage booking
                      </SeatacPrimaryButton>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {past.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-[0.76rem] uppercase tracking-[0.32em] text-[#5a7a6e]">
                Past
              </h2>
              <div className="grid gap-4">
                {past.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-[1.8rem] border border-[#2d6a4f]/10 bg-white p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                          {booking.reference}
                        </p>
                        <h3 className="text-2xl font-semibold text-[#1a3d34]">
                          {booking.routeName ?? `${booking.pickupLabel} to ${booking.dropoffLabel ?? "destination"}`}
                        </h3>
                        <div className="space-y-1 text-sm leading-6 text-[#5a7a6e]">
                          <p>Pickup {formatDateTime(booking.pickupAt)}</p>
                          <p>{booking.vehicleName}</p>
                          <p>{formatCurrency(centsToDollars(booking.totalCents))}</p>
                        </div>
                      </div>
                      <Link
                        href={`/account/bookings/${encodeURIComponent(booking.reference)}`}
                        className="inline-flex h-12 items-center justify-center rounded-full border border-[#d7e6de] px-5 text-sm font-semibold text-[#1a3d34] transition-colors hover:bg-[#f4faf7]"
                      >
                        View details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
