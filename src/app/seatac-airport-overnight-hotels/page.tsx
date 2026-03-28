import type { Metadata } from "next";

import { HotelClusterPageScreen } from "@/components/hotel-cluster-page-screen";
import { getHotelClusterPage } from "@/lib/hotel-clusters";
import { buildSeatacMetadata } from "@/lib/seo";

const slug = "seatac-airport-overnight-hotels";
const page = getHotelClusterPage(slug);

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: page?.title ?? "Sea-Tac overnight hotels | seatac.co",
    description: page?.description ?? "Sea-Tac overnight hotel transfers.",
    path: `/${slug}`,
  }),
};

export default function SeatacAirportOvernightHotelsPage() {
  return <HotelClusterPageScreen slug={slug} />;
}
