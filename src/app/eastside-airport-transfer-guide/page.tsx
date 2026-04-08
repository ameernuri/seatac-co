import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildSeatacMetadata,
} from "@/lib/seo";

const pageTitle = "Eastside airport transfer guide | seatac.co";
const pageDescription =
  "Use the Eastside airport transfer guide to choose the right Sea-Tac plan for Bellevue, Kirkland, and Redmond rides, hotel arrivals, business travel, and transit fallback.";
const pagePath = "/eastside-airport-transfer-guide";

const eastsideUseCases = [
  {
    title: "Bellevue hotel and office arrivals",
    summary:
      "Bellevue is the cleanest Eastside airport transfer because the direct car-service route, hotel pages, and downtown circulation options are already well defined. Start here when the airport ride ends in the Bellevue core, a business hotel, or the office corridor.",
    primaryHref: "/seatac-to-bellevue",
    primaryLabel: "Sea-Tac to Bellevue",
    supportHref: "/seatac-to/hyatt-regency-bellevue",
    supportLabel: "Hyatt Regency Bellevue transfer",
  },
  {
    title: "Kirkland and north-of-Bellevue stays",
    summary:
      "Kirkland trips are still Eastside transfers, but they behave differently after the airport leg. Residential pickups, waterfront hotels, and downtown parking/logistics matter more than a simple Bellevue-style office arrival.",
    primaryHref: "/seatac-to-kirkland",
    primaryLabel: "Sea-Tac to Kirkland",
    supportHref: "/arrivals",
    supportLabel: "Arrival timing guide",
  },
  {
    title: "Redmond, campuses, and transit fallback",
    summary:
      "Some Redmond-bound travelers can use airport transit plus local last-mile options, while others should skip the transfer chain and book direct from Sea-Tac. This guide is meant to help decide which pattern actually fits the trip.",
    primaryHref: "/seatac-airport-car-service",
    primaryLabel: "Airport car service",
    supportHref: "/departures",
    supportLabel: "Departure timing guide",
  },
] as const;

const decisionPoints = [
  {
    title: "Use the Eastside guide when “Seattle” is too broad",
    body:
      "Bellevue, Kirkland, and Redmond all sit on the Eastside, but they do not work like downtown Seattle arrivals. If the airport trip is crossing the lake rather than ending downtown, start here before choosing the exact route page.",
  },
  {
    title: "Separate airport transit fallback from the real destination decision",
    body:
      "The Sea-Tac Airport station and Eastside bus options matter, but they do not solve the last-mile problem by themselves. This guide helps travelers decide when transit is still practical and when a direct ride saves too much friction to ignore.",
  },
  {
    title: "Treat Bellevue differently from Kirkland and Redmond",
    body:
      "Bellevue has the cleanest hotel and office transfer pattern. Kirkland and Redmond often add more local circulation and parking decisions after the airport ride, so the best airport plan depends on where the traveler is actually finishing the trip.",
  },
  {
    title: "Let timing and luggage change the decision",
    body:
      "Late-night arrivals, early-morning departures, family travel, cruise luggage, and business baggage all make multi-step transit much less attractive. This guide should help the traveler make the realistic choice instead of the theoretical cheapest one.",
  },
] as const;

const localLogistics = [
  {
    title: "Sea-Tac pickup rules come first",
    body:
      "Use the official Port of Seattle ground transportation guidance when the traveler needs app-based pickup, rideshare, taxi, or a direct handoff point before the Eastside leg begins.",
  },
  {
    title: "Bellevue can be easier after the airport leg",
    body:
      "Downtown Bellevue has stronger visitor-facing circulation support than most Eastside destinations, including BellHop coverage in the core, which can change the last-mile equation for some stays.",
  },
  {
    title: "Kirkland and Redmond require clearer last-mile planning",
    body:
      "North-of-Bellevue arrivals often need more deliberate planning around downtown parking, residential pickups, and where the traveler actually wants to end the trip after leaving Sea-Tac.",
  },
] as const;

