import Link from "next/link";

import { SeatacLogo } from "@/components/seatac-logo";
import { siteChrome } from "@/lib/site-content";

type SiteBrandProps = {
  compact?: boolean;
};

export function SiteBrand({ compact = false }: SiteBrandProps) {
  return (
    <Link href="/" className={`site-brand-lockup${compact ? " is-compact" : ""}`}>
      <SeatacLogo
        size={compact ? "8.8rem" : "10.25rem"}
        color="#1a3d34"
        className="site-logo-full"
      />
      <span className="site-brand-meta">
        <span className="site-brand-title">{siteChrome.brandName}</span>
      </span>
    </Link>
  );
}
