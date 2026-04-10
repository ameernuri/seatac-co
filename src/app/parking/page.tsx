import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TravelProviderCards } from "@/components/travel-provider-cards";
import { buildCollectionPageJsonLd, buildSeatacMetadata } from "@/lib/seo";
import { getDateTimeOffset } from "@/lib/travel/date-defaults";
import { searchParkWhizParking } from "@/lib/travel/parkwhiz";
import { getProvidersForVertical } from "@/lib/travel/provider-status";
import { SEATAC_PARKING } from "@/lib/travel/seattle";

export const dynamic = "force-dynamic";

type ParkingPageProps = {
  searchParams: Promise<{
    startsAt?: string;
    endsAt?: string;
    search?: string;
  }>;
};

export const metadata: Metadata = buildSeatacMetadata({
  title: "Sea-Tac parking | seatac.co",
  description:
    "Compare Sea-Tac parking inventory through ParkWhiz and connect it with airport, hotel, and ride planning.",
  path: "/parking",
});

export default async function ParkingPage({ searchParams }: ParkingPageProps) {
  const params = await searchParams;
  const providers = getProvidersForVertical("parking");
  const startsAt = params.startsAt?.trim() || getDateTimeOffset(5, 10);
  const endsAt = params.endsAt?.trim() || getDateTimeOffset(8, 10);
  const shouldSearch = params.search === "1";
  const result = shouldSearch
    ? await searchParkWhizParking({
        locationLabel: SEATAC_PARKING.label,
        latitude: SEATAC_PARKING.latitude,
        longitude: SEATAC_PARKING.longitude,
        startsAt,
        endsAt,
      })
    : null;

  const planningLinks = [
    { href: "/seatac-parking-guide", label: "Sea-Tac parking guide" },
    { href: "/departures", label: "Departures planning" },
    { href: "/flights", label: "Book flights" },
    { href: "/rides", label: "Reserve a ride instead of parking" },
  ];

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <JsonLd
          data={buildCollectionPageJsonLd(
            "Sea-Tac parking",
            "Parking search and booking hub for Seattle-Tacoma International Airport travelers.",
            "/parking",
            planningLinks.map((link) => ({ name: link.label, path: link.href })),
          )}
        />

        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Sea-Tac parking</p>
          <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.9rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
            Compare parking near Sea-Tac before you book your airport trip.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">
            Search parking options, compare entry and exit timing, and choose the lot that fits your
            terminal, trip length, and airport schedule.
          </p>

          <form className="mt-8 grid gap-3 rounded-[1.8rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <input type="hidden" name="search" value="1" />
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Entry time</span>
              <input
                type="datetime-local"
                name="startsAt"
                defaultValue={startsAt}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Exit time</span>
              <input
                type="datetime-local"
                name="endsAt"
                defaultValue={endsAt}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className="button-link primary h-12 whitespace-nowrap">
                Search parking
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8">
          <TravelProviderCards providers={providers} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Live parking options</p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              Compare parking options near Sea-Tac for your travel window.
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
                          <p className="mt-1 text-sm text-[#5a7a6e]">{offer.locationLabel}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-[#123b33]">
                            {offer.totalPrice
                              ? `${offer.currency ?? "USD"} ${offer.totalPrice}`
                              : "Live provider pricing"}
                          </p>
                          {offer.distanceMiles !== null && offer.distanceMiles !== undefined ? (
                            <p className="text-sm text-[#5a7a6e]">{offer.distanceMiles} miles away</p>
                          ) : null}
                        </div>
                      </div>
                      {offer.deepLinkUrl ? (
                        <div className="mt-4">
                          <Link href={offer.deepLinkUrl} className="button-link primary" target="_blank">
                            Continue to parking booking
                          </Link>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                  <p className="text-sm leading-7 text-[#5a7a6e]">
                    Parking results are temporarily unavailable. Try another time or check back soon.
                  </p>
                </div>
              )
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <p className="text-sm leading-7 text-[#5a7a6e]">
                  Search a parking window to compare options near the airport.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Parking context</p>
            <div className="mt-5 grid gap-4">
              {planningLinks.map((link) => (
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
