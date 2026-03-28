import type { Metadata } from "next";

import { AirportUtilityPageScreen } from "@/components/airport-utility-page-screen";
import { getAirportUtilityPage } from "@/lib/airport-utilities";
import { buildSeatacMetadata } from "@/lib/seo";

const page = getAirportUtilityPage("arrivals");

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: "Sea-Tac arrivals guide | seatac.co",
    description: page?.description ?? "Arrival planning for Sea-Tac pickups, terminal flow, and post-landing transportation.",
    path: "/arrivals",
  }),
};

export const dynamic = "force-dynamic";

export default function ArrivalsPage() {
  return <AirportUtilityPageScreen slug="arrivals" />;
}
