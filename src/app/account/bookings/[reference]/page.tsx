import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountBookingDetailForm } from "@/components/account-booking-detail-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SeatacPrimaryButton } from "@/components/ui/seatac-primary-button";
import { getBookingForUser } from "@/lib/account-bookings";
import {
  formatBookingLocation,
  formatBookingReference,
  formatBookingRoute,
} from "@/lib/booking-display";
import { centsToDollars, formatCurrency, formatDateTime } from "@/lib/format";
import { getServerSession } from "@/lib/session";
import { getVehicleDisplayName } from "@/lib/vehicle-display";

type Props = {
  params: Promise<{
    reference: string;
  }>;
};

export default async function AccountBookingPage({ params }: Props) {
  const session = await getServerSession();

  if (!session?.user) {
    const { reference } = await params;
    redirect(`/sign-in?returnTo=/account/bookings/${encodeURIComponent(reference)}`);
  }

  const { reference } = await params;
  const booking = await getBookingForUser(session.user.id, reference);

  if (!booking) {
    redirect("/account/bookings");
  }

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[0.76rem] uppercase tracking-[0.32em] text-[#5a7a6e]">
                Booking
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-[#1a3d34]">
                {formatBookingReference(booking.reference)}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/account/bookings"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#d7e6de] px-5 text-sm font-semibold text-[#1a3d34] transition-colors hover:bg-[#f4faf7]"
              >
                Back to bookings
              </Link>
              <SeatacPrimaryButton href="/reserve" emphasis="cta" className="px-5 py-3">
                Book another ride
              </SeatacPrimaryButton>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <div className="space-y-6">
              <div className="rounded-[1.8rem] border border-[#2d6a4f]/10 bg-white p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                      Status
                    </p>
                    <p className="text-lg font-semibold capitalize text-[#1a3d34]">
                      {booking.status}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                      Total
                    </p>
                    <p className="text-lg font-semibold text-[#1a3d34]">
                      {formatCurrency(centsToDollars(booking.totalCents))}
                    </p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                      Route
                    </p>
                    <p className="text-lg font-semibold text-[#1a3d34]">
                      {formatBookingRoute(booking)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                      Pickup
                    </p>
                    <p className="text-lg font-semibold text-[#1a3d34]">
                      {formatDateTime(booking.pickupAt)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                      Vehicle
                    </p>
                    <p className="text-lg font-semibold text-[#1a3d34]">
                      {getVehicleDisplayName(booking.vehicleName)}
                    </p>
                  </div>
                </div>
              </div>

              <AccountBookingDetailForm
                bookingReference={booking.reference}
                initialSmsOptIn={booking.customerSmsOptIn}
                initialSpecialInstructions={booking.specialInstructions ?? ""}
              />
            </div>

            <aside className="space-y-6 rounded-[1.8rem] border border-[#2d6a4f]/10 bg-white p-6">
              <div className="space-y-4 text-sm leading-7 text-[#5a7a6e]">
                <div>
                  <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                    Pickup address
                  </p>
                  <p className="mt-1 font-medium text-[#1a3d34]">
                    {formatBookingLocation(booking.pickupLabel || booking.pickupAddress) ||
                      booking.pickupAddress}
                  </p>
                </div>
                {booking.dropoffAddress ? (
                  <div>
                    <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                      Drop-off address
                    </p>
                    <p className="mt-1 font-medium text-[#1a3d34]">
                      {formatBookingLocation(booking.dropoffLabel || booking.dropoffAddress) ||
                        booking.dropoffAddress}
                    </p>
                  </div>
                ) : null}
                <div>
                  <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
                    Contact
                  </p>
                  <p className="mt-1 font-medium text-[#1a3d34]">{booking.customerPhone}</p>
                  <p className="font-medium text-[#1a3d34]">{booking.customerEmail}</p>
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-[#2d6a4f]/10 bg-[#f7faf8] p-5 text-sm leading-6 text-[#5a7a6e]">
                Need route or timing changes? Call dispatch and reference <span className="font-semibold text-[#1a3d34]">{formatBookingReference(booking.reference)}</span>.
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
