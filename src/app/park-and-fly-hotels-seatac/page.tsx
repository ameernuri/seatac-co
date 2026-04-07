import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildSeatacMetadata,
} from "@/lib/seo";

const pageTitle = "Sea-Tac park-and-fly hotels guide | seatac.co";
const pageDescription =
  "Compare Sea-Tac park-and-fly hotel planning, overnight airport stays, shuttle tradeoffs, parking vs ride decisions, and when a direct airport transfer is simpler than leaving the car.";
const pagePath = "/park-and-fly-hotels-seatac";

const decisionCards = [
  {
    title: "Stay, park, and shuttle",
    summary:
      "Useful when one overnight stay near the airport simplifies a very early departure and the hotel parking package is competitive with airport garage pricing.",
    goodFor: "long drives into Seattle, very early flights, and multi-day airport parking math",
  },
  {
    title: "Stay near Sea-Tac without parking",
    summary:
      "Sometimes the overnight hotel still helps, but the better move is to arrive by direct ride and avoid parking, shuttle timing, and terminal haul-back entirely.",
    goodFor: "couples, families, and luggage-heavy departures",
  },
  {
    title: "Skip the hotel and book the ride",
    summary:
      "If the only reason for a park-and-fly stay is morning stress, a direct ride can be the simpler answer once parking, gas, and shuttle delay are counted together.",
    goodFor: "short departures, home pickups, and airport plans that do not need a hotel night",
  },
] as const;

const checklist = [
  {
    title: "Check whether the hotel solves a real timing problem",
    body:
      "The best park-and-fly stays solve an actual departure problem: a red-eye arrival, a very early flight, a long drive to Sea-Tac, or a return late enough that you do not want the same-night drive home.",
  },
  {
    title: "Compare the total parking package, not just the room rate",
    body:
      "The room matters, but so do shuttle frequency, total parking days included, checkout timing, and how much waiting the package adds on departure morning.",
  },
  {
    title: "Compare the hotel option with a direct airport ride",
    body:
      "A park-and-fly stay competes with both Sea-Tac parking and direct transportation. The cleanest plan is whichever removes the most friction from your departure and return day.",
  },
] as const;

const faqEntries = [
  {
    question: "When does a park-and-fly hotel make the most sense near Sea-Tac?",
    answer:
      "It makes the most sense when an overnight airport stay reduces stress around a very early departure, a long drive to Sea-Tac, or a multi-day parking decision that is already part of the trip.",
  },
  {
    question: "Should I compare a park-and-fly hotel with just airport parking?",
    answer:
      "No. Compare it with airport parking, a direct airport ride, and a simple overnight airport hotel without parking. The best choice depends on total cost, shuttle friction, and how much luggage you are moving.",
  },
  {
    question: "Are Sea-Tac airport hotels and park-and-fly hotels the same thing?",
    answer:
      "Not exactly. Many airport hotels are simply overnight stays near Sea-Tac, while a park-and-fly decision adds parking and shuttle logic to the hotel choice. This page is about that combined planning question.",
  },
  {
    question: "Where should I compare the nearby airport hotel options first?",
    answer:
      "Start with the Sea-Tac airport hotel pages on seatac.co, then use this guide to decide whether the hotel should also be part of the parking plan or whether a direct ride is cleaner.",
  },
];

const relatedLinks = [
  { label: "Sea-Tac airport hotels", href: "/seatac-airport-hotels" },
  { label: "Airport overnight hotels", href: "/seatac-airport-overnight-hotels" },
  { label: "Sea-Tac parking guide", href: "/seatac-parking-guide" },
  { label: "Sea-Tac departures guide", href: "/departures" },
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

export default function ParkAndFlyHotelsSeatacPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Sea-Tac park-and-fly hotels guide", path: pagePath },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqEntries);
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Sea-Tac park-and-fly hotels guide",
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
            Airport hotel planning
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-emerald-950 md:text-6xl">
            Sea-Tac park-and-fly hotels, airport stays, and parking tradeoffs.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            This guide is for the traveler deciding whether an airport hotel should be part of the
            parking plan, part of the departure plan, or skipped entirely in favor of a direct ride
            to Sea-Tac. The best answer depends on the flight hour, the drive in, and how much
            airport friction you are trying to remove.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/seatac-airport-hotels"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Compare airport hotels
            </Link>
            <Link
              href="/seatac-parking-guide"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
            >
              Compare parking options
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {decisionCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[2rem] border border-emerald-100 bg-white p-7 shadow-sm"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Best fit
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-[-0.02em] text-emerald-950">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.summary}</p>
              <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                Good for: {card.goodFor}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              How to evaluate it
            </p>
            <div className="mt-6 space-y-6">
              {checklist.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] bg-slate-50 p-5">
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-emerald-950">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Related planning pages
            </p>
            <div className="mt-6 grid gap-4">
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
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Park-and-fly FAQ
          </p>
          <div className="mt-6 divide-y divide-slate-100">
            {faqEntries.map((faq) => (
              <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
                <h2 className="text-lg font-semibold text-emerald-950">{faq.question}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
