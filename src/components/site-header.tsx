import Link from "next/link";
import { PhoneCall } from "lucide-react";

import { HeaderAccountMenu } from "@/components/header-account-menu";
import { siteChrome } from "@/lib/site-content";
import { SiteBrand } from "@/components/site-brand";
import { getServerSession } from "@/lib/session";
import { SeatacPrimaryButton } from "@/components/ui/seatac-primary-button";

export async function SiteHeader() {
  const session = await getServerSession();
  const userLabel = session?.user?.name?.trim().split(/\s+/)[0] || session?.user?.email || null;

  return (
    <header className="site-main-header">
      <div className="site-topbar">
        <div className="site-topbar-inner">
          <Link href={siteChrome.reservationPhoneHref} className="site-topbar-call-link md:hidden">
            <PhoneCall className="size-3.5" />
            <span>{siteChrome.reservationPhoneLabel.replace("Reservations: ", "")}</span>
          </Link>
          <div className="site-topbar-account-links">
            {userLabel ? (
              <HeaderAccountMenu label={userLabel} />
            ) : (
              <>
                <Link href="/sign-in" className="hover:text-emerald-700 transition-colors">
                  Sign in
                </Link>
                <Link href="/sign-up" className="hover:text-emerald-700 transition-colors">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="site-header-inner">
        <SiteBrand />
        <nav className="site-header-nav">
          {siteChrome.navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-emerald-700 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href={siteChrome.reservationPhoneHref} className="site-header-utility hidden md:inline-flex">
            <PhoneCall className="size-4" />
            <span>{siteChrome.reservationPhoneLabel.replace("Reservations: ", "")}</span>
          </Link>
          <SeatacPrimaryButton href="/reserve" emphasis="cta" className="px-5 py-3">
            Book ride
          </SeatacPrimaryButton>
        </div>
      </div>
    </header>
  );
}
