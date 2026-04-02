import Link from "next/link";
import type { ReactNode } from "react";

import {
  HomeGradientMetricCard,
  HomeSurfaceNoteCard,
} from "@/components/home-gradient-cards";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { RoutePage } from "@/lib/route-pages";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo";
import { siteChrome } from "@/lib/site-content";

export type RouteFacts = {
  label: string;
  value: string;
}[];

export function RouteLandingPage({
  page,
  reservationPanel,
  facts,
  reserveHref,
}: {
  page: RoutePage;
  reservationPanel?: ReactNode;
  facts?: RouteFacts;
  reserveHref?: string;
}) {
  const highlightItems = facts && facts.length > 0 ? facts : page.highlights;

  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main>
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "seatac.co", path: "/" },
            { name: page.primaryRoute, path: `/${page.slug}` },
          ])}
        />
        <JsonLd data={buildFaqJsonLd(page.faqs)} />
        <section className="pt-24 pb-16 px-6 lg:px-8 text-center bg-white flex flex-col items-center">
          <div className="max-w-4xl mx-auto space-y-6 pt-12 pb-16">
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-slate-500">
              {page.heroEyebrow}
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-950 leading-[1.05] tracking-tight text-balance">
              {page.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto text-balance">
              {page.heroBody}
            </p>
            <p className="text-base text-slate-400 leading-relaxed max-w-xl mx-auto font-medium">
              {page.description}
            </p>
            <div className="flex justify-center pt-6 pb-2">
              <Link
                href={reserveHref ?? (reservationPanel ? "#reserve-form" : "/reserve")}
                className="rounded-full bg-slate-900 text-white px-8 py-3.5 text-sm font-bold shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] hover:bg-slate-800 hover:scale-105 transition-all duration-300"
              >
                Reserve this route
              </Link>
            </div>
          </div>
          <div className="w-full max-w-7xl mx-auto px-4 md:px-0">
            <div className="h-[400px] md:h-[600px] w-full rounded-[2rem] overflow-hidden relative shadow-2xl shadow-slate-900/10">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${page.art})`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-12 px-6 lg:px-8 border-y border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-7xl grid gap-4 grid-cols-2 lg:grid-cols-4">
            {highlightItems.map((item) => (
              <HomeGradientMetricCard
                key={item.label}
                eyebrow={item.label}
                title={item.value}
              />
            ))}
          </div>
        </section>

        {reservationPanel ? (
          <section className="py-24 px-6 lg:px-8 bg-white" id="reserve-form">
            <div className="mx-auto max-w-5xl flex flex-col items-center">
              <div className="mb-12 text-center">
                <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">Reserve this ride</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-950 mb-4">Send your route, timing, and pickup details directly from this page.</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Choose the date, route, and trip details below, then finish
                  the reservation without leaving this page.
                </p>
              </div>
              <div className="w-full text-left">
                {reservationPanel}
              </div>
            </div>
          </section>
        ) : null}

        <section className="py-24 px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">Why riders book this route</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Direct transportation for the trip you already know you need.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {page.reasons.map((reason) => (
                <HomeSurfaceNoteCard
                  key={reason.title}
                  title={reason.title}
                  body={reason.body}
                />
              ))}
            </div>
          </div>
        </section>

        {page.relatedLinks && page.relatedLinks.length > 0 ? (
          <section className="py-24 px-6 lg:px-8 bg-white border-t border-slate-100">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12">
                <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">Related planning</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Keep moving through the Sea-Tac route cluster.</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {page.relatedLinks.map((link) => (
                  <HomeGradientMetricCard
                    key={link.href}
                    eyebrow={link.label}
                    title={link.title}
                    href={link.href}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="py-24 px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <span className="text-sm font-bold tracking-[0.25em] uppercase text-emerald-600 block mb-3">FAQs</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-950">Quick answers before you book.</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {page.faqs.map((faq) => (
                <HomeSurfaceNoteCard
                  key={faq.question}
                  title={faq.question}
                  body={faq.answer}
                />
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Link href="/" className="rounded-full px-8 py-3.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-300">
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
