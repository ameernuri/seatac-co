import type { Metadata } from "next";

import { HotelClusterPageScreen } from "@/components/hotel-cluster-page-screen";
import { getHotelClusterPage } from "@/lib/hotel-clusters";
import { buildSeatacMetadata } from "@/lib/seo";

const page = getHotelClusterPage("seatac-to-waterfront-hotels");

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: page.title,
    description: page.description,
    path: "/seatac-to-waterfront-hotels",
  }),
};

export default function SeatacToWaterfrontHotelsPage() {
  return <HotelClusterPageScreen slug="seatac-to-waterfront-hotels" />;
}
