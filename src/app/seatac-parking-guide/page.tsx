import type { Metadata } from "next";
import Link from "next/link";

import { EditorialGuideShell } from "@/components/editorial-guide-shell";
import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildSeatacMetadata,
} from "@/lib/seo";

const pageTitle = "Sea-Tac parking guide: compare parking, rides, Link, and hotel stays | seatac.co";
const pageDescription =
  "Compare Sea-Tac parking with direct rides, Link light rail, and park-and-fly hotel stays so you can choose the right airport plan before leaving for SEA.";
const pagePath = "/seatac-parking-guide";

const comparisonCards = [
  {
    title: "Airport garage parking",
    summary:
      "Best when you want your own car waiting on return and you value the shortest walk from parking to the terminal.",
    goodFor: "short trips, carry-on travelers, and late-night returns",
    watchFor: "garage cost over longer trips, airport traffic, and terminal timing pressure",
  },
  {
    title: "Park-and-fly hotel stays",
    summary:
      "Useful when an airport hotel removes the stress from a very early departure, a late arrival, or a long drive in before the flight.",
    goodFor: "overnight departures, long drives to SEA, and long-stay parking decisions",
    watchFor: "hotel transfer timing, shuttle waits, and next-morning terminal logistics",
  },
  {
    title: "Private ride to Sea-Tac",
    summary:
      "Removes parking and shuttle decisions entirely. The best fit when the airport trip is timed, shared across multiple travelers, or paired with hotel or cruise luggage.",
    goodFor: "families, cruise travelers, and fixed pickup windows",
    watchFor: "pickup timing, baggage claim timing on return, and traveler count",
  },
  {
    title: "Link light rail",
    summary:
      "Best when you are traveling light, your destination is rail-friendly, and you do not need the flexibility of keeping a car at the airport.",
    goodFor: "downtown stays, solo travelers, and light luggage",
    watchFor: "last-mile transfers, stairs or elevators, and late-night schedule fit",
  },
] as const;

const planningQuestions = [
  {
    question: "How long are you leaving the car?",
    answer:
      "The longer the trip, the more likely direct rides or park-and-fly hotel combinations become competitive with airport parking once garage cost, gas, and shuttle time are counted together.",
  },
  {
    question: "Do you have an early departure or late arrival?",
    answer:
      "Very early flights and late-night returns usually benefit from simpler logistics: an airport hotel stay, a scheduled ride, or the shortest possible parking-to-terminal walk with no extra transfers.",
  },
  {
    question: "Are you traveling with multiple bags, kids, or a cruise transfer?",
    answer:
      "Heavy luggage changes the tradeoff. Parking plus terminal hauling is often less convenient than a direct ride, especially if the airport leg is only one stop in a hotel or cruise itinerary.",
  },
  {
    question: "Is your destination easy to reach from the airport without a car?",
    answer:
      "If you are going downtown or to another transit-friendly area, Link can remove the parking decision entirely. If you still need a last-mile ride or hotel transfer, compare the full chain instead of judging the rail leg by itself.",
  },
] as const;

const decisionMatrix = [
  {
    label: "Best for short solo trips",
    recommendation: "Airport garage parking",
    explanation:
      "You keep your own schedule and can often absorb the garage cost more easily over a shorter stay.",
  },
  {
    label: "Best for very early flights",
    recommendation: "Park-and-fly hotel or scheduled ride",
    explanation:
      "Both options reduce morning airport friction when timing matters more than keeping the car at SEA.",
  },
  {
    label: "Best for downtown visitors",
    recommendation: "Link or a direct ride",
    explanation:
      "If the destination is rail-friendly, Link can be simpler than driving. If baggage or timing is heavy, a direct ride is usually cleaner.",
  },
  {
    label: "Best for luggage-heavy groups",
    recommendation: "Direct private ride",
    explanation:
      "Once multiple travelers, checked bags, or cruise luggage are involved, the ride often beats parking plus terminal hauling.",
  },
] as const;

const officialInputs = [
  "SEA publishes official parking information through the airport parking program.",
  "SEA publishes live checkpoint wait guidance, which matters because parking time is only one part of the airport morning.",
  "SEA publishes official ground transportation guidance for rideshare, taxis, hotel shuttles, and other pickup modes.",
  "Sound Transit publishes the SeaTac/Airport Station connection to the terminal area, which makes Link a practical alternative for some downtown-bound trips.",
] as const;

