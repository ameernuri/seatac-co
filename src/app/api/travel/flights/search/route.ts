import { NextResponse } from "next/server";

import { searchSkyscannerFlights } from "@/lib/travel/skyscanner";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const originIata = searchParams.get("origin")?.trim().toUpperCase() || "SEA";
  const destinationIata = searchParams.get("destination")?.trim().toUpperCase() || "LAX";
  const departDate = searchParams.get("departDate")?.trim();
  const returnDate = searchParams.get("returnDate")?.trim() || null;
  const adults = Number.parseInt(searchParams.get("adults") ?? "1", 10);

  if (!departDate) {
    return NextResponse.json({ error: "departDate is required." }, { status: 400 });
  }

  const result = await searchSkyscannerFlights({
    originIata,
    destinationIata,
    departDate,
    returnDate,
    adults: Number.isFinite(adults) && adults > 0 ? adults : 1,
    cabinClass: "economy",
  });

  return NextResponse.json(result);
}
