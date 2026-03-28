import type { Metadata } from "next";

import { AirportUtilityPageScreen } from "@/components/airport-utility-page-screen";
import { getAirportUtilityPage } from "@/lib/airport-utilities";
import { buildSeatacMetadata } from "@/lib/seo";

const page = getAirportUtilityPage("departures");

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: "Sea-Tac departures guide | seatac.co",
    description: page?.description ?? "Departure planning for Sea-Tac check-in timing, pickup windows, and airport transportation.",
    path: "/departures",
  }),
};

export const dynamic = "force-dynamic";

export default function DeparturesPage() {
  return <AirportUtilityPageScreen slug="departures" />;
}