const faqEntries = [
  {
    question: "What is the best page for an Eastside airport transfer from Sea-Tac?",
    answer:
      "Start with this Eastside guide when the destination is Bellevue, Kirkland, or Redmond but the best route is still unclear. Then move into the Bellevue or Kirkland route page once the trip logic is specific enough to book directly.",
  },
  {
    question: "When should I book a direct ride instead of using transit to the Eastside?",
    answer:
      "A direct ride makes more sense when the trip lands late, leaves very early, includes luggage-heavy travelers, or ends in a hotel, office tower, home, or neighborhood that adds too much last-mile friction after the airport train or bus.",
  },
  {
    question: "Does Bellevue work differently from Kirkland and Redmond for airport transfers?",
    answer:
      "Yes. Bellevue has a cleaner hotel and office arrival pattern and more visitor-oriented downtown circulation. Kirkland and Redmond often need more planning after the airport leg, which changes whether transit fallback is practical.",
  },
  {
    question: "What official sources should travelers trust when planning an Eastside airport trip?",
    answer:
      "Use the Port of Seattle for airport pickup and ground transportation rules, Sound Transit for airport rail and Route 560 guidance, and Eastside destination or city pages for local circulation and parking information.",
  },
];

const relatedLinks = [
  { label: "Sea-Tac to Bellevue", href: "/seatac-to-bellevue" },
  { label: "Sea-Tac to Kirkland", href: "/seatac-to-kirkland" },
  { label: "Sea-Tac airport transfer guide", href: "/seatac-airport-transfer-guide" },
  { label: "Hyatt Regency Bellevue transfer", href: "/seatac-to/hyatt-regency-bellevue" },
  { label: "Arrival timing guide", href: "/arrivals" },
  { label: "Reserve online", href: "/reserve" },
] as const;

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: pageTitle,
    description: pageDescription,
    path: pagePath,
  }),
};

export default function EastsideAirportTransferGuidePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Eastside airport transfer guide", path: pagePath },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqEntries);
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Eastside airport transfer guide",
    pageDescription,
    pagePath,
    relatedLinks.map((link) => ({ name: link.label, path: link.href })),
  );

  return (
    <main className="bg-[#f8f9fa] text-slate-900">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 lg:px-8">
        <div className="rounded-[2.5rem] border border-emerald-100 bg-white px-8 py-12 shadow-sm lg:px-12 lg:py-16">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Eastside route planning
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-emerald-950 md:text-6xl">
            Eastside airport transfer guide for Bellevue, Kirkland, Redmond, and Sea-Tac return trips.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Use this page when the Sea-Tac trip is crossing into Bellevue, Kirkland, or Redmond
            and you still need to decide whether the best next step is a direct airport ride, a
            hotel-specific transfer page, or a transit fallback with better local planning.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/seatac-to-bellevue"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Start with Bellevue route
            </Link>
            <Link
              href="/reserve"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
            >
              Reserve online
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {eastsideUseCases.map((useCase) => (
            <article
              key={useCase.title}
              className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Best fit
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-emerald-950">
                {useCase.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{useCase.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={useCase.primaryHref}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
                >
                  {useCase.primaryLabel}
                </Link>
                <Link
                  href={useCase.supportHref}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800"
                >
                  {useCase.supportLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              How to choose
            </p>
            <div className="mt-6 space-y-6">
              {decisionPoints.map((point) => (
                <div key={point.title} className="rounded-[1.5rem] bg-slate-50 p-5">
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-emerald-950">
                    {point.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{point.body}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Local logistics
            </p>
            <div className="mt-6 space-y-5">
              {localLogistics.map((item) => (
                <div key={item.title} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                  <h2 className="text-sm font-semibold text-emerald-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-2 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Related pages
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
                Use the exact Eastside route or planning page that matches the trip.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              This support guide narrows the Eastside decision. The next click should take the
              traveler into the real destination page, hotel page, or timing page behind the ride.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-emerald-200 hover:bg-white hover:shadow-sm"
              >
                <span className="flex items-center justify-between text-base font-semibold text-emerald-950">
                  {link.label}
                  <span aria-hidden className="text-emerald-600 transition group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
