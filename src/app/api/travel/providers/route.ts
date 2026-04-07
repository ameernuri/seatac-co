import { NextResponse } from "next/server";

import { getTravelProviderStatuses } from "@/lib/travel/provider-status";

export async function GET() {
  return NextResponse.json({
    providers: getTravelProviderStatuses(),
  });
}
