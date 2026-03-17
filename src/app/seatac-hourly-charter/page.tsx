import type { Metadata } from "next";

import { RoutePageScreen } from "@/components/route-page-screen";
import { getRouteMetadata, getRoutePage } from "@/lib/route-pages";

const slug = "seatac-hourly-charter";

export const metadata: Metadata = getRouteMetadata(getRoutePage(slug));

export default function SeaTacHourlyCharterPage() {
  return <RoutePageScreen slug={slug} />;
}
