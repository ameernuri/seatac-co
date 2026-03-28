import type { Metadata } from "next";

import { HotelClusterPageScreen } from "@/components/hotel-cluster-page-screen";
import { getHotelClusterPage } from "@/lib/hotel-clusters";
import { buildSeatacMetadata } from "@/lib/seo";

const page = getHotelClusterPage("seatac-airport-hotels");

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: page.title,
    description: page.description,
    path: "/seatac-airport-hotels",
  }),
};

export default function SeatacAirportHotelsPage() {
  return <HotelClusterPageScreen slug="seatac-airport-hotels" />;
}
