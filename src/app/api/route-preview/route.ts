import { NextResponse } from "next/server";

import { fetchGoogleRoutePreview } from "@/lib/route-preview";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        destination?: string;
        origin?: string;
      }
    | null;

  const origin = String(payload?.origin ?? "").trim();
  const destination = String(payload?.destination ?? "").trim();

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "Origin and destination are required." },
      { status: 400 },
    );
  }

  const result = await fetchGoogleRoutePreview(origin, destination);

  if (!result.preview) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.preview);
}
