import Link from "next/link";

import { siteChrome } from "@/lib/site-content";

export function SiteHeader() {
  return (
    <>
      <div className="site-topbar">
        <div className="site-topbar-inner">
          <span className="truncate">{siteChrome.topbarText}</span>
          <Link href={siteChrome.reservationPhoneHref} className="hidden whitespace-nowrap lg:inline">
            {siteChrome.reservationPhoneLabel}
          </Link>
        </div>
      </div>
      <header className="site-main-header">
        <div className="site-header-inner">
          <Link href="/" className="site-brand-lockup">
            <span className="site-brand-mark">{siteChrome.brandMark}</span>
            <span className="site-brand-name">{siteChrome.brandName}</span>
          </Link>
          <nav className="site-header-nav">
            {siteChrome.navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <Link href="/reserve" className="site-header-book-link">Reserve</Link>
          </nav>
          <Link href="/reserve" className="site-header-book-link lg:hidden">Reserve</Link>
        </div>
      </header>
    </>
  );
}
