import Link from "next/link";

import { publicAdminUrl } from "@/lib/public-env";
import { coverageAreas, siteChrome } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#0a0a0d]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.2fr_1fr] lg:px-10">
        <div className="space-y-4">
          <p className="font-sans text-[0.75rem] uppercase tracking-[0.34em] text-primary/75">
            {siteChrome.footer.eyebrow}
          </p>
          <h2 className="max-w-xl font-sans text-[2.25rem] font-semibold leading-[1.08] text-[#f2e6d4]">
            {siteChrome.footer.title}
          </h2>
          <p className="max-w-xl text-lg leading-8 text-[#b9b1a4]">
            {siteChrome.footer.body}
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <p className="mb-4 font-sans text-[0.75rem] uppercase tracking-[0.34em] text-primary/75">
              Coverage
            </p>
            <ul className="space-y-2 text-sm text-[#b9b1a4]">
              {coverageAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 text-sm text-[#b9b1a4]">
            <p className="font-sans text-[0.75rem] uppercase tracking-[0.34em] text-primary/75">
              Contact
            </p>
            <p>{siteChrome.footer.contactPhone}</p>
            <p>{siteChrome.footer.contactEmail}</p>
            <Link href={publicAdminUrl} className="inline-block text-primary">
              Admin dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
