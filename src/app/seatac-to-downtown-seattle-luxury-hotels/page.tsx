import type { Metadata } from "next";

import { HotelClusterPageScreen } from "@/components/hotel-cluster-page-screen";
import { getHotelClusterPage } from "@/lib/hotel-clusters";
import { buildSeatacMetadata } from "@/lib/seo";

const slug = "seatac-to-downtown-seattle-luxury-hotels";
const page = getHotelClusterPage(slug);

export const metadata: Metadata = {
  ...buildSeatacMetadata({
    title: page?.title ?? "Sea-Tac to downtown Seattle luxury hotels | seatac.co",
    description: page?.description ?? "Luxury downtown Seattle hotel transfers from Sea-Tac.",
    path: `/${slug}`,
  }),
};

export default function SeatacToDowntownSeattleLuxuryHotelsPage() {
  return <HotelClusterPageScreen slug={slug} />;
}
