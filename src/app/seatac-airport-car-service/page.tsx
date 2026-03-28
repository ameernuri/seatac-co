import type { Metadata } from "next";

import { RoutePageScreen } from "@/components/route-page-screen";
import { getRouteMetadata, getRoutePage } from "@/lib/route-pages";

const pageData = getRoutePage("seatac-airport-car-service");

export const metadata: Metadata = getRouteMetadata(pageData);
export const dynamic = "force-dynamic";

export default async function SeaTacAirportCarServicePage() {
  return <RoutePageScreen slug="seatac-airport-car-service" />;
}
