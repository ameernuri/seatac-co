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
        <section className="route-hero">
          <div className="section-inner route-hero-grid">
            <aside className="route-scene-card">
              <div
                className="route-scene-art"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(9,10,13,0.08) 0%, rgba(9,10,13,0.55) 65%, rgba(9,10,13,0.92) 100%), url(${page.art})`,
                }}
              />
              <div className="route-scene-copy">
                <span className="section-kicker">Primary route</span>
                <h2>{page.primaryRoute}</h2>
                <p>{page.routeNote}</p>
              </div>
            </aside>
            <div className="route-hero-copy">
              <span className="eyebrow">{page.heroEyebrow}</span>
              <h1 className="display-title route-display-title">{page.heroTitle}</h1>
              <p>{page.heroBody}</p>
              <p className="mt-4 max-w-[52rem] text-base leading-7 text-[#45675d]">
                {page.description}
              </p>
              <div className="hero-actions">
                <Link
                  href={reserveHref ?? (reservationPanel ? "#reserve-form" : "/reserve")}
                  className="button-link primary"
                >
                  Reserve this route
                </Link>
                <Link href={siteChrome.reservationPhoneHref} className="button-link secondary">
                  Call reservations
                </Link>
              </div>
              <div className="route-mini-pills">
                {page.idealFor.map((item) => (
                  <span key={item} className="hero-tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section route-summary-section">
          <div className="section-inner route-summary-grid">
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
          <section className="section route-reserve-section" id="reserve-form">
            <div className="section-inner">
              <div className="route-reserve-shell">
                <div className="route-reserve-copy">
                  <span className="section-kicker">Reserve this ride</span>
                  <h2 className="section-title">Send your route, timing, and pickup details directly from this page.</h2>
                  <p className="section-copy">
                    Choose the date, route, and trip details below, then finish
                    the reservation without leaving this page.
                  </p>
                </div>
                <div className="booking-panel font-sans">{reservationPanel}</div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="section">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">Why riders book this route</span>
                <h2 className="section-title">Direct transportation for the trip you already know you need.</h2>
              </div>
            </div>
            <div className="route-reason-grid">
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
          <section className="section">
            <div className="section-inner">
              <div className="section-heading section-heading-tight">
                <div>
                  <span className="section-kicker">Related planning</span>
                  <h2 className="section-title">Keep moving through the Sea-Tac route cluster.</h2>
                </div>
              </div>
              <div className="route-summary-grid">
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

        <section className="section">
          <div className="section-inner">
            <div className="section-heading section-heading-tight">
              <div>
                <span className="section-kicker">FAQs</span>
                <h2 className="section-title">Quick answers before you book.</h2>
              </div>
            </div>
            <div className="route-faq-grid">
              {page.faqs.map((faq) => (
                <HomeSurfaceNoteCard
                  key={faq.question}
                  title={faq.question}
                  body={faq.answer}
                  className="route-faq-card"
                />
              ))}
            </div>
            <div className="mt-8">
              <Link href="/" className="button-link secondary">
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
