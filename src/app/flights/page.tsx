import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TravelProviderCards } from "@/components/travel-provider-cards";
import { buildCollectionPageJsonLd, buildSeatacMetadata } from "@/lib/seo";
import { getDateOffset } from "@/lib/travel/date-defaults";
import { getProvidersForVertical } from "@/lib/travel/provider-status";
import { SEA_AIRPORT } from "@/lib/travel/seattle";
import { searchSkyscannerFlights } from "@/lib/travel/skyscanner";

export const dynamic = "force-dynamic";

type FlightsPageProps = {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    departDate?: string;
    returnDate?: string;
    adults?: string;
    search?: string;
  }>;
};

export const metadata: Metadata = buildSeatacMetadata({
  title: "Flights from Sea-Tac | seatac.co",
  description:
    "Search flights to and from Seattle-Tacoma International Airport with Skyscanner-powered discovery and Sea-Tac-specific planning links.",
  path: "/flights",
});

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const params = await searchParams;
  const providers = getProvidersForVertical("flights");
  const origin = params.origin?.trim().toUpperCase() || SEA_AIRPORT.iata;
  const destination = params.destination?.trim().toUpperCase() || "";
  const departDate = params.departDate?.trim() || getDateOffset(14);
  const returnDate = params.returnDate?.trim() || "";
  const adults = Number.parseInt(params.adults ?? "1", 10);
  const shouldSearch = params.search === "1" && Boolean(destination);
  const result = shouldSearch
    ? await searchSkyscannerFlights({
        originIata: origin,
        destinationIata: destination,
        departDate,
        returnDate: returnDate || null,
        adults: Number.isFinite(adults) && adults > 0 ? adults : 1,
        cabinClass: "economy",
      })
    : null;

  const planningLinks = [
    { href: "/flight", label: "Flight status and airport transfer lookup" },
    { href: "/arrivals", label: "Sea-Tac arrivals guide" },
    { href: "/departures", label: "Sea-Tac departures guide" },
    { href: "/seatac-airport-hotels", label: "Sea-Tac airport hotel planning" },
    { href: "/rides", label: "Airport ride marketplace" },
  ];

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <JsonLd
          data={buildCollectionPageJsonLd(
            "Sea-Tac flights",
            "Flight shopping and Sea-Tac planning links for Seattle travelers.",
            "/flights",
            planningLinks.map((link) => ({ name: link.label, path: link.href })),
          )}
        />

        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
            Flights at Sea-Tac
          </p>
          <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.9rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
            Book flights without turning seatac.co into a ticket desk.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">
            Use Skyscanner-powered flight discovery for Sea-Tac trips, then connect into airport rides,
            hotels, and terminal planning from the same Seattle-first workflow.
          </p>

          <form className="mt-8 grid gap-3 rounded-[1.8rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-4 lg:grid-cols-5">
            <input type="hidden" name="search" value="1" />
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">Origin</span>
              <input
                type="text"
                name="origin"
                defaultValue={origin}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                Destination
              </span>
              <input
                type="text"
                name="destination"
                defaultValue={destination}
                placeholder="LAX"
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                Depart
              </span>
              <input
                type="date"
                name="departDate"
                defaultValue={departDate}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                Return
              </span>
              <input
                type="date"
                name="returnDate"
                defaultValue={returnDate}
                className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
              />
            </label>
            <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
              <label className="grid gap-2">
                <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                  Adults
                </span>
                <input
                  type="number"
                  name="adults"
                  min="1"
                  max="9"
                  defaultValue={adults}
                  className="h-12 rounded-[1rem] border border-[#2d6a4f]/20 bg-white px-4 text-base text-[#1a3d34] outline-none transition focus:border-[#2d6a4f]/45"
                />
              </label>
              <div className="flex items-end">
                <button type="submit" className="button-link primary h-12 whitespace-nowrap">
                  Search flights
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            {["LAX", "JFK", "LAS", "ANC"].map((sample) => (
              <Link
                key={sample}
                href={`/flights?search=1&origin=SEA&destination=${sample}&departDate=${getDateOffset(14)}`}
                className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-2 text-sm text-[#2d6a4f]"
              >
                SEA to {sample}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <TravelProviderCards providers={providers} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Flight offers</p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              Flight shopping runs through Skyscanner so seatac.co does not service tickets.
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
                            {offer.originIata} to {offer.destinationIata} on {offer.departDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-[#123b33]">
                            {offer.price ? `${offer.currency ?? "USD"} ${offer.price}` : "Live pricing on partner"}
                          </p>
                          {offer.carrierName ? (
                            <p className="text-sm text-[#5a7a6e]">{offer.carrierName}</p>
                          ) : null}
                        </div>
                      </div>
                      {offer.deepLinkUrl ? (
                        <div className="mt-4">
                          <Link href={offer.deepLinkUrl} className="button-link primary" target="_blank">
                            Continue to partner booking
                          </Link>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                  <p className="text-sm leading-7 text-[#5a7a6e]">
                    {result.meta.error ??
                      "No normalized live offers were returned yet. The handoff path is still ready."}
                  </p>
                  {result.meta.searchUrl ? (
                    <div className="mt-4">
                      <Link href={result.meta.searchUrl} className="button-link primary" target="_blank">
                        Open Skyscanner results
                      </Link>
                    </div>
                  ) : null}
                </div>
              )
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <p className="text-sm leading-7 text-[#5a7a6e]">
                  Search an airport pair to start the outsourced flight flow, then move into hotels,
                  rides, and airport planning from the same trip context.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Sea-Tac planning</p>
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
