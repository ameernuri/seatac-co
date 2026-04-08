import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildSeatacMetadata,
} from "@/lib/seo";

const pageTitle = "Downtown Seattle airport transfer guide | seatac.co";
const pageDescription =
  "Use this downtown Seattle airport transfer guide to choose the right Sea-Tac route for downtown hotels, waterfront stays, cruise pre-stays, Pike Place, and return airport departures.";
const pagePath = "/downtown-seattle-airport-transfer-guide";

const downtownUseCases = [
  {
    title: "Downtown hotel arrivals",
    summary:
      "Best when the airport ride ends at a hotel in the central downtown core, Belltown, or near Pike Place. Start with the downtown route page, then use the hotel-specific pages if the stay needs more planning detail.",
    primaryHref: "/seatac-to-downtown-seattle",
    primaryLabel: "Sea-Tac to downtown Seattle",
    supportHref: "/seatac-to-downtown-seattle-hotels",
    supportLabel: "Downtown hotel transfer guide",
  },
  {
    title: "Waterfront and cruise-pre-stay planning",
    summary:
      "Use the downtown transfer cluster when the airport ride connects to waterfront hotels, Bell Street staging, or a Seattle cruise plan that still starts with a downtown overnight.",
    primaryHref: "/seatac-to-waterfront-hotels",
    primaryLabel: "Waterfront hotel transfers",
    supportHref: "/seatac-to-cruise-pre-stay-hotels",
    supportLabel: "Cruise pre-stay hotels",
  },
  {
    title: "Meetings, offices, and return departures",
    summary:
      "Downtown airport transfers also cover office towers, convention traffic, and return trips back to Sea-Tac. The better page is usually the downtown route unless the trip is really an arrivals/departures timing problem.",
    primaryHref: "/departures",
    primaryLabel: "Departure timing guide",
    supportHref: "/arrivals",
    supportLabel: "Arrival timing guide",
  },
] as const;

const decisionPoints = [
  {
    title: "Choose downtown only when the destination is really downtown",
    body:
      "Travelers often say “Seattle” when the trip is actually Bellevue, a cruise terminal, or an airport hotel. This page is meant for downtown hotel blocks, the waterfront core, office towers, and central Seattle arrivals.",
  },
  {
    title: "Use hotel pages when the stay changes the route logic",
    body:
      "If the airport transfer depends on a downtown luxury hotel, waterfront stay, or cruise-pre-stay pattern, the hotel support pages do a better job than a generic downtown route alone.",
  },
  {
    title: "Keep downtown transfer planning separate from cruise terminal planning",
    body:
      "A downtown hotel stay before a cruise is still different from the terminal transfer itself. Use this page to choose the downtown leg, then move into the Pier 66 or Pier 91 comparison if the next move is cruise-day transportation.",
  },
] as const;

const faqEntries = [
  {
    question: "What is the best page for a Sea-Tac to downtown Seattle airport transfer?",
    answer:
      "Start with the Sea-Tac to downtown Seattle route page if the destination is a downtown hotel, office, or waterfront stay. Use the related hotel pages if the trip is really about a specific downtown lodging pattern or cruise-pre-stay decision.",
  },
  {
    question: "Should I use the downtown Seattle route page or the airport car service page?",
    answer:
      "Use the downtown route page when the drop-off is in downtown Seattle. Use the main airport car service page when you still need to choose between downtown, Bellevue, airport hotels, or another airport destination cluster.",
  },
  {
    question: "Does this guide help with waterfront and cruise pre-stay hotels?",
    answer:
      "Yes. Waterfront hotel stays and downtown cruise-pre-stay plans still belong in the downtown transfer cluster before you move into terminal-specific cruise transportation.",
  },
  {
    question: "Where should I go if the problem is timing, not destination?",
    answer:
      "Use the arrivals and departures guides when the main question is pickup timing, bag claim flow, or return-airport scheduling rather than which downtown destination cluster you need.",
  },
];

const relatedLinks = [
  { label: "Sea-Tac to downtown Seattle", href: "/seatac-to-downtown-seattle" },
  { label: "Downtown Seattle hotels", href: "/seatac-to-downtown-seattle-hotels" },
  { label: "Waterfront hotel transfers", href: "/seatac-to-waterfront-hotels" },
  { label: "Cruise pre-stay hotels", href: "/seatac-to-cruise-pre-stay-hotels" },
  { label: "Sea-Tac airport car service", href: "/seatac-airport-car-service" },
  { label: "Reserve online", href: "/reserve" },
] as const;

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: pageTitle,
    description: pageDescription,
    path: pagePath,
  }),
};

export default function DowntownSeattleAirportTransferGuidePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Downtown Seattle airport transfer guide", path: pagePath },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqEntries);
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Downtown Seattle airport transfer guide",
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
            Downtown route planning
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-emerald-950 md:text-6xl">
            Downtown Seattle airport transfer guide for hotels, waterfront stays, and return departures.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Use this page when the Sea-Tac ride is going into downtown Seattle but you still need
            to decide whether the right destination page is the downtown route, a hotel support
            page, a waterfront transfer page, or an arrivals/departures planning guide.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/seatac-to-downtown-seattle"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              View downtown route
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
          {downtownUseCases.map((useCase) => (
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
              Choosing the right page
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
              Quick route logic
            </p>
            <dl className="mt-6 space-y-5">
              <div className="border-b border-slate-100 pb-5">
                <dt className="text-sm font-semibold text-emerald-950">Central hotel or office</dt>
                <dd className="mt-2 text-sm text-slate-600">Use the downtown Seattle route page.</dd>
              </div>
              <div className="border-b border-slate-100 pb-5">
                <dt className="text-sm font-semibold text-emerald-950">Waterfront or cruise-pre-stay</dt>
                <dd className="mt-2 text-sm text-slate-600">Use the waterfront or cruise-pre-stay support pages.</dd>
              </div>
              <div className="border-b border-slate-100 pb-5">
                <dt className="text-sm font-semibold text-emerald-950">Destination not really downtown</dt>
                <dd className="mt-2 text-sm text-slate-600">Go back to the airport transfer guide and choose Bellevue, hotels, or cruise routes instead.</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-emerald-950">Timing is the real issue</dt>
                <dd className="mt-2 text-sm text-slate-600">Use arrivals or departures planning before choosing the route page.</dd>
              </div>
            </dl>
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
                Use the downtown cluster pages that match the trip.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              This support guide narrows the downtown decision. The next page should carry the
              actual hotel, waterfront, route, or timing context behind the ride.
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
