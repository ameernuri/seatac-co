import Link from"next/link";

import { getCoverageLinks } from"@/lib/coverage-links";
import { coverageAreas, siteChrome } from"@/lib/site-content";
import { SiteBrand } from"@/components/site-brand";

export function SiteFooter() {
 const coverageLinks = getCoverageLinks(coverageAreas);
 const popularSearchLinks = [
 { label:"Reserve airport rides", href:"/rides"},
 { label:"Sea-Tac airport car service", href:"/seatac-airport-car-service"},
 { label:"Sea-Tac to Pier 66", href:"/seatac-to-pier-66"},
 { label:"Sea-Tac to Pier 91", href:"/seatac-to-pier-91"},
 { label:"Sea-Tac to Bellevue", href:"/seatac-to-bellevue"},
 { label:"Sea-Tac to downtown Seattle", href:"/seatac-to-downtown-seattle"},
 { label:"Sea-Tac hotel rides", href:"/seatac-hotel-transfer-guide"},
 { label:"Downtown hotel transfers", href:"/seatac-to-downtown-seattle-hotels"},
 { label:"Sea-Tac airport guide", href:"/seatac-airport-guide"},
 { label:"Sea-Tac airport FAQ", href:"/seatac-airport-faq"},
 { label:"Sea-Tac airport transfer guide", href:"/seatac-airport-transfer-guide"},
 { label:"Sea-Tac departures", href:"/departures"},
 { label:"Downtown Seattle transfer guide", href:"/downtown-seattle-airport-transfer-guide"},
 { label:"Eastside airport transfer guide", href:"/eastside-airport-transfer-guide"},
 ] as const;

 return (
 <footer className="mx-auto mt-8 max-w-[1240px] px-4 pb-36 lg:mt-16 lg:px-8 lg:pb-10">
 <div className="grid gap-4 rounded-[1.5rem] border border-emerald-100 bg-white px-5 py-5 shadow-sm lg:grid-cols-[1.2fr_1fr] lg:gap-10 lg:rounded-[2.4rem] lg:px-10 lg:py-10">
 <div className="space-y-2 lg:space-y-4">
 <div className="space-y-1 lg:space-y-3">
 <div className="hidden lg:block">
 <SiteBrand compact />
 </div>
 <p className="text-[0.65rem] uppercase tracking-[0.24em] text-emerald-600 lg:text-[0.75rem]">
 {siteChrome.footer.eyebrow}
 </p>
 </div>
 <h2 className="max-w-xl text-base font-medium leading-snug text-emerald-950 lg:text-[2.2rem] lg:leading-[1.05]">
 {siteChrome.footer.title}
 </h2>
 <p className="hidden max-w-xl text-sm leading-relaxed text-slate-500 lg:block lg:text-lg lg:leading-8">
 {siteChrome.footer.body}
 </p>
 </div>
 <div className="grid gap-8 sm:grid-cols-3 lg:gap-10">
 <div className="hidden sm:block">
 <p className="mb-3 text-[0.65rem] uppercase tracking-[0.34em] text-emerald-600 lg:mb-4 lg:text-[0.75rem]">
 Coverage
 </p>
 <ul className="space-y-1.5 text-xs text-slate-500 lg:space-y-2 lg:text-sm">
 {coverageLinks.map((area) => (
 <li key={area.label}>
 <Link href={area.href} className="transition-colors hover:text-emerald-700">
 {area.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 <div className="hidden sm:block">
 <p className="mb-3 text-[0.65rem] uppercase tracking-[0.34em] text-emerald-600 lg:mb-4 lg:text-[0.75rem]">
 Popular searches
 </p>
 <ul className="space-y-1.5 text-xs text-slate-500 lg:space-y-2 lg:text-sm">
 {popularSearchLinks.map((link) => (
 <li key={link.label}>
 <Link href={link.href} className="transition-colors hover:text-emerald-700">
 {link.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 <div className="space-y-2 text-xs text-slate-500 lg:space-y-3 lg:text-sm">
 <p className="text-[0.65rem] uppercase tracking-[0.34em] text-emerald-600 lg:text-[0.75rem]">
 Contact
 </p>
 <p>{siteChrome.footer.contactPhone}</p>
 <p>{siteChrome.footer.contactEmail}</p>
 {siteChrome.footer.operatingHours ? (
 <p>
 {siteChrome.footer.operatingHours}
 </p>
 ) : null}
 <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-slate-600 lg:flex-col lg:gap-1 lg:pt-3">
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
