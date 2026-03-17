import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { RoutePage } from "@/lib/route-pages";
import { siteChrome } from "@/lib/site-content";

export function RouteLandingPage({
  page,
  reservationPanel,
}: {
  page: RoutePage;
  reservationPanel?: ReactNode;
}) {
  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main>
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
              <div className="hero-actions">
                <Link
                  href={reservationPanel ? "#reserve-form" : "/reserve"}
                  className="button-link primary"
                >
                  Reserve this route
                </Link>
                <Link href={siteChrome.reservationPhoneHref} className="button-link secondary">
                  Call dispatch
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
            {page.highlights.map((item) => (
              <article key={item.label} className="quick-fact-card">
                <span>{item.label}</span>
                <strong className="text-[#f5efe5]">{item.value}</strong>
              </article>
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
                    Choose the date, route, and booking details below, then send the trip straight
                    into dispatch review and confirmation.
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
                <article key={reason.title} className="compact-note-card">
                  <h3 className="font-sans font-semibold text-[#f5efe5]">{reason.title}</h3>
                  <p>{reason.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

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
                <article key={faq.question} className="route-faq-card">
                  <h3 className="font-sans font-semibold text-[#f5efe5]">{faq.question}</h3>
                  <p>{faq.answer}</p>
                </article>
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
