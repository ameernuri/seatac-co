import Link from "next/link";

import { siteChrome } from "@/lib/site-content";
import { SiteBrand } from "@/components/site-brand";

export function SiteHeader() {
  return (
    <header className="site-main-header">
      <div className="site-topbar">
        <div className="site-topbar-inner">
          <span>{siteChrome.topbarText}</span>
          <Link href={siteChrome.reservationPhoneHref} className="hidden whitespace-nowrap md:inline hover:text-[#0d5c48] transition-colors">
            {siteChrome.reservationPhoneLabel}
          </Link>
        </div>
      </div>
      <div className="site-header-inner">
        <SiteBrand />
        <nav className="site-header-nav">
          {siteChrome.navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#0d5c48] transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href={siteChrome.reservationPhoneHref} className="site-header-utility hidden md:inline-flex">
            Call
          </Link>
          <Link href="/reserve" className="site-header-book-link">
            Reserve
          </Link>
        </div>
      </div>
    </header>
  );
}
