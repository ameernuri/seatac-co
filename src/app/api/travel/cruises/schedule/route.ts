import { NextResponse } from "next/server";

import { getSeattleCruiseSchedule } from "@/lib/travel/cruise-tracking";

export async function GET() {
  const result = await getSeattleCruiseSchedule();

  return NextResponse.json(result);
}
