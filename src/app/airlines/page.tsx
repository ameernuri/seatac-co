import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { airlineGuides, getAirlineGuideHref } from "@/lib/airlines";
import { buildCollectionPageJsonLd, buildSeatacMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: "Sea-Tac airline guides | seatac.co",
    description:
      "Airline-specific Sea-Tac guides with concourse notes, pickup timing, and direct links into airport routes and hotel pages.",
    path: "/airlines",
  }),
};

export default function AirlinesIndexPage() {
  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8 lg:py-16">
        <JsonLd
          data={buildCollectionPageJsonLd(
            "Sea-Tac airline guides",
            "Airline-specific Sea-Tac guides with concourse notes, pickup timing, and airport transfer links.",
            "/airlines",
            airlineGuides.map((airline) => ({
              name: airline.name,
              path: getAirlineGuideHref(airline.slug),
            })),
          )}
        />
        <section className="rounded-[2.6rem] border border-[#2d6a4f]/10 bg-white px-6 py-8 shadow-[0_4px_24px_rgba(45,106,79,0.06)] lg:px-10 lg:py-10">
          <div className="max-w-4xl">
            <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#5a7a6e]">
              Airline guides
            </p>
            <h1 className="mt-4 text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.92] tracking-[-0.04em] text-[#1a3d34]">
              Sea-Tac airline guides with route and pickup planning.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5a7a6e]">
              Use these airline pages to check concourse patterns, pickup timing, and the airport
              transfer routes travelers most often compare after landing at Sea-Tac.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-3">
          {airlineGuides.map((airline) => (
            <article
              key={airline.slug}
              className="rounded-[1.8rem] border border-[#2d6a4f]/10 bg-white p-6 shadow-[0_4px_20px_rgba(45,106,79,0.06)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[1.5rem] leading-[1.08] tracking-[-0.03em] text-[#123b33]">
                  {airline.name}
                </h2>
                <span className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#2d6a4f]">
                  {airline.code}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#5a7a6e]">{airline.description}</p>
              <div className="mt-4 rounded-[1.2rem] border border-[#2d6a4f]/10 bg-[#f8f7f4] px-4 py-3">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
                  Typical concourse
                </p>
                <p className="mt-1 text-base font-semibold text-[#123b33]">{airline.concourse}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {airline.bestFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-3 py-1.5 text-xs text-[#2d6a4f]"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href={getAirlineGuideHref(airline.slug)}
                className="mt-5 inline-flex items-center text-sm font-semibold text-[#2d6a4f] hover:underline"
              >
                Open airline guide →
              </Link>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
