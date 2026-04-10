import type { Metadata } from "next";
import Link from "next/link";

import { searchBookingDemandHotels } from "@/lib/booking-demand";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TravelProviderCards } from "@/components/travel-provider-cards";
import { buildCollectionPageJsonLd, buildSeatacMetadata } from "@/lib/seo";
import { searchExpediaRapidRegions } from "@/lib/travel/expedia-rapid";
import { getDateOffset } from "@/lib/travel/date-defaults";
import { getProvidersForVertical } from "@/lib/travel/provider-status";

export const dynamic = "force-dynamic";

type HotelsPageProps = {
  searchParams: Promise<{
    destination?: string;
    checkin?: string;
    checkout?: string;
    adults?: string;
    rooms?: string;
    q?: string;
    search?: string;
  }>;
};

export const metadata: Metadata = buildSeatacMetadata({
  title: "Seattle and Sea-Tac hotels | seatac.co",
  description:
    "Search Seattle, SeaTac, Bellevue, and cruise-pre-stay hotels with Booking.com Demand rates and Expedia Rapid destination intelligence.",
  path: "/hotels",
});

export default async function HotelsPage({ searchParams }: HotelsPageProps) {
  const params = await searchParams;
  const providers = getProvidersForVertical("hotels");
  const destination = params.destination?.trim() || "Seattle";
  const checkin = params.checkin?.trim() || getDateOffset(14);
  const checkout = params.checkout?.trim() || getDateOffset(15);
  const adults = Number.parseInt(params.adults ?? "2", 10);
  const rooms = Number.parseInt(params.rooms ?? "1", 10);
  const query = params.q?.trim() || "";
  const shouldSearch = params.search === "1";
  const [hotelResults, expediaRapid] = shouldSearch
    ? await Promise.all([
        searchBookingDemandHotels({
          destination,
          checkin,
          checkout,
          adults: Number.isFinite(adults) && adults > 0 ? adults : 2,
          rooms: Number.isFinite(rooms) && rooms > 0 ? rooms : 1,
          query,
        }),
        searchExpediaRapidRegions(destination),
      ])
    : [null, null];

  const planningLinks = [
    { href: "/seatac-airport-hotels", label: "Sea-Tac airport hotels" },
    { href: "/seatac-airport-overnight-hotels", label: "Airport overnight hotels" },
    { href: "/seatac-to-cruise-pre-stay-hotels", label: "Cruise pre-stay hotels" },
    { href: "/seatac-to-downtown-seattle-hotels", label: "Downtown Seattle hotels" },
    { href: "/seatac-to-bellevue-hotels", label: "Bellevue hotel stays" },
  ];

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <JsonLd
          data={buildCollectionPageJsonLd(
            "Seattle and Sea-Tac hotels",
            "Hotel booking and stay-planning hub for Sea-Tac travelers.",
            "/hotels",
            planningLinks.map((link) => ({ name: link.label, path: link.href })),
          )}
        />

        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
            Seattle stays
          </p>
          <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.9rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
            Book hotels near Sea-Tac, downtown Seattle, Bellevue, and the cruise terminals.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">
            Live hotel rates come from Booking.com Demand today, while Expedia Rapid expands
            destination and inventory coverage as the broader hotel layer comes online.
          </p>

          <form className="mt-8 grid gap-3 rounded-[1.8rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-4 lg:grid-cols-7">
            <input type="hidden" name="search" value="1" />
            <label className="grid gap-2 lg:col-span-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                Destination
              </span>
              <input
                type="text"
                name="destination"
                defaultValue={destination}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                Check-in
              </span>
              <input
                type="date"
                name="checkin"
                defaultValue={checkin}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                Check-out
              </span>
              <input
                type="date"
                name="checkout"
                defaultValue={checkout}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Adults</span>
              <input
                type="number"
                name="adults"
                min="1"
                max="8"
                defaultValue={adults}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <div className="grid gap-2 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_auto]">
              <label className="grid gap-2">
                <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Hotel</span>
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Optional hotel name"
                  className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
                />
              </label>
              <div className="flex items-end">
                <button type="submit" className="button-link primary h-12 whitespace-nowrap">
                  Search hotels
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            {["SeaTac", "Seattle", "Bellevue", "Cruise pre-stay"].map((sample) => (
              <Link
                key={sample}
                href={`/hotels?search=1&destination=${encodeURIComponent(sample)}&checkin=${checkin}&checkout=${checkout}`}
                className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-2 text-sm text-[#2d6a4f]"
              >
                {sample}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <TravelProviderCards providers={providers} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Live hotel results</p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              Booking is redirected so seatac.co stays out of hotel servicing.
            </h2>

            {hotelResults ? (
              hotelResults.offers.length > 0 ? (
                <div className="mt-6 grid gap-4">
                  {hotelResults.offers.map((offer, index) => (
                    <article
                      key={`${offer.name}-${index}`}
                      className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[1.15rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                            {offer.name}
                          </h3>
                          <p className="mt-1 text-sm text-[#5a7a6e]">
                            {offer.neighborhood} stay from {offer.checkin} to {offer.checkout}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-[#123b33]">
                            {offer.currency ?? "USD"} {offer.totalPrice}
                          </p>
                          <p className="text-sm text-[#5a7a6e]">
                            {offer.currency ?? "USD"} {offer.nightlyRate} nightly
                          </p>
                        </div>
                      </div>
                      {offer.deepLinkUrl ? (
                        <div className="mt-4">
                          <Link href={offer.deepLinkUrl} className="button-link primary" target="_blank">
                            Continue to booking partner
                          </Link>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                  <p className="text-sm leading-7 text-[#5a7a6e]">
                    We could not load live hotel rates for this search. Try a different date,
                    adjust the destination, or call (206) 737-0808 for help planning the stay.
                  </p>
                </div>
              )
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <p className="text-sm leading-7 text-[#5a7a6e]">
                  Start a hotel search to load live partner rates for Seattle, SeaTac, Bellevue, or
                  cruise-pre-stay trips.
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
              <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
                Expedia Rapid
              </p>
              <h2 className="mt-3 text-[1.7rem] leading-[1.04] tracking-[-0.03em] text-[#1a3d34]">
                Destination intelligence for the broader Seattle hotel layer.
              </h2>
              {expediaRapid ? (
                expediaRapid.suggestions.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {expediaRapid.suggestions.map((suggestion) => (
                      <span
                        key={suggestion.id}
                        className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-3 py-2 text-xs text-[#2d6a4f]"
                      >
                        {suggestion.name} · {suggestion.type}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-7 text-[#5a7a6e]">
                    Destination suggestions are temporarily unavailable.
                  </p>
                )
              ) : (
                <p className="mt-5 text-sm leading-7 text-[#5a7a6e]">
                  Expedia Rapid sits behind this hub as the expansion path for more inventory and
                  deeper hotel operations.
                </p>
              )}
            </div>

            <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
              <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Hotel planning</p>
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
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
