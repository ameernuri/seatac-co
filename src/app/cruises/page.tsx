import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TravelProviderCards } from "@/components/travel-provider-cards";
import { buildCollectionPageJsonLd, buildSeatacMetadata } from "@/lib/seo";
import { getSeattleCruiseSchedule } from "@/lib/travel/cruise-tracking";
import { getProvidersForVertical } from "@/lib/travel/provider-status";
import { SEATTLE_CRUISE_TERMINALS } from "@/lib/travel/seattle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildSeatacMetadata({
  title: "Seattle cruise arrivals and departures | seatac.co",
  description:
    "Track Seattle cruise arrivals and departures, then move directly into Sea-Tac rides, hotel stays, and terminal planning.",
  path: "/cruises",
});

export default async function CruisesPage() {
  const providers = getProvidersForVertical("cruises");
  const cruiseSchedule = await getSeattleCruiseSchedule();
  const planningLinks = [
    { href: "/bell-street-cruise-terminal-pier-66", label: "Pier 66 terminal guide" },
    { href: "/smith-cove-cruise-terminal-pier-91", label: "Pier 91 terminal guide" },
    { href: "/seatac-to-pier-66", label: "Sea-Tac to Pier 66 ride" },
    { href: "/seatac-to-pier-91", label: "Sea-Tac to Pier 91 ride" },
    { href: "/seatac-to-cruise-pre-stay-hotels", label: "Cruise pre-stay hotels" },
  ];

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <JsonLd
          data={buildCollectionPageJsonLd(
            "Seattle cruises",
            "Cruise terminal and sailing-planning hub for Seattle and Sea-Tac travelers.",
            "/cruises",
            planningLinks.map((link) => ({ name: link.label, path: link.href })),
          )}
        />

        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Seattle cruises</p>
          <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.9rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
            Track Seattle cruise traffic and connect it to rides, hotels, and airport timing.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">
            Cruise schedules should reinforce the rest of the airport platform: terminal guides, pre-stay
            hotels, and direct ground transportation to and from Sea-Tac.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {SEATTLE_CRUISE_TERMINALS.map((terminal) => (
              <Link key={terminal.slug} href={`/${terminal.slug}`} className="button-link secondary">
                {terminal.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <TravelProviderCards providers={providers} />
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Cruise schedule</p>
            <h2 className="mt-3 text-[2rem] leading-[1.02] tracking-[-0.03em] text-[#1a3d34]">
              Seattle cruise arrivals and departures should feed the whole airport workflow.
            </h2>
            {cruiseSchedule.entries.length > 0 ? (
              <div className="mt-6 grid gap-4">
                {cruiseSchedule.entries.map((entry, index) => (
                  <article
                    key={`${entry.shipName}-${index}`}
                    className="rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[1.15rem] font-semibold tracking-[-0.03em] text-[#123b33]">
                          {entry.shipName}
                        </h3>
                        <p className="mt-1 text-sm text-[#5a7a6e]">{entry.terminalName}</p>
                      </div>
                      <div className="text-right">
                        {entry.arrivingAt ? (
                          <p className="text-sm text-[#123b33]">Arrives: {entry.arrivingAt}</p>
                        ) : null}
                        {entry.departingAt ? (
                          <p className="text-sm text-[#5a7a6e]">Departs: {entry.departingAt}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link href={`/${entry.terminalSlug}`} className="button-link secondary">
                        Terminal guide
                      </Link>
                      {entry.terminalSlug === "bell-street-cruise-terminal-pier-66" ? (
                        <Link href="/seatac-to-pier-66" className="button-link primary">
                          Airport transfer
                        </Link>
                      ) : (
                        <Link href="/seatac-to-pier-91" className="button-link primary">
                          Airport transfer
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] p-5">
                <p className="text-sm leading-7 text-[#5a7a6e]">
                  {cruiseSchedule.error ??
                    "Cruise schedule tracking is scaffolded, but no live vessel entries were returned yet."}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[2.2rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)] lg:p-8">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">Cruise planning</p>
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
