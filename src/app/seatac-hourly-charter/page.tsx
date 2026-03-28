import type { Metadata } from "next";

import { RoutePageScreen } from "@/components/route-page-screen";
import { getRouteMetadata, getRoutePage } from "@/lib/route-pages";

const slug = "seatac-hourly-charter";

export const metadata: Metadata = getRouteMetadata(getRoutePage(slug));
export const dynamic = "force-dynamic";

export default function SeaTacHourlyCharterPage() {
  return <RoutePageScreen slug={slug} />;
}
