import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TravelProviderCards } from "@/components/travel-provider-cards";
import { buildCollectionPageJsonLd, buildSeatacMetadata } from "@/lib/seo";
import { getDateTimeOffset } from "@/lib/travel/date-defaults";
import { getProvidersForVertical } from "@/lib/travel/provider-status";
import { SEA_AIRPORT } from "@/lib/travel/seattle";
import { searchTransferzRides } from "@/lib/travel/transferz";

export const dynamic = "force-dynamic";

type RidesPageProps = {
  searchParams: Promise<{
    pickup?: string;
    dropoff?: string;
    pickupAt?: string;
    passengers?: string;
    search?: string;
  }>;
};

export const metadata: Metadata = buildSeatacMetadata({
  title: "Airport and cruise rides | seatac.co",
  description:
    "Compare Sea-Tac ride options, including seatac.co private routes and Transferz-powered outsourced transfers.",
  path: "/rides",
});

export default async function RidesPage({ searchParams }: RidesPageProps) {
  const params = await searchParams;
  const providers = getProvidersForVertical("rides");
  const pickup = params.pickup?.trim() || SEA_AIRPORT.name;
  const dropoff = params.dropoff?.trim() || "Downtown Seattle";
  const pickupAt = params.pickupAt?.trim() || getDateTimeOffset(2, 10);
  const passengers = Number.parseInt(params.passengers ?? "2", 10);
  const shouldSearch = params.search === "1";
  const result = shouldSearch
    ? await searchTransferzRides({
        pickupLabel: pickup,
        dropoffLabel: dropoff,
        pickupAt,
        passengers: Number.isFinite(passengers) && passengers > 0 ? passengers : 2,
      })
    : null;

  const inHouseLinks = [
    { href: "/reserve", label: "Book a private seatac.co ride" },
    { href: "/seatac-to-downtown-seattle", label: "Sea-Tac to downtown Seattle" },
    { href: "/seatac-to-bellevue", label: "Sea-Tac to Bellevue" },
    { href: "/seatac-to-pier-66", label: "Sea-Tac to Pier 66" },
    { href: "/seatac-to-pier-91", label: "Sea-Tac to Pier 91" },
  ];

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <JsonLd
          data={buildCollectionPageJsonLd(
            "Sea-Tac rides",
            "Airport, hotel, and cruise transfer marketplace for Sea-Tac travelers.",
            "/rides",
            inHouseLinks.map((link) => ({ name: link.label, path: link.href })),
          )}
        />

        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
            Seattle rides
          </p>
          <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.9rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
            One ride hub for airport transfers, hotel pickups, and cruise terminal runs.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">
            Keep the premium private ride pages inside seatac.co, and use Transferz to widen coverage
            without taking on a larger dispatch operation.
          </p>

          <form className="mt-8 grid gap-3 rounded-[1.8rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-4 lg:grid-cols-5">
            <input type="hidden" name="search" value="1" />
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Pickup</span>
              <input
                type="text"
                name="pickup"
                defaultValue={pickup}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Drop-off</span>
              <input
                type="text"
                name="dropoff"
                defaultValue={dropoff}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:col-span-5">
              <label className="grid gap-2">
                <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                  Pickup time
                </span>
                <input
                  type="datetime-local"
                  name="pickupAt"
                  defaultValue={pickupAt}
                  className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                  Passengers
                </span>
                <input
                  type="number"
                  name="passengers"
                  min="1"
                  max="10"
                  defaultValue={passengers}
                  className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
                />
              </label>
              <div className="flex items-end">
                <button type="submit" className="button-link primary h-12 whitespace-nowrap">
                  Search rides
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="mt-8">
          <TravelProviderCards providers={providers} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Transferz marketplace</p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              Outsource general transfer fulfillment and keep premium direct routes in-house.
            </h2>
            {result ? (
              result.offers.length > 0 ? (
                <div className="mt-6 grid gap-4">
                  {result.offers.map((offer, index) => (
                    <article
                      key={`${offer.title}-${index}`}
                      className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[1.15rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                            {offer.title}
                          </h3>
                          <p className="mt-1 text-sm text-[#5a7a6e]">
                            {offer.pickupLabel} to {offer.dropoffLabel}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-[#123b33]">
                            {offer.totalPrice
                              ? `${offer.currency ?? "USD"} ${offer.totalPrice}`
                              : "Live provider pricing"}
                          </p>
                          {offer.vehicleType ? (
                            <p className="text-sm text-[#5a7a6e]">{offer.vehicleType}</p>
                          ) : null}
                        </div>
                      </div>
                      {offer.deepLinkUrl ? (
                        <div className="mt-4">
                          <Link href={offer.deepLinkUrl} className="button-link primary" target="_blank">
                            Continue to transfer booking
                          </Link>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                  <p className="text-sm leading-7 text-[#5a7a6e]">
                    Ride marketplace results are temporarily unavailable. Try again soon.
                  </p>
                </div>
              )
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <p className="text-sm leading-7 text-[#5a7a6e]">
                  Search a ride to compare marketplace transfers with seatac.co private routes.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Direct ride pages</p>
            <div className="mt-5 grid gap-4">
              {inHouseLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-[1.4rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-5 py-4 text-sm font-medium text-[#123b33] transition hover:border-[#2d6a4f]/20 hover:bg-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
