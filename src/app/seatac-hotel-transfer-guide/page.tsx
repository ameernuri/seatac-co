import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildSeatacMetadata,
} from "@/lib/seo";

const pageTitle = "Sea-Tac hotel transfer guide | seatac.co";
const pageDescription =
  "Use the Sea-Tac hotel transfer guide to choose between airport hotels, downtown Seattle hotels, waterfront stays, Bellevue hotels, courtesy shuttles, and direct airport rides.";
const pagePath = "/seatac-hotel-transfer-guide";

const hotelUseCases = [
  {
    title: "Airport hotels for late arrivals and early flights",
    summary:
      "Airport-area hotels work best when the goal is a short ride after landing, an overnight stop, or a simple return to Sea-Tac the next morning. This is usually the cleanest choice for red-eyes, family luggage, and very early departures.",
    primaryHref: "/seatac-airport-hotels",
    primaryLabel: "Sea-Tac airport hotels",
    supportHref: "/park-and-fly-hotels-seatac",
    supportLabel: "Park-and-fly hotel guide",
  },
  {
    title: "Downtown and waterfront stays",
    summary:
      "Choose downtown or waterfront hotels when the trip is really about central Seattle access, convention plans, waterfront dining, or a cruise-pre-stay. These trips usually need a clearer choice between transit fallback and a direct airport ride.",
    primaryHref: "/seatac-to-downtown-seattle-hotels",
    primaryLabel: "Downtown Seattle hotels",
    supportHref: "/seatac-to-waterfront-hotels",
    supportLabel: "Waterfront hotel transfers",
  },
  {
    title: "Bellevue and Eastside hotel stays",
    summary:
      "Bellevue hotels fit business trips, Eastside office visits, and travelers who want to stay outside the downtown Seattle core. Courtesy-shuttle logic matters less here than direct airport access and the last-mile decision after leaving Sea-Tac.",
    primaryHref: "/seatac-to-bellevue-hotels",
    primaryLabel: "Bellevue hotel transfers",
    supportHref: "/eastside-airport-transfer-guide",
    supportLabel: "Eastside transfer guide",
  },
] as const;

const decisionPoints = [
  {
    title: "Choose the hotel area based on the day after arrival",
    body:
      "Airport hotels optimize the night around the flight. Downtown and waterfront hotels optimize Seattle access. Bellevue optimizes Eastside business and non-downtown stays. Start with what the next day needs, not just the first airport ride.",
  },
  {
    title: "Treat hotel courtesy shuttles as one option, not the default",
    body:
      "SEA publishes the courtesy-shuttle pickup process, but a hotel shuttle is only the best choice when the route, luggage, timing, and wait profile actually fit the trip. This guide should help travelers compare that against direct rides and transit.",
  },
  {
    title: "Use transit fallback mainly for downtown-oriented stays",
    body:
      "Link light rail gives a straightforward airport connection into downtown Seattle. It is much less decisive for Bellevue, Kirkland, or Redmond hotel stays, where the last-mile problem often matters more than the airport-to-station segment.",
  },
  {
    title: "Cruise travelers should separate hotel choice from terminal choice",
    body:
      "A waterfront or downtown hotel stay before a cruise is different from the terminal transfer itself. Use hotel pages to choose the stay, then move into the Pier 66 or Pier 91 comparison page when it is time to plan embarkation-day transportation.",
  },
] as const;

const quickLogic = [
  {
    title: "Best for overnight convenience",
    body:
      "Use airport hotels when the priority is a short post-flight ride and a simple return to the terminal.",
  },
  {
    title: "Best for Seattle sightseeing or downtown meetings",
    body:
      "Use downtown or waterfront hotel pages when the stay is really about central Seattle access after the airport leg.",
  },
  {
    title: "Best for Eastside business stays",
    body:
      "Use Bellevue hotel transfers when the hotel, meeting, or office base is on the Eastside rather than in downtown Seattle.",
  },
  {
    title: "Best when parking is part of the decision",
    body:
      "Use the parking and park-and-fly guides before choosing the hotel if the traveler is also deciding whether to leave a car near the airport.",
  },
] as const;

const faqEntries = [
  {
    question: "When should I stay near Sea-Tac instead of downtown Seattle?",
    answer:
      "Stay near Sea-Tac when the trip is built around a late arrival, an early departure, a one-night stop, or a fast return to the terminal. Choose downtown Seattle when the goal is city access after the airport ride rather than airport convenience.",
  },
  {
    question: "Are hotel courtesy shuttles better than booking a direct airport ride?",
    answer:
      "Not always. Courtesy shuttles are useful when the hotel route, timing, and wait pattern fit the trip. Direct rides usually make more sense for late arrivals, heavy luggage, family groups, waterfront stays, and Eastside destinations that still need more travel after leaving the airport.",
  },
  {
    question: "What is the best hotel area for a Seattle cruise stay?",
    answer:
      "Cruise travelers often choose waterfront or downtown hotels, especially when they want to stay close to central Seattle or the Bell Street waterfront area before embarkation. Use the hotel pages first, then compare Pier 66 and Pier 91 once the terminal plan is clear.",
  },
  {
    question: "Should Bellevue hotel guests use the same transfer logic as downtown Seattle hotel guests?",
    answer:
      "No. Bellevue and the Eastside have different last-mile and circulation patterns. Downtown Seattle stays can often use rail fallback more easily, while Bellevue hotel stays are usually better framed as direct airport transfer decisions.",
  },
];

const relatedLinks = [
  { label: "Sea-Tac airport hotels", href: "/seatac-airport-hotels" },
  { label: "Sea-Tac park-and-fly hotels", href: "/park-and-fly-hotels-seatac" },
  { label: "Downtown Seattle hotel transfers", href: "/seatac-to-downtown-seattle-hotels" },
  { label: "Bellevue hotel transfers", href: "/seatac-to-bellevue-hotels" },
  { label: "Sea-Tac parking guide", href: "/seatac-parking-guide" },
  { label: "Pier 66 vs Pier 91 transfer guide", href: "/pier-66-vs-pier-91-transfer-guide" },
] as const;

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: pageTitle,
    description: pageDescription,
    path: pagePath,
  }),
};

export default function SeatacHotelTransferGuidePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Sea-Tac hotel transfer guide", path: pagePath },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqEntries);
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Sea-Tac hotel transfer guide",
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
            Hotel transfer planning
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-emerald-950 md:text-6xl">
            Sea-Tac hotel transfer guide for airport stays, downtown Seattle hotels, and Bellevue nights.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Use this guide when the airport ride depends on where you are staying. It helps you
            choose between airport hotels, downtown Seattle hotels, waterfront stays, Bellevue
            hotels, courtesy shuttles, and direct airport rides before you book the transfer.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/seatac-airport-hotels"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Browse hotel transfer pages
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
          {hotelUseCases.map((useCase) => (
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
              Quick logic
            </p>
            <div className="mt-6 space-y-5">
              {quickLogic.map((item) => (
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
                Move into the hotel cluster or route page that fits the stay.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              This guide is meant to narrow the hotel decision first. The next page should take the
              traveler into the actual hotel cluster, route, or planning page behind the stay.
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
