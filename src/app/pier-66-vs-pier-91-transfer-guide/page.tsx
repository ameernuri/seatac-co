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

const pageTitle = "Pier 66 vs Pier 91 transfer guide | seatac.co";
const pageDescription =
  "Compare Pier 66 vs Pier 91 transfer planning from Sea-Tac, including terminal differences, hotel staging, luggage timing, and the right airport route for your Seattle cruise day.";
const pagePath = "/pier-66-vs-pier-91-transfer-guide";

const terminalCards = [
  {
    title: "Pier 66",
    terminalName: "Bell Street Cruise Terminal",
    area: "Downtown waterfront",
    bestFor: "walkable waterfront hotels, downtown pre-cruise stays, and Bell Street sailings",
    routeHref: "/seatac-to-pier-66",
    routeLabel: "Sea-Tac to Pier 66",
    guideHref: "/bell-street-cruise-terminal-pier-66",
    guideLabel: "Pier 66 terminal guide",
    summary:
      "Pier 66 is the simpler fit when your cruise plan is tied to the downtown waterfront. It stays closer to Pike Place, Belltown, and Seattle hotel inventory that travelers often use before embarkation.",
  },
  {
    title: "Pier 91",
    terminalName: "Smith Cove Cruise Terminal",
    area: "Smith Cove / northwest Seattle",
    bestFor: "major homeport sailings, heavier family luggage, and direct cruise-day transfers",
    routeHref: "/seatac-to-pier-91",
    routeLabel: "Sea-Tac to Pier 91",
    guideHref: "/smith-cove-cruise-terminal-pier-91",
    guideLabel: "Pier 91 terminal guide",
    summary:
      "Pier 91 is a different Seattle cruise terminal and should be planned as its own airport transfer. It is not interchangeable with Pier 66 and usually rewards tighter timing on embarkation morning.",
  },
] as const;

const comparisonRows = [
  {
    label: "Terminal identity",
    pier66: "Bell Street Cruise Terminal",
    pier91: "Smith Cove Cruise Terminal",
  },
  {
    label: "Typical staging area",
    pier66: "Downtown waterfront and Belltown hotels",
    pier91: "Direct airport transfer or wider Seattle hotel staging",
  },
  {
    label: "Best day-before strategy",
    pier66: "Stay near the waterfront if you want a shorter downtown cruise morning",
    pier91: "Give yourself more routing margin and heavier luggage planning",
  },
  {
    label: "Most common mistake",
    pier66: "Booking the wrong terminal because the sailing is only described as “Seattle cruise terminal”",
    pier91: "Assuming it is basically the same transfer as Pier 66",
  },
] as const;

const planningSteps = [
  {
    title: "Confirm the exact terminal before you book the ride",
    body:
      "Seattle cruise travelers often know the cruise line but not the terminal. The first step is to confirm whether your sailing uses Bell Street at Pier 66 or Smith Cove at Pier 91.",
  },
  {
    title: "Choose the route page that matches your actual embarkation point",
    body:
      "Once the terminal is confirmed, use the matching route page so the airport transfer opens with the correct terminal already selected instead of trying to explain it later in a generic booking flow.",
  },
  {
    title: "Plan the transfer together with the hotel and luggage decision",
    body:
      "Cruise transfer planning works better when the airport route, hotel stay, bag count, and sailing-day timing are treated as one decision instead of four separate ones.",
  },
] as const;

