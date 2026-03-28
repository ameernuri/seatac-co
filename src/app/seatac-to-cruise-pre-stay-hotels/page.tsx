import type { Metadata } from "next";

import { HotelClusterPageScreen } from "@/components/hotel-cluster-page-screen";
import { getHotelClusterPage } from "@/lib/hotel-clusters";
import { buildSeatacMetadata } from "@/lib/seo";

const slug = "seatac-to-cruise-pre-stay-hotels";
const page = getHotelClusterPage(slug);

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: page?.title ?? "Sea-Tac to cruise pre-stay hotels | seatac.co",
    description: page?.description ?? "Cruise pre-stay hotel transfers from Sea-Tac.",
    path: `/${slug}`,
  }),
};

export default function SeatacToCruisePreStayHotelsPage() {
  return <HotelClusterPageScreen slug={slug} />;
}
