import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function EditorialGuideShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
