import Link from "next/link";

import { siteChrome } from "@/lib/site-content";

type SiteBrandProps = {
  compact?: boolean;
};

export function SiteBrand({ compact = false }: SiteBrandProps) {
  return (
    <Link href="/" className={`site-brand-lockup${compact ? " is-compact" : ""}`}>
      <img
        src="/seatac.co.svg"
        alt="Seatac Connection Logo"
        className="site-logo-full"
        style={{ width: compact ? "8.8rem" : "10.25rem", height: "auto" }}
      />
      <span className="site-brand-meta">
        <span className="site-brand-title">{siteChrome.brandName}</span>
      </span>
    </Link>
  );
}
