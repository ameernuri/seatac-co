import { RoutePageScreen } from "@/components/route-page-screen";
import { getRouteMetadata, getRoutePage } from "@/lib/route-pages";

const slug = "seatac-to-pier-91";
const page = getRoutePage(slug);

export const dynamic = "force-dynamic";
export const metadata = getRouteMetadata(page);

export default function SeatacToPier91Page() {
  return <RoutePageScreen slug={slug} />;
}
