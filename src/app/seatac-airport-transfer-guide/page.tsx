import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildSeatacMetadata,
} from "@/lib/seo";

const pageTitle = "Sea-Tac airport transfer guide | seatac.co";
const pageDescription =
  "Use the Sea-Tac airport transfer guide to choose the right airport route for downtown Seattle, Bellevue, airport hotels, Pier 66, Pier 91, and departure-day pickups.";
const pagePath = "/seatac-airport-transfer-guide";

const routeFamilies = [
  {
    title: "Seattle city arrivals",
    bestFor: "downtown hotels, waterfront stays, meetings, and first-time Seattle visitors",
    summary:
      "If the airport ride ends in the downtown core, the first question is whether you need a direct downtown route or a more specific hotel page. Start with the downtown route when the arrival is city-first rather than terminal-first.",
    primaryHref: "/seatac-to-downtown-seattle",
    primaryLabel: "Sea-Tac to downtown Seattle",
    supportHref: "/arrivals",
    supportLabel: "Arrival timing guide",
  },
  {
    title: "Eastside and Bellevue transfers",
    bestFor: "Bellevue hotels, business trips, office towers, and Eastside return departures",
    summary:
      "Bellevue and the Eastside behave differently from downtown transfers. If the trip is hotel- or office-driven, use the Bellevue route or a specific hotel transfer page instead of treating it like a generic Seattle arrival.",
    primaryHref: "/seatac-to-bellevue",
    primaryLabel: "Sea-Tac to Bellevue",
    supportHref: "/eastside-airport-transfer-guide",
    supportLabel: "Eastside transfer guide",
  },
  {
    title: "Cruise-day airport moves",
    bestFor: "Pier 66, Pier 91, luggage-heavy trips, and cruise-pre-stay planning",
    summary:
      "Cruise travelers should choose the terminal before they choose the ride. Pier 66 and Pier 91 are different airport transfers, and the right route depends on the exact terminal, hotel area, and embarkation-day timing.",
    primaryHref: "/pier-66-vs-pier-91-transfer-guide",
    primaryLabel: "Compare Pier 66 vs Pier 91",
    supportHref: "/seatac-to-pier-66",
    supportLabel: "Sea-Tac to Pier 66",
  },
  {
    title: "Airport-first planning",
    bestFor: "Sea-Tac hotel stays, parking decisions, very early flights, and return departures",
    summary:
      "Some airport transfers are really planning questions. If the ride depends on a hotel stay, parking tradeoff, or early departure, use the airport planning pages first and then move into the route-specific booking flow.",
    primaryHref: "/seatac-hotel-transfer-guide",
    primaryLabel: "Sea-Tac hotel transfer guide",
    supportHref: "/seatac-parking-guide",
    supportLabel: "Sea-Tac parking guide",
  },
] as const;

const decisionSteps = [
  {
    title: "Start with the real destination, not just “Seattle”",
    body:
      "The airport transfer page should match the actual destination cluster: downtown Seattle, Bellevue, airport hotel, cruise terminal, or a specific hotel. That gives the booking flow and supporting content a much cleaner fit.",
  },
  {
    title: "Use planning pages when the ride depends on other logistics",
    body:
      "Parking, hotel staging, arrivals timing, and departures timing often determine the transfer choice. If those decisions are still open, use the guide pages first and then return to the route page that matches the final plan.",
  },
  {
    title: "Choose the comparison page when one route depends on another",
    body:
      "Cruise transfers, hotel transfers, and airport utility searches often need one supporting page before the actual route page. The comparison page is there to reduce ambiguity before the reservation happens.",
  },
] as const;

