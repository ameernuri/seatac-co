import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildSeatacMetadata,
} from "@/lib/seo";

const pageTitle = "Sea-Tac parking guide and airport comparison | seatac.co";
const pageDescription =
  "Compare Sea-Tac parking, park-and-fly hotel stays, Link rail, and direct rides so you can choose the right airport plan before leaving for SEA.";
const pagePath = "/seatac-parking-guide";

const comparisonCards = [
  {
    title: "Airport garage parking",
    summary:
      "Best when you need your own car waiting on return and want the shortest walk into the terminal.",
    goodFor: "short trips, carry-on travelers, and late-night arrivals",
  },
  {
    title: "Park-and-fly hotel stays",
    summary:
      "Useful for early flights, long drives to Sea-Tac, or travelers who want to sleep near the airport before departure.",
    goodFor: "overnight departures and long-stay parking decisions",
  },
  {
    title: "Private ride to Sea-Tac",
    summary:
      "Removes parking and shuttle decisions entirely. The best fit when the airport trip is timed, shared across multiple travelers, or paired with hotel/cruise luggage.",
    goodFor: "families, cruise travelers, and scheduled pickups",
  },
] as const;

const planningQuestions = [
  {
    question: "How long are you leaving the car?",
    answer:
      "The longer the trip, the more likely park-and-fly or direct rides become competitive with airport parking once garage rates, gas, and shuttle time are counted together.",
  },
  {
    question: "Do you have an early departure or late arrival?",
    answer:
      "Very early flights and late-night returns usually benefit from simpler logistics: an airport hotel stay, a planned private ride, or the shortest possible parking-to-terminal walk.",
  },
  {
    question: "Are you traveling with multiple bags or a cruise transfer?",
    answer:
      "Heavy luggage changes the tradeoff. Parking plus terminal hauling is often less convenient than a direct ride, especially if the airport trip is only one leg of a hotel or cruise itinerary.",
  },
] as const;

const faqEntries = [
  {
    question: "Is airport parking or a private ride usually better for Sea-Tac?",
    answer:
      "It depends on trip length, parking rates, and how much baggage you are moving. For short solo trips, airport parking can be simpler. For multi-day trips, groups, cruise departures, or hotel stays, a private ride often removes the bigger hassle.",
  },
  {
    question: "When does a park-and-fly hotel make sense near Sea-Tac?",
    answer:
      "Park-and-fly hotel stays are most useful before early flights, after long drives into Seattle, or when one night near the airport creates a calmer departure morning than rushing through traffic from farther out.",
  },
  {
    question: "Should I compare parking with my hotel and cruise plans too?",
    answer:
      "Yes. Travelers often make the airport decision in isolation, but the better comparison includes the hotel stay, cruise terminal transfer, pickup timing, and how much gear has to move with you.",
  },
  {
    question: "Where can I compare Sea-Tac rides and airport hotel options?",
    answer:
      "Use the linked route and hotel planning pages on seatac.co to compare airport transfers, nearby hotel clusters, and direct Sea-Tac booking options before deciding between parking and a ride.",
  },
];

const relatedLinks = [
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
            Sea-Tac parking, rides, hotel stays, and airport tradeoffs in one guide.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            This page is for the traveler deciding whether to drive, park, stay near the airport,
            or book a direct ride. The right answer depends on trip length, baggage, hotel plans,
            and whether the airport is only one stop in a larger Seattle itinerary.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
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
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Quick comparison
            </p>
            <dl className="mt-6 space-y-5">
              <div className="border-b border-slate-100 pb-5">
                <dt className="text-sm font-semibold text-emerald-950">Shortest terminal walk</dt>
                <dd className="mt-2 text-sm text-slate-600">Airport garage parking</dd>
              </div>
              <div className="border-b border-slate-100 pb-5">
                <dt className="text-sm font-semibold text-emerald-950">Least airport friction</dt>
                <dd className="mt-2 text-sm text-slate-600">Direct private ride</dd>
              </div>
              <div className="border-b border-slate-100 pb-5">
                <dt className="text-sm font-semibold text-emerald-950">Best for very early flights</dt>
                <dd className="mt-2 text-sm text-slate-600">Park-and-fly hotel or scheduled ride</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-emerald-950">Best if airport is one stop in a larger plan</dt>
                <dd className="mt-2 text-sm text-slate-600">
                  Compare the ride with your hotel and cruise transfers together, not separately.
                </dd>
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
            Use the airport decision that fits the whole trip, not just the drive in.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/85">
            If the Sea-Tac plan also includes a hotel stay, a cruise terminal, or a fixed pickup
            window, compare the full route and reserve the airport ride directly.
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
  );
}
