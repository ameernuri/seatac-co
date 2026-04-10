import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildSeatacMetadata,
} from "@/lib/seo";

const pageTitle = "Sea-Tac airport guide | seatac.co";
const pageDescription =
  "Use the Sea-Tac airport guide to plan arrival timing, checkpoints, maps, ground transportation, light rail, hotel shuttles, and the next Seattle planning page to use.";
const pagePath = "/seatac-airport-guide";

const planningCards = [
  {
    title: "Checkpoint timing and airport arrival windows",
    summary:
      "SEA tells domestic travelers to arrive two hours before departure and international travelers three hours before departure. It also flags the busiest drive and checkpoint periods before 9 a.m., from 2 to 5 p.m., and from 9 to 11 p.m.",
    primaryHref: "/departures",
    primaryLabel: "Sea-Tac departures",
    supportHref: "/arrivals",
    supportLabel: "Sea-Tac arrivals",
  },
  {
    title: "Maps, terminals, and finding the right checkpoint",
    summary:
      "SEA publishes terminal maps, printable directories, and checkpoint details. One helpful rule: all gates are accessible from any checkpoint, so the best checkpoint is often the shortest one rather than the one closest to your airline sign.",
    primaryHref: "/airlines/alaska-at-seatac",
    primaryLabel: "Airline and terminal guide",
    supportHref: "/seatac-airport-transfer-guide",
    supportLabel: "Airport transfer guide",
  },
  {
    title: "Ground transportation, hotel shuttles, and light rail",
    summary:
      "Ride-share and taxis pick up on the third floor of the parking garage. Hotel courtesy shuttles use Islands 1 and 2 on that same level. Link light rail uses SeaTac/Airport Station, which connects to the terminal area by a pedestrian bridge.",
    primaryHref: "/seatac-hotel-transfer-guide",
    primaryLabel: "Hotel transfer guide",
    supportHref: "/seatac-parking-guide",
    supportLabel: "Parking guide",
  },
] as const;

const decisionSteps = [
  {
    title: "Start here when the airport question is still bigger than the route question",
    body:
      "Use this page before booking when the traveler still needs to decide how early to arrive, where to meet a ride, whether a hotel shuttle makes sense, or which next planning page should guide the trip.",
  },
  {
    title: "Use the shortest checkpoint, not the nearest checkpoint",
    body:
      "SEA notes that all gates are reachable from any checkpoint. That changes the usual first-timer instinct: the best checkpoint is often the one with the better line, not the one nearest the airline counter.",
  },
  {
    title: "Separate airport orientation from the final destination decision",
    body:
      "After the airport basics are clear, move into the page that matches the real destination: airport hotels, downtown Seattle, Bellevue and the Eastside, cruise terminals, parking, arrivals, or departures.",
  },
] as const;

const quickAnswers = [
  {
    title: "Domestic departure rule of thumb",
    body: "Plan to arrive about two hours before departure, then adjust upward if the travel window lands in one of SEA's peak periods.",
  },
  {
    title: "International departure rule of thumb",
    body: "Plan to arrive about three hours before departure and treat check-in, baggage, and checkpoint time as separate parts of the airport arrival window.",
  },
  {
    title: "Where rides and hotel shuttles start",
    body: "Use the third floor of the parking garage for taxis, ride-share, and the Ground Transportation Plaza; hotel courtesy shuttles use Islands 1 and 2 there.",
  },
  {
    title: "When Link is the right fallback",
    body: "Link is the cleanest transit backup when the final destination is downtown-oriented. It matters less when the trip still ends with a Bellevue or hotel-area last mile.",
  },
] as const;

const faqEntries = [
  {
    question: "How early should I arrive at Sea-Tac?",
    answer:
      "SEA says domestic travelers should arrive two hours before departure and international travelers should arrive three hours before departure. The airport also warns that drive and checkpoint demand is busiest before 9 a.m., from 2 to 5 p.m., and from 9 to 11 p.m.",
  },
  {
    question: "Do I need to use the checkpoint closest to my gate or airline?",
    answer:
      "No. SEA states that all gates are accessible from any checkpoint. Travelers should usually choose the checkpoint with the better line or screening option rather than the one that looks geographically closest to the airline counter.",
  },
  {
    question: "Where do ride-share, taxis, and hotel courtesy shuttles pick up at Sea-Tac?",
    answer:
      "Visit Seattle's transportation guide places taxis and ride-share on the third floor of the SEA parking garage. It also notes that hotel courtesy shuttles use Islands 1 and 2 on that same third-floor level.",
  },
  {
    question: "Is light rail directly connected to the airport?",
    answer:
      "Yes. Sound Transit says the pedestrian bridge at SeaTac/Airport Station is open 24 hours a day and gives pedestrian access from the lot, across the sky bridge, and into the terminal area.",
  },
  {
    question: "What should I do after I finish the airport basics?",
    answer:
      "Move into the page that matches the next decision: arrivals or departures timing, airport hotel planning, parking, downtown Seattle transfers, Bellevue and Eastside transfers, cruise transfers, or a specific airline guide.",
  },
];

const relatedLinks = [
  { label: "Sea-Tac airport FAQ", href: "/seatac-airport-faq" },
  { label: "Sea-Tac departures", href: "/departures" },
  { label: "Sea-Tac arrivals", href: "/arrivals" },
  { label: "Sea-Tac airport transfer guide", href: "/seatac-airport-transfer-guide" },
  { label: "Sea-Tac hotel transfer guide", href: "/seatac-hotel-transfer-guide" },
  { label: "Sea-Tac parking guide", href: "/seatac-parking-guide" },
  { label: "Downtown Seattle airport transfer guide", href: "/downtown-seattle-airport-transfer-guide" },
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

export default function SeatacAirportGuidePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Sea-Tac airport guide", path: pagePath },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqEntries);
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Sea-Tac airport guide",
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
            Airport orientation
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-emerald-950 md:text-6xl">
            Sea-Tac airport guide for checkpoint timing, maps, rides, and next-step Seattle planning.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Use this as the first-stop guide when the traveler knows the trip runs through
            Sea-Tac but still needs to sort out airport timing, terminal navigation, ground
            transportation, hotel shuttles, Link light rail, or the next Seattle planning page to use.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/departures"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Start with departures
            </Link>
            <Link
              href="/seatac-airport-transfer-guide"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
            >
              See airport transfer guide
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {planningCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Core planning lane
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-emerald-950">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={card.primaryHref}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
                >
                  {card.primaryLabel}
                </Link>
                <Link
                  href={card.supportHref}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800"
                >
                  {card.supportLabel}
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
              How to use this guide
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
              Fast facts
            </p>
            <div className="mt-6 space-y-5">
              {quickAnswers.map((item) => (
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
                Move into the next airport, route, hotel, or utility page.
              </h2>
            </div>
            <Link
              href="/reserve"
              className="text-sm font-semibold text-emerald-800 transition hover:text-emerald-900"
            >
              Reserve after planning
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-white hover:text-emerald-800"
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
