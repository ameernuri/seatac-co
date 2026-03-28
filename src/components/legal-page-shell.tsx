import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type LegalSection = {
  title: string;
  body: ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  updatedLabel,
  sections,
  asideTitle,
  asideItems,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  updatedLabel: string;
  sections: LegalSection[];
  asideTitle: string;
  asideItems: string[];
}) {
  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1240px] px-6 py-12 lg:px-8 lg:py-16">
        <section className="overflow-hidden rounded-[2.6rem] border border-[#0d5c48]/10 bg-[linear-gradient(135deg,#f7fbf8_0%,#ffffff_55%,#eef7f3_100%)] shadow-[0_20px_80px_rgba(13,92,72,0.08)]">
          <div className="grid gap-10 px-7 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
            <div className="space-y-5">
              <p className="text-[0.76rem] uppercase tracking-[0.34em] text-[#4a9b7f]">
                {eyebrow}
              </p>
              <h1 className="max-w-3xl text-[3rem] leading-[0.92] tracking-[-0.04em] text-[#16362f] md:text-[4.4rem]">
                {title}
              </h1>
              <div className="max-w-3xl text-lg leading-8 text-[#547367]">{intro}</div>
            </div>
            <aside className="self-start rounded-[2rem] border border-[#0d5c48]/10 bg-white/88 p-6 shadow-[0_10px_30px_rgba(13,92,72,0.06)] backdrop-blur">
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#4a9b7f]">
                {updatedLabel}
              </p>
              <p className="mt-4 text-sm uppercase tracking-[0.24em] text-[#8aa398]">
                {asideTitle}
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#4f6e63]">
                {asideItems.map((item) => (
                  <li key={item} className="rounded-2xl border border-[#0d5c48]/8 bg-[#f8fbf9] px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="mt-10 grid gap-6">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[2rem] border border-[#0d5c48]/10 bg-white px-7 py-7 shadow-[0_10px_32px_rgba(13,92,72,0.05)] lg:px-8"
            >
              <h2 className="text-[1.45rem] tracking-[-0.02em] text-[#16362f]">{section.title}</h2>
              <div className="mt-3 max-w-4xl text-[1.02rem] leading-8 text-[#547367]">
                {section.body}
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
