import { NextResponse } from "next/server";

import { searchTransferzRides } from "@/lib/travel/transferz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pickupLabel =
    searchParams.get("pickup")?.trim() || "Seattle-Tacoma International Airport";
  const dropoffLabel = searchParams.get("dropoff")?.trim() || "Downtown Seattle";
  const pickupAt = searchParams.get("pickupAt")?.trim();
  const passengers = Number.parseInt(searchParams.get("passengers") ?? "2", 10);

  if (!pickupAt) {
    return NextResponse.json({ error: "pickupAt is required." }, { status: 400 });
  }

  const result = await searchTransferzRides({
    pickupLabel,
    dropoffLabel,
    pickupAt,
    passengers: Number.isFinite(passengers) && passengers > 0 ? passengers : 2,
  });

  return NextResponse.json(result);
}
