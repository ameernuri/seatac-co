import { NextResponse } from "next/server";

import { searchParkWhizParking } from "@/lib/travel/parkwhiz";
import { SEATAC_PARKING } from "@/lib/travel/seattle";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locationLabel = searchParams.get("location")?.trim() || SEATAC_PARKING.label;
  const startsAt = searchParams.get("startsAt")?.trim();
  const endsAt = searchParams.get("endsAt")?.trim();

  if (!startsAt || !endsAt) {
    return NextResponse.json({ error: "startsAt and endsAt are required." }, { status: 400 });
  }

  const result = await searchParkWhizParking({
    locationLabel,
    latitude: Number.parseFloat(searchParams.get("lat") ?? `${SEATAC_PARKING.latitude}`),
    longitude: Number.parseFloat(searchParams.get("lng") ?? `${SEATAC_PARKING.longitude}`),
    startsAt,
    endsAt,
  });

  return NextResponse.json(result);
}
