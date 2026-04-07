import { NextResponse } from "next/server";

import { searchBookingDemandHotels } from "@/lib/booking-demand";
import { searchExpediaRapidRegions } from "@/lib/travel/expedia-rapid";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination")?.trim() || "Seattle";
  const checkin = searchParams.get("checkin")?.trim();
  const checkout = searchParams.get("checkout")?.trim();
  const adults = Number.parseInt(searchParams.get("adults") ?? "2", 10);
  const rooms = Number.parseInt(searchParams.get("rooms") ?? "1", 10);
  const query = searchParams.get("q")?.trim() || null;

  if (!checkin || !checkout) {
    return NextResponse.json({ error: "checkin and checkout are required." }, { status: 400 });
  }

  const [bookingDemand, expediaRapid] = await Promise.all([
    searchBookingDemandHotels({
      destination,
      checkin,
      checkout,
      adults: Number.isFinite(adults) && adults > 0 ? adults : 2,
      rooms: Number.isFinite(rooms) && rooms > 0 ? rooms : 1,
      query,
    }),
    searchExpediaRapidRegions(destination),
  ]);

  return NextResponse.json({
    bookingDemand,
    expediaRapid,
  });
}
