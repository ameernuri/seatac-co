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
      <div className="grid gap-10 rounded-[2.4rem] border border-emerald-100 bg-white px-7 py-10 shadow-sm lg:grid-cols-[1.2fr_1fr] lg:px-10">
        <div className="space-y-4">
          <div className="space-y-3">
            <SiteBrand compact />
            <p className="text-[0.75rem] uppercase tracking-[0.24em] text-emerald-600">
              {siteChrome.footer.eyebrow}
            </p>
          </div>
          <h2 className="max-w-xl text-[2.2rem] leading-[1.05] tracking-[-0.03em] text-emerald-950">
            {siteChrome.footer.title}
          </h2>
          <p className="max-w-xl text-lg leading-8 text-slate-500">
            {siteChrome.footer.body}
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="mb-4 text-[0.75rem] uppercase tracking-[0.34em] text-emerald-600">
              Coverage
            </p>
            <ul className="space-y-2 text-sm text-slate-500">
              {coverageLinks.map((area) => (
                <li key={area.label}>
                  <Link href={area.href} className="transition-colors hover:text-emerald-700">
                    {area.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[0.75rem] uppercase tracking-[0.34em] text-emerald-600">
              Popular searches
            </p>
            <ul className="space-y-2 text-sm text-slate-500">
              {popularSearchLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-emerald-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 text-sm text-slate-500">
            <p className="text-[0.75rem] uppercase tracking-[0.34em] text-emerald-600">
              Contact
            </p>
            <p>{siteChrome.footer.contactPhone}</p>
            <p>{siteChrome.footer.contactEmail}</p>
            {siteChrome.footer.operatingHours ? (
              <p>
                {siteChrome.footer.operatingHours}
              </p>
            ) : null}
            <div className="flex flex-col gap-1 pt-3 text-slate-600">
              <Link href="/privacy" className="transition-colors hover:text-emerald-700">
                Privacy policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-emerald-700">
                Terms of service
              </Link>
              <Link href="/sms-policy" className="transition-colors hover:text-emerald-700">
                SMS policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
