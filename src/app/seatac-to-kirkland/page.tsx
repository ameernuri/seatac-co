import type { Metadata } from "next";

import { RoutePageScreen } from "@/components/route-page-screen";
import { getRouteMetadata, getRoutePage } from "@/lib/route-pages";

const slug = "seatac-to-kirkland";

export const metadata: Metadata = getRouteMetadata(getRoutePage(slug));
export const dynamic = "force-dynamic";

export default function SeaTacToKirklandPage() {
  return <RoutePageScreen slug={slug} />;
}
