import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildSeatacMetadata,
} from "@/lib/seo";

const pagePath = "/seatac-airport-faq";
const pageTitle = "Sea-Tac airport FAQ | seatac.co";
const pageDescription =
  "Get quick answers about Sea-Tac checkpoints, maps, rideshare pickup, hotel shuttles, light rail, and the next airport planning page to use.";

const quickFacts = [
  {
    title: "Domestic timing",
    body: "SEA recommends arriving two hours before domestic departures, then adding margin if the trip falls into one of the airport's busiest checkpoint periods.",
  },
  {
    title: "International timing",
    body: "SEA recommends arriving three hours before international departures so check-in, document checks, and security all fit inside the airport window.",
  },
  {
    title: "Best checkpoint rule",
    body: "All gates are accessible from any checkpoint, so the shortest line often matters more than the checkpoint that looks closest to the airline sign.",
  },
  {
    title: "Ground transportation floor",
    body: "Rideshare, taxis, and the Ground Transportation Plaza use the third floor of the parking garage, while hotel courtesy shuttles use Islands 1 and 2 there.",
  },
];

const faqEntries = [
  {
    question: "How early should I get to Sea-Tac?",
    answer:
      "SEA recommends arriving two hours before domestic departures and three hours before international departures. The airport also warns that drive and checkpoint demand is busiest before 9 a.m., from 2 to 5 p.m., and from 9 to 11 p.m., so those windows usually need extra margin.",
  },
  {
    question: "Do I need to use the checkpoint closest to my gate?",
    answer:
      "No. SEA says all gates are accessible from any checkpoint. For most travelers, the practical choice is the checkpoint with the shorter line rather than the one that appears closest to the airline counter.",
  },
  {
    question: "Where do rideshare pickups, taxis, and hotel shuttles meet travelers at Sea-Tac?",
    answer:
      "Ground transportation options are centered on the third floor of the SEA parking garage. Visit Seattle's airport transportation guide places taxis, rideshare, and the Ground Transportation Plaza there, and it notes that hotel courtesy shuttles use Islands 1 and 2 on the same level.",
  },
  {
    question: "Is light rail directly connected to the airport?",
    answer:
      "Yes. Sound Transit says SeaTac/Airport Station connects to the terminal area by pedestrian bridge, which makes Link a useful downtown-oriented fallback after the airport basics are handled.",
  },
  {
    question: "Where can I find a Sea-Tac terminal map before the trip?",
    answer:
      "SEA publishes terminal maps, printable directories, and digital wayfinding resources on its maps page. That is the best starting point if you want the official layout before arriving.",
  },
  {
    question: "What page should I use after I finish the basic Sea-Tac questions?",
    answer:
      "Move into the page that matches the actual decision still left: departures timing, arrivals pickup, airport parking, hotel transfers, downtown Seattle transfers, Eastside transfers, cruise transfers, or an airline-specific guide.",
  },
  {
    question: "When is the Sea-Tac airport guide more useful than this FAQ page?",
    answer:
      "Use this FAQ page when you want quick answers fast. Use the broader Sea-Tac airport guide when you need fuller orientation, planning context, and a more complete set of next-step links.",
  },
];

const nextStepLinks = [
  { label: "Sea-Tac airport guide", href: "/seatac-airport-guide" },
  { label: "Sea-Tac departures", href: "/departures" },
  { label: "Sea-Tac arrivals", href: "/arrivals" },
  { label: "Sea-Tac airport transfer guide", href: "/seatac-airport-transfer-guide" },
  { label: "Sea-Tac parking guide", href: "/seatac-parking-guide" },
  { label: "Sea-Tac hotel transfer guide", href: "/seatac-hotel-transfer-guide" },
  { label: "Eastside airport transfer guide", href: "/eastside-airport-transfer-guide" },
  { label: "Alaska at Sea-Tac", href: "/airlines/alaska-at-seatac" },
] as const;

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: pageTitle,
    description: pageDescription,
    path: pagePath,
  }),
};

export default function SeatacAirportFaqPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Sea-Tac airport FAQ", path: pagePath },
  ]);
  const faqJsonLd = buildFaqJsonLd(faqEntries);
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Sea-Tac airport FAQ",
    pageDescription,
    pagePath,
    nextStepLinks.map((link) => ({ name: link.label, path: link.href })),
  );

  return (
    <main className="bg-[#f8f9fa] text-slate-900">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={collectionJsonLd} />

      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16 lg:px-8">
        <div className="rounded-[2.5rem] border border-emerald-100 bg-white px-8 py-12 shadow-sm lg:px-12 lg:py-16">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Airport FAQ
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-emerald-950 md:text-6xl">
            Sea-Tac airport FAQ for checkpoints, pickups, maps, and next-step planning.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Use this page when you want quick factual answers about Sea-Tac before choosing the
            deeper guide, route page, hotel page, or parking plan that fits the trip.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/seatac-airport-guide"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Open the airport guide
            </Link>
            <Link
              href="/departures"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
            >
              See departures timing
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {quickFacts.map((fact) => (
            <article
              key={fact.title}
              className="rounded-[1.5rem] border border-emerald-100 bg-white px-5 py-5 shadow-sm"
            >
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-emerald-700">
                Fast fact
              </p>
              <h2 className="mt-3 text-lg font-semibold tracking-[-0.03em] text-emerald-950">
                {fact.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{fact.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <div className="max-w-3xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Most common questions
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
              Start with the question you are trying to solve right now.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqEntries.map((faq) => (
              <article
                key={faq.question}
                className="rounded-[1.5rem] border border-emerald-100 bg-[#f8fbf9] p-6"
              >
                <h3 className="text-[1.15rem] font-semibold tracking-[-0.02em] text-emerald-950">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-2 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Next pages
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
                Move from the FAQ into the page that matches the trip decision.
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {nextStepLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[1.2rem] border border-emerald-100 bg-[#f8fbf9] px-4 py-4 text-sm font-semibold text-emerald-900 transition hover:border-emerald-200 hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