const faqEntries = [
  {
    question: "What is the best page to start with for Sea-Tac airport transfers?",
    answer:
      "Start with the page that matches the real destination cluster. Use the downtown route for Seattle hotel and office arrivals, the Bellevue route for Eastside trips, the cruise comparison page for Pier 66 vs Pier 91, and the planning guides when parking or hotel staging still affects the decision.",
  },
  {
    question: "Should I use an airport transfer guide before booking a ride?",
    answer:
      "Yes, especially when the trip is more than a simple airport pickup. The guide helps you choose the right route page before you enter the booking flow, which reduces route confusion and makes the final reservation more specific.",
  },
  {
    question: "How do I choose between Sea-Tac route pages and planning pages?",
    answer:
      "Use route pages when the destination is already fixed. Use planning pages when the choice still depends on parking, airport hotel stays, arrivals timing, departures timing, or cruise terminal selection.",
  },
  {
    question: "Where should I go if I need a hotel or cruise transfer from Sea-Tac?",
    answer:
      "Use the Sea-Tac airport hotels page for airport hotel clusters, the Hyatt Regency Bellevue transfer page for a specific Bellevue hotel target, and the Pier 66 vs Pier 91 guide if the airport ride is tied to a Seattle cruise departure.",
  },
];

const relatedLinks = [
  { label: "Sea-Tac airport guide", href: "/seatac-airport-guide" },
  { label: "Sea-Tac airport car service", href: "/seatac-airport-car-service" },
  { label: "Sea-Tac to downtown Seattle", href: "/seatac-to-downtown-seattle" },
  { label: "Sea-Tac to Bellevue", href: "/seatac-to-bellevue" },
  { label: "Sea-Tac airport hotels", href: "/seatac-airport-hotels" },
  { label: "Sea-Tac hotel transfer guide", href: "/seatac-hotel-transfer-guide" },
  { label: "Pier 66 vs Pier 91 transfer guide", href: "/pier-66-vs-pier-91-transfer-guide" },
  { label: "Sea-Tac departures", href: "/departures" },
] as const;

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: pageTitle,
    description: pageDescription,
    path: pagePath,
  }),
};

export default function SeatacAirportTransferGuidePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Sea-Tac airport transfer guide", path: pagePath },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqEntries);
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Sea-Tac airport transfer guide",
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
            Sea-Tac route planning
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-emerald-950 md:text-6xl">
            Sea-Tac airport transfer guide for Seattle, Bellevue, hotels, and cruise routes.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Use this page when you know the airport transfer starts at Sea-Tac but you still need
            to choose the right route, hotel page, cruise comparison page, or airport-planning
            guide before you reserve the ride.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/seatac-airport-car-service"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Start with airport car service
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
        <div className="grid gap-6 md:grid-cols-2">
          {routeFamilies.map((family) => (
            <article
              key={family.title}
              className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Best fit
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
                {family.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{family.summary}</p>
              <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                Good for: {family.bestFor}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={family.primaryHref}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
                >
                  {family.primaryLabel}
                </Link>
                <Link
                  href={family.supportHref}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800"
                >
                  {family.supportLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              How to choose
            </p>
            <div className="mt-6 space-y-6">
              {decisionSteps.map((step) => (
                <div key={step.title} className="rounded-[1.5rem] bg-slate-50 p-5">
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-emerald-950">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Quick start
            </p>
            <dl className="mt-6 space-y-5">
              <div className="border-b border-slate-100 pb-5">
                <dt className="text-sm font-semibold text-emerald-950">Fixed destination already known</dt>
                <dd className="mt-2 text-sm text-slate-600">Go straight to the matching route page.</dd>
              </div>
              <div className="border-b border-slate-100 pb-5">
                <dt className="text-sm font-semibold text-emerald-950">Airport hotel still undecided</dt>
                <dd className="mt-2 text-sm text-slate-600">Use the airport hotel cluster and park-and-fly guides first.</dd>
              </div>
              <div className="border-b border-slate-100 pb-5">
                <dt className="text-sm font-semibold text-emerald-950">Cruise terminal unclear</dt>
                <dd className="mt-2 text-sm text-slate-600">Compare Pier 66 vs Pier 91 before booking the ride.</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-emerald-950">Departure or pickup timing is the problem</dt>
                <dd className="mt-2 text-sm text-slate-600">Use arrivals, departures, and airline guides before the final route selection.</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Related pages
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
                Move into the right route or planning page next.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              This guide is meant to narrow the Sea-Tac transfer decision. These pages carry the
              specific route, terminal, hotel, or timing context once you know what needs to happen.
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

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-2 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Frequently asked questions
          </p>
          <div className="mt-6 space-y-4">
            {faqEntries.map((entry) => (
              <div key={entry.question} className="rounded-[1.5rem] bg-slate-50 p-5">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-emerald-950">
                  {entry.question}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{entry.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