const faqEntries = [
  {
    question: "Is Pier 66 the same terminal as Pier 91?",
    answer:
      "No. Pier 66 and Pier 91 are separate Seattle cruise terminals. Pier 66 is Bell Street Cruise Terminal on the downtown waterfront, while Pier 91 is Smith Cove Cruise Terminal farther northwest.",
  },
  {
    question: "How do I know which cruise terminal I need from Sea-Tac?",
    answer:
      "Check the terminal name on your cruise confirmation or use the terminal guide pages on seatac.co. The transfer should be booked to the exact terminal, not just to a generic “Seattle cruise terminal.”",
  },
  {
    question: "Should I choose a different hotel area for Pier 66 vs Pier 91?",
    answer:
      "Usually yes. Pier 66 works well with waterfront and downtown hotel stays, while Pier 91 often benefits from a simpler direct transfer plan or a hotel strategy that leaves more room for luggage and morning timing.",
  },
  {
    question: "Can I compare both terminals before booking a ride?",
    answer:
      "Yes. This comparison page is meant to help you decide whether your airport transfer should be planned around Bell Street at Pier 66 or Smith Cove at Pier 91 before you enter the booking flow.",
  },
];

const relatedLinks = [
  { label: "Sea-Tac to Pier 66", href: "/seatac-to-pier-66" },
  { label: "Sea-Tac to Pier 91", href: "/seatac-to-pier-91" },
  { label: "Pier 66 terminal guide", href: "/bell-street-cruise-terminal-pier-66" },
  { label: "Pier 91 terminal guide", href: "/smith-cove-cruise-terminal-pier-91" },
  { label: "Cruise pre-stay hotels", href: "/seatac-to-cruise-pre-stay-hotels" },
  { label: "Reserve online", href: "/reserve" },
] as const;

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: pageTitle,
    description: pageDescription,
    path: pagePath,
  }),
};

export default function Pier66VsPier91TransferGuidePage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Pier 66 vs Pier 91 transfer guide", path: pagePath },
  ]);

  const faqJsonLd = buildFaqJsonLd(faqEntries);
  const collectionJsonLd = buildCollectionPageJsonLd(
    "Pier 66 vs Pier 91 transfer guide",
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
            Seattle cruise planning
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-emerald-950 md:text-6xl">
            Pier 66 vs Pier 91 transfer planning from Sea-Tac.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            If you know you are sailing from Seattle but are not sure which cruise terminal changes
            the airport transfer, start here. Pier 66 and Pier 91 are separate terminals with
            different hotel patterns, different morning logistics, and different route pages.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/seatac-to-pier-66"
              className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              View Pier 66 route
            </Link>
            <Link
              href="/seatac-to-pier-91"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
            >
              View Pier 91 route
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {terminalCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                {card.title}
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
                {card.terminalName}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{card.summary}</p>
              <div className="mt-6 space-y-3 rounded-[1.5rem] bg-slate-50 p-5">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-emerald-950">Area:</span> {card.area}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-emerald-950">Best fit:</span> {card.bestFor}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={card.routeHref}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-white"
                >
                  {card.routeLabel}
                </Link>
                <Link
                  href={card.guideHref}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800"
                >
                  {card.guideLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Terminal comparison
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
                Use the terminal difference to choose the right transfer page.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              The purpose of this page is not to replace the route pages. It is to make sure you
              pick the correct one before you book.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200">
            <div className="grid grid-cols-[0.95fr_1fr_1fr] bg-emerald-50/60 px-5 py-4 text-sm font-semibold text-emerald-950">
              <span>Decision point</span>
              <span>Pier 66</span>
              <span>Pier 91</span>
            </div>
            {comparisonRows.map((row, index) => (
              <div
                key={row.label}
                className={`grid grid-cols-[0.95fr_1fr_1fr] gap-4 px-5 py-4 text-sm leading-7 ${
                  index !== comparisonRows.length - 1 ? "border-t border-slate-100" : ""
                }`}
              >
                <div className="font-semibold text-emerald-950">{row.label}</div>
                <div className="text-slate-600">{row.pier66}</div>
                <div className="text-slate-600">{row.pier91}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm lg:p-10">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              How to plan it
            </p>
            <div className="mt-6 space-y-6">
              {planningSteps.map((step) => (
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
            Cruise terminal FAQ
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
    </EditorialGuideShell>
  );
}
