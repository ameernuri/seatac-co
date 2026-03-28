import Link from "next/link";

import { getCoverageLinks } from "@/lib/coverage-links";
import { coverageAreas, siteChrome } from "@/lib/site-content";
import { SiteBrand } from "@/components/site-brand";

export function SiteFooter() {
  const coverageLinks = getCoverageLinks(coverageAreas);
  const popularSearchLinks = [
    { label: "Sea-Tac airport car service", href: "/seatac-airport-car-service" },
    { label: "Sea-Tac airport hotels", href: "/seatac-airport-hotels" },
    { label: "Sea-Tac to Bellevue car service", href: "/seatac-to-bellevue" },
    { label: "Sea-Tac to downtown Seattle", href: "/seatac-to-downtown-seattle" },
    { label: "Sea-Tac to Pier 66", href: "/seatac-to-pier-66" },
    { label: "Sea-Tac departures", href: "/departures" },
  ] as const;

  return (
    <footer className="mx-auto mt-16 max-w-[1240px] px-6 pb-10 lg:px-8">
      <div className="grid gap-10 rounded-[2.4rem] border border-[#0d5c48]/8 bg-white px-7 py-10 shadow-[0_4px_24px_rgba(13,92,72,0.06)] lg:grid-cols-[1.2fr_1fr] lg:px-10">
        <div className="space-y-4">
          <div className="space-y-3">
            <SiteBrand compact />
            <p className="text-[0.75rem] uppercase tracking-[0.24em] text-[#4a9b7f]">
              {siteChrome.footer.eyebrow}
            </p>
          </div>
          <h2 className="max-w-xl text-[2.2rem] leading-[1.05] tracking-[-0.03em] text-[#1a3d34]">
            {siteChrome.footer.title}
          </h2>
          <p className="max-w-xl text-lg leading-8 text-[#5a7a70]">
            {siteChrome.footer.body}
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="mb-4 text-[0.75rem] uppercase tracking-[0.34em] text-[#4a9b7f]">
              Coverage
            </p>
            <ul className="space-y-2 text-sm text-[#5a7a70]">
              {coverageLinks.map((area) => (
                <li key={area.label}>
                  <Link href={area.href} className="transition-colors hover:text-[#0d5c48]">
                    {area.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[0.75rem] uppercase tracking-[0.34em] text-[#4a9b7f]">
              Popular searches
            </p>
            <ul className="space-y-2 text-sm text-[#5a7a70]">
              {popularSearchLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-[#0d5c48]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 text-sm text-[#5a7a70]">
            <p className="text-[0.75rem] uppercase tracking-[0.34em] text-[#4a9b7f]">
              Contact
            </p>
            <p>{siteChrome.footer.contactPhone}</p>
            <p>{siteChrome.footer.contactEmail}</p>
            {siteChrome.footer.operatingHours ? (
              <p className="rounded-xl border border-[#0d5c48]/8 bg-[#f8f7f4] px-3 py-2 text-[#4f6e63]">
                {siteChrome.footer.operatingHours}
              </p>
            ) : null}
            <div className="flex flex-col gap-1 pt-3 text-[#4f6e63]">
              <Link href="/privacy" className="transition-colors hover:text-[#0d5c48]">
                Privacy policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-[#0d5c48]">
                Terms of service
              </Link>
              <Link href="/sms-policy" className="transition-colors hover:text-[#0d5c48]">
                SMS policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