const faqEntries = [
  {
    question: "Is Sea-Tac parking or a private ride usually better?",
    answer:
      "It depends on trip length, baggage, and how much airport friction you want to handle yourself. For short solo trips, Sea-Tac parking can be simpler. For multi-day trips, groups, cruise departures, or hotel stays, a direct ride often removes the bigger hassle.",
  },
  {
    question: "When does a park-and-fly hotel make sense near Sea-Tac parking?",
    answer:
      "Park-and-fly hotel stays are most useful before early flights, after long drives into Seattle, or when one night near the airport creates a calmer departure morning than trying to time Sea-Tac parking from farther out.",
  },
  {
    question: "When is Link better than Sea-Tac parking?",
    answer:
      "Link is strongest when you are traveling light and heading to a rail-friendly destination like downtown Seattle. If you still need a rideshare, hotel shuttle, or luggage-heavy transfer after the train leg, compare the whole journey instead of assuming transit is automatically simpler.",
  },
  {
    question: "Should I compare parking with my hotel and cruise plans too?",
    answer:
      "Yes. Travelers often make the airport decision in isolation, but the better comparison includes the hotel stay, cruise terminal transfer, pickup timing, and how much luggage has to move with you.",
  },
  {
    question: "Where can I compare Sea-Tac parking with hotel and ride options?",
    answer:
      "Use the linked route, hotel, departures, and parking pages on seatac.co to compare airport transfers, nearby hotel clusters, and direct Sea-Tac booking options before deciding between parking and a ride.",
  },
];

const relatedLinks = [
  { label: "Compare live Sea-Tac parking inventory", href: "/parking" },
  { label: "Sea-Tac airport car service", href: "/seatac-airport-car-service" },
  { label: "Sea-Tac airport hotels", href: "/seatac-airport-hotels" },
  { label: "Sea-Tac park-and-fly hotels", href: "/park-and-fly-hotels-seatac" },
  { label: "Sea-Tac departures", href: "/departures" },
  { label: "Sea-Tac arrivals", href: "/arrivals" },
  { label: "Reserve a Sea-Tac ride", href: "/reserve" },
] as const;

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: pageTitle,
    description: pageDescription,
    path: pagePath,
  }),
};

export default function SeatacParkingGuidePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Sea-Tac parking guide", path: pagePath },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqEntries);
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Sea-Tac parking guide",
    pageDescription,
    pagePath,
    relatedLinks.map((link) => ({ name: link.label, path: link.href })),
  );

  return (
    <EditorialGuideShell>
      <main className="bg-[#f8f9fa] text-slate-900">
        <JsonLd data={breadcrumbJsonLd} />
        <JsonLd data={faqJsonLd} />
        <JsonLd data={collectionJsonLd} />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 lg:px-8">
        <div className="rounded-[2.5rem] border border-emerald-100 bg-white px-8 py-12 shadow-sm lg:px-12 lg:py-16">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Sea-Tac airport planning
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-emerald-950 md:text-6xl">
            Sea-Tac parking guide: compare parking, rides, Link, and hotel stays.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            This page is for the traveler deciding whether Sea-Tac parking is actually the best
            airport move. The right answer depends on trip length, baggage, terminal timing, hotel
            plans, and whether the airport is only one stop in a larger Seattle itinerary.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/parking"
              className="rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Compare live parking inventory
            </Link>
            <Link
              href="/reserve"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Reserve a ride instead
            </Link>
            <Link
              href="/seatac-airport-hotels"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
            >
              Compare airport hotels
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {comparisonCards.map((card) => (
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
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Watch for: {card.watchFor}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              How to decide
            </p>
            <div className="mt-6 space-y-6">
              {planningQuestions.map((item) => (
                <div key={item.question} className="rounded-[1.5rem] bg-slate-50 p-5">
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-emerald-950">
                    {item.question}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">Quick comparison</p>
            <dl className="mt-6 space-y-5">
              {decisionMatrix.map((item) => (
                <div key={item.label} className="border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                  <dt className="text-sm font-semibold text-emerald-950">{item.label}</dt>
                  <dd className="mt-2 text-sm font-medium text-emerald-800">{item.recommendation}</dd>
                  <dd className="mt-2 text-sm leading-7 text-slate-600">{item.explanation}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Official planning inputs
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
                Use official airport facts before you commit to parking.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Sea-Tac parking decisions get better when you compare the garage with checkpoint timing,
              ground transportation options, and the actual airport connection for Link.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {officialInputs.map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Related planning pages
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
                Continue the airport plan from the right page.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              Use these supporting pages if your parking choice depends on the hotel, departure
              window, or whether you are moving on to a cruise or downtown stay.
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

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Parking FAQ
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

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-6 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-200 bg-emerald-950 px-8 py-10 text-white shadow-sm lg:px-10">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Next step
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em]">
            Use the Sea-Tac parking option that fits the whole trip, not just the drive in.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/85">
            If the airport plan also includes a hotel stay, a cruise terminal, or a fixed pickup
            window, compare the full route before you lock in parking. The best airport decision is
            often the one that simplifies the rest of the trip.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/seatac-airport-car-service"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
            >
              Compare airport ride details
            </Link>
            <Link
              href="/reserve"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Go to reservation flow
            </Link>
          </div>
        </div>
      </section>
      </main>
    </EditorialGuideShell>
  );
}
